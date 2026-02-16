#!/usr/bin/env bash
set -uo pipefail

: "${POSTGRES_DB:=emplacadora}"
: "${POSTGRES_USER:=emplacadora}"
: "${POSTGRES_PASSWORD:=emplacadora123}"
: "${POSTGRES_PORT:=5435}"
: "${APP_PORT:=8090}"
: "${DEFAULT_ADMIN_EMAIL:=admin@emplacadora.com}"
: "${DEFAULT_ADMIN_PASSWORD:=123456}"
: "${DEFAULT_ADMIN_NAME:=Administrador Padrão}"

ensure_node_dependencies() {
  if [ ! -d node_modules ] || ! node -e "require.resolve('express');require.resolve('cookie-parser');require.resolve('pg')" >/dev/null 2>&1; then
    echo "[start.sh] Dependências Node ausentes; executando npm ci..."
    npm ci || return 1
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

  psql -h 127.0.0.1 -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
    -v admin_email="$DEFAULT_ADMIN_EMAIL" \
    -v admin_password="$DEFAULT_ADMIN_PASSWORD" \
    -v admin_name="$DEFAULT_ADMIN_NAME" \
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
