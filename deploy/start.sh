#!/usr/bin/env bash
set -uo pipefail

: "${POSTGRES_DB:=emplacadora}"
: "${POSTGRES_USER:=emplacadora}"
: "${POSTGRES_PORT:=5435}"
: "${APP_PORT:=8090}"
: "${DEFAULT_ADMIN_EMAIL:=admin@emplacadora.com}"
: "${DEFAULT_ADMIN_NAME:=Administrador Padrão}"
: "${NODE_ENV:=production}"

# Segredos não têm valor padrão: em produção o container falha em vez de subir
# com uma senha conhecida publicamente.
if [ "$NODE_ENV" = "production" ]; then
  missing=""
  for var in POSTGRES_PASSWORD DEFAULT_ADMIN_PASSWORD INTEGRATION_API_KEY; do
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

start_local_postgres() {
  export PGDATA=/var/lib/postgresql/data
  local pg_conf_file="$PGDATA/postgresql.conf"

  mkdir -p "$PGDATA"
  chown -R postgres:postgres /var/lib/postgresql

  if [ ! -f "$PGDATA/PG_VERSION" ]; then
    su - postgres -c "/usr/lib/postgresql/15/bin/initdb -D '$PGDATA'" || return 1
  fi

  cat > "$pg_conf_file" <<CFG
listen_addresses = '0.0.0.0'
port = ${POSTGRES_PORT}
CFG
  chown postgres:postgres "$pg_conf_file"

  if ! pg_isready -h 127.0.0.1 -p "$POSTGRES_PORT" >/dev/null 2>&1; then
    su - postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D '$PGDATA' -o '-c config_file=$pg_conf_file' -w start" || return 1
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

if ! start_local_postgres; then
  echo "[start.sh] Aviso: falha ao iniciar/configurar PostgreSQL local."
  echo "[start.sh] O servidor Node será iniciado mesmo assim (útil com banco externo já configurado)."
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
