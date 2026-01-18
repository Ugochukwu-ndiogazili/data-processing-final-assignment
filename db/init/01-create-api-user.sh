#!/bin/sh
set -e

if [ -z "$API_DB_PASSWORD" ]; then
  echo "API_DB_PASSWORD not set; skipping api_user_account creation."
  exit 0
fi

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_catalog.pg_user WHERE usename = 'api_user_account') THEN
    CREATE ROLE api_user_account LOGIN PASSWORD '${API_DB_PASSWORD}';
  ELSE
    ALTER ROLE api_user_account WITH PASSWORD '${API_DB_PASSWORD}';
  END IF;
END
\$\$;
SQL
