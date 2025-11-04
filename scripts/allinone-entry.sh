#!/usr/bin/env bash
set -euo pipefail

# Environment defaults
: "${POSTGRES_USER:=devuser}"
: "${POSTGRES_PASSWORD:=devpass123}"
: "${POSTGRES_DB:=assessment_system}"
: "${PGDATA:=/var/lib/postgresql/data}"

# Ensure ownership
chown -R postgres:postgres "$PGDATA"

first_start=0
if [ ! -s "$PGDATA/PG_VERSION" ]; then
  echo "[allinone] Initializing PostgreSQL data directory..."
  first_start=1
  su -s /bin/bash postgres -c "initdb -D '$PGDATA' -U postgres"
  # Allow password auth for all hosts (testing/demo)
  echo "host all all 0.0.0.0/0 scram-sha-256" >> "$PGDATA/pg_hba.conf"
fi

# Start Postgres in background
su -s /bin/bash postgres -c "pg_ctl -D '$PGDATA' -o \"-c listen_addresses='*'\" -w start"

# On first start, create user/db and run seed
if [ "$first_start" -eq 1 ]; then
  echo "[allinone] Creating role/database and seeding..."
  su -s /bin/bash postgres -c "psql -v ON_ERROR_STOP=1 -U postgres -tc \"SELECT 1 FROM pg_roles WHERE rolname='${POSTGRES_USER}'\"" | grep -q 1 || \
    su -s /bin/bash postgres -c "psql -U postgres -c \"CREATE ROLE \\\"${POSTGRES_USER}\\\" LOGIN PASSWORD '${POSTGRES_PASSWORD}';\""

  su -s /bin/bash postgres -c "psql -v ON_ERROR_STOP=1 -U postgres -tc \"SELECT 1 FROM pg_database WHERE datname='${POSTGRES_DB}'\"" | grep -q 1 || \
    su -s /bin/bash postgres -c "psql -U postgres -c \"CREATE DATABASE \\\"${POSTGRES_DB}\\\" OWNER \\\"${POSTGRES_USER}\\\";\""

  if [ -f /docker-entrypoint-initdb.d/01-init.sql ]; then
    echo "[allinone] Running /docker-entrypoint-initdb.d/01-init.sql"
    su -s /bin/bash postgres -c "psql -v ON_ERROR_STOP=1 -U postgres -d '${POSTGRES_DB}' -f /docker-entrypoint-initdb.d/01-init.sql" || true
  fi

  echo "[allinone] Granting privileges to ${POSTGRES_USER}..."
  cat >/tmp/grants.sql <<EOF
ALTER SCHEMA public OWNER TO "${POSTGRES_USER}";
GRANT CONNECT ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_USER}";
GRANT USAGE ON SCHEMA public TO "${POSTGRES_USER}";
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO "${POSTGRES_USER}";
GRANT USAGE, SELECT, UPDATE ON ALL SEQUENCES IN SCHEMA public TO "${POSTGRES_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO "${POSTGRES_USER}";
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO "${POSTGRES_USER}";
EOF
  su -s /bin/bash postgres -c "psql -v ON_ERROR_STOP=1 -U postgres -d '${POSTGRES_DB}' -f /tmp/grants.sql"
fi

# Graceful shutdown of Postgres when the app exits
stop_all() {
  echo "\n[allinone] Stopping services..."
  su -s /bin/bash postgres -c "pg_ctl -D '$PGDATA' -m fast -w stop" || true
}
trap stop_all SIGINT SIGTERM EXIT

# Launch the Spring Boot app
echo "[allinone] Starting Spring Boot..."
java ${JAVA_OPTS:-} -jar /app/app.jar &
app_pid=$!

wait $app_pid
exit_code=$?

stop_all
exit $exit_code
