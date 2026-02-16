#!/usr/bin/env bash
set -euo pipefail

: "${POSTGRES_DB:=emplacadora}"
: "${POSTGRES_USER:=emplacadora}"
: "${POSTGRES_PASSWORD:=emplacadora123}"
: "${POSTGRES_PORT:=5435}"
: "${APP_PORT:=8090}"
: "${DEFAULT_ADMIN_EMAIL:=admin@emplacadora.com}"
: "${DEFAULT_ADMIN_PASSWORD:=123456}"
: "${DEFAULT_ADMIN_NAME:=Administrador Padrão}"

export PGDATA=/var/lib/postgresql/data
mkdir -p "$PGDATA"
chown -R postgres:postgres /var/lib/postgresql

if [ ! -f "$PGDATA/PG_VERSION" ]; then
  su - postgres -c "/usr/lib/postgresql/15/bin/initdb -D '$PGDATA'"
fi

cat > /tmp/postgresql.conf <<CFG
listen_addresses = '0.0.0.0'
port = ${POSTGRES_PORT}
CFG
chown postgres:postgres /tmp/postgresql.conf

su - postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D '$PGDATA' -o '-c config_file=/tmp/postgresql.conf' -w start"

stop_postgres() {
  su - postgres -c "/usr/lib/postgresql/15/bin/pg_ctl -D '$PGDATA' -m fast -w stop" || true
}
trap stop_postgres EXIT INT TERM

# operações administrativas via socket local com usuário postgres (peer auth)
su - postgres -c "psql -d postgres -tc \"SELECT 1 FROM pg_roles WHERE rolname = '${POSTGRES_USER}'\"" | grep -q 1 || \
  su - postgres -c "psql -d postgres -c \"CREATE ROLE ${POSTGRES_USER} LOGIN PASSWORD '${POSTGRES_PASSWORD}'\""

su - postgres -c "psql -d postgres -tc \"SELECT 1 FROM pg_database WHERE datname = '${POSTGRES_DB}'\"" | grep -q 1 || \
  su - postgres -c "psql -d postgres -c \"CREATE DATABASE ${POSTGRES_DB} OWNER ${POSTGRES_USER}\""

# schema e seed com o usuário da aplicação
export PGPASSWORD="$POSTGRES_PASSWORD"
psql -h 127.0.0.1 -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -d "$POSTGRES_DB" \
  -v admin_email="$DEFAULT_ADMIN_EMAIL" \
  -v admin_password="$DEFAULT_ADMIN_PASSWORD" \
  -v admin_name="$DEFAULT_ADMIN_NAME" \
  -f /docker-entrypoint-initdb.d/init.sql

exec node server.js
