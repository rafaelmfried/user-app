#!/usr/bin/env sh
set -eu

: "${DATABASE_URL:?DATABASE_URL nao definido}"

MIGRATIONS_DIR="${MIGRATIONS_DIR:-./migrations}"

until psql "$DATABASE_URL" -c "select 1" >/dev/null 2>&1; do
  echo "Aguardando o banco de dados..."
  sleep 1
done

psql "$DATABASE_URL" -v ON_ERROR_STOP=1 <<'SQL'
CREATE TABLE IF NOT EXISTS schema_migrations (
  filename text primary key,
  applied_at timestamptz default now()
);
SQL

for file in "$MIGRATIONS_DIR"/*.sql; do
  [ -f "$file" ] || continue
  name="$(basename "$file")"
  applied="$(psql "$DATABASE_URL" -tAc "SELECT 1 FROM schema_migrations WHERE filename='$name'")"
  if [ "$applied" = "1" ]; then
    continue
  fi
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$file"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "INSERT INTO schema_migrations (filename) VALUES ('$name')"
  echo "Applied migration: $name"
done
