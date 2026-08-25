#!/usr/bin/env bash
set -uo pipefail

: "${POSTGRES_DB:=emplacadora}"
: "${POSTGRES_USER:=emplacadora}"
: "${POSTGRES_PORT:=5435}"
: "${APP_PORT:=8090}"
: "${DEFAULT_ADMIN_EMAIL:=admin@emplacadora.com}"
: "${DEFAULT_ADMIN_NAME:=Administrador Padrão}"
: "${NODE_ENV:=production}"
: "${POSTGRES_HOST:=127.0.0.1}"
: "${DATABASE_URL:=}"
# Endereço em que o Postgres embutido escuta. O padrão é só dentro do container;
# use 0.0.0.0 apenas se realmente precisar publicar a porta do banco.
: "${POSTGRES_LISTEN:=127.0.0.1}"

# Mesma decisão que o server.js toma: com DATABASE_URL ou POSTGRES_HOST apontando
# para fora, o banco é externo e não há por que subir um Postgres local.
case "$POSTGRES_HOST" in
  127.0.0.1|localhost|::1) DB_MODE=embedded ;;
  *) DB_MODE=external ;;
esac
[ -n "$DATABASE_URL" ] && DB_MODE=external
export DB_MODE

# Segredos não têm valor padrão: em produção o container falha em vez de subir
# com uma senha conhecida publicamente.
if [ "$NODE_ENV" = "production" ]; then
  # Com DATABASE_URL a senha do banco vem dentro da própria URL.
  required_secrets="DEFAULT_ADMIN_PASSWORD INTEGRATION_API_KEY"
  [ -z "$DATABASE_URL" ] && required_secrets="POSTGRES_PASSWORD $required_secrets"

  missing=""
  for var in $required_secrets; do
    eval "value=\${$var:-}"
    [ -z "$value" ] && missing="$missing $var"
  done

  if [ -n "$missing" ]; then
    echo "[start.sh] Variáveis obrigatórias ausentes em produção:$missing"
    echo "[start.sh] Defina-as no ambiente de deploy e suba o container novamente."
    exit 1
  fi
else
  : "${POSTGRES_PASSWORD:=emplacadora123}"
  : "${DEFAULT_ADMIN_PASSWORD:=123456}"
  : "${INTEGRATION_API_KEY:=dev-integration-key}"
  export POSTGRES_PASSWORD DEFAULT_ADMIN_PASSWORD INTEGRATION_API_KEY
fi

ensure_node_dependencies() {
  if [ ! -d node_modules ] || ! node -e "require.resolve('express');require.resolve('cookie-parser');require.resolve('pg')" >/dev/null 2>&1; then
    echo "[start.sh] Dependências Node ausentes; executando npm install..."
    npm install || return 1
  fi

  return 0
}

# A versão do PostgreSQL vem da imagem, não pode ser fixada no código: quando a
# base muda de release, um caminho hardcoded quebra em silêncio e o container
# sobe sem banco.
find_pg_bindir() {
  local candidate
  for candidate in /usr/lib/postgresql/*/bin; do
    [ -x "$candidate/initdb" ] && echo "$candidate" && return 0
  done

  candidate="$(dirname "$(command -v initdb 2>/dev/null)" 2>/dev/null)"
  [ -n "$candidate" ] && [ -x "$candidate/initdb" ] && echo "$candidate" && return 0

  return 1
}

start_local_postgres() {
  export PGDATA=/var/lib/postgresql/data
  local pg_conf_file="$PGDATA/postgresql.conf"
  local pg_bin

  pg_bin="$(find_pg_bindir)" || {
    echo "[start.sh] Binários do PostgreSQL não encontrados na imagem."
    return 1
  }
  echo "[start.sh] PostgreSQL encontrado em $pg_bin"

  mkdir -p "$PGDATA"
  chown -R postgres:postgres /var/lib/postgresql

  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    su - postgres -c "$pg_bin/initdb -D '$PGDATA'" || return 1
  fi

  cat > "$pg_conf_file" <<CFG
listen_addresses = '${POSTGRES_LISTEN}'
port = ${POSTGRES_PORT}
CFG
  chown postgres:postgres "$pg_conf_file"

  if ! pg_isready -h 127.0.0.1 -p "$POSTGRES_PORT" >/dev/null 2>&1; then
    su - postgres -c "$pg_bin/pg_ctl -D '$PGDATA' -o '-c config_file=$pg_conf_file' -w start" || return 1
  fi

  export PGPASSWORD="$POSTGRES_PASSWORD"

  psql -h 127.0.0.1 -p "$POSTGRES_PORT" -U postgres -tc "SELECT 1 FROM pg_roles WHERE rolname = '${POSTGRES_USER}'" | grep -q 1 || \
    psql -h 127.0.0.1 -p "$POSTGRES_PORT" -U postgres -c "CREATE ROLE ${POSTGRES_USER} LOGIN PASSWORD '${POSTGRES_PASSWORD}'" || return 1

  psql -h 127.0.0.1 -p "$POSTGRES_PORT" -U postgres -tc "SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}'" | grep -q 1 || \
    psql -h 127.0.0.1 -p "$POSTGRES_PORT" -U postgres -c "CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER}" || return 1

  # O init.sql só garante a estrutura mínima; o admin é criado pelo servidor,
  # com a senha já em bcrypt.
  psql -h 127.0.0.1 -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -f /docker-entrypoint-initdb.d/init.sql || return 1

  echo "[start.sh] PostgreSQL local inicializado com sucesso na porta ${POSTGRES_PORT}."
  return 0
}

if ! ensure_node_dependencies; then
  echo "[start.sh] Falha ao instalar dependências Node; encerrando."
  exit 1
fi

if [ "$DB_MODE" = "external" ]; then
  echo "[start.sh] Banco externo configurado; o PostgreSQL embutido não será iniciado."
  if [ -n "$DATABASE_URL" ]; then
    echo "[start.sh] Usando DATABASE_URL."
  else
    echo "[start.sh] Usando ${POSTGRES_HOST}:${POSTGRES_PORT}."
  fi
elif ! start_local_postgres; then
  echo "[start.sh] Aviso: falha ao iniciar/configurar PostgreSQL local."
  echo "[start.sh] A API sobe mesmo assim para permitir diagnóstico pelos logs,"
  echo "[start.sh] mas /api/health responderá 503 enquanto o banco estiver fora."
fi

if [ ! -f dist/index.html ]; then
  echo "[start.sh] dist não encontrado; executando build..."
  npm run build || {
    echo "[start.sh] Falha no build; encerrando."
    exit 1
  }
fi

echo "[start.sh] Iniciando API/Web em 0.0.0.0:${APP_PORT}..."
exec npm run start
