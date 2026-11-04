#!/usr/bin/env bash
# Local PostgreSQL for AWS Mastery Academy, using plain `docker` (no compose plugin needed).
#
#   scripts/db.sh up      start (creates the container on first run)
#   scripts/db.sh down    stop (data is kept in the ama_pgdata volume)
#   scripts/db.sh status  show container state
#   scripts/db.sh psql    open a psql shell in the app database
#
# Floci is NOT managed here. This script never starts, stops or modifies it.
set -euo pipefail

cd "$(dirname "$0")/.."
NAME=ama-postgres
IMAGE=postgres:16-alpine
VOLUME=ama_pgdata

if [[ ! -f .env ]]; then
  echo ".env not found. Run: npm run setup:env" >&2
  exit 1
fi
POSTGRES_PASSWORD=$(grep -E '^POSTGRES_PASSWORD=' .env | cut -d= -f2-)
if [[ -z "$POSTGRES_PASSWORD" || "$POSTGRES_PASSWORD" == "change-me" ]]; then
  echo "POSTGRES_PASSWORD in .env is missing or still the placeholder." >&2
  exit 1
fi

exists() { docker container inspect "$NAME" >/dev/null 2>&1; }

wait_healthy() {
  for _ in $(seq 1 60); do
    if docker exec "$NAME" pg_isready -U academy -d academy >/dev/null 2>&1; then
      echo "PostgreSQL is ready on 127.0.0.1:5433"
      return 0
    fi
    sleep 1
  done
  echo "PostgreSQL did not become ready in 60s. Logs: docker logs $NAME" >&2
  return 1
}

case "${1:-}" in
  up)
    if exists; then
      docker start "$NAME" >/dev/null
    else
      docker run -d \
        --name "$NAME" \
        --restart unless-stopped \
        --memory 256m \
        -e POSTGRES_USER=academy \
        -e POSTGRES_PASSWORD="$POSTGRES_PASSWORD" \
        -e POSTGRES_DB=academy \
        -p 127.0.0.1:5433:5432 \
        -v "$VOLUME":/var/lib/postgresql/data \
        -v "$PWD/docker/postgres/init":/docker-entrypoint-initdb.d:ro \
        --label app=aws-mastery-academy \
        "$IMAGE" >/dev/null
    fi
    wait_healthy
    ;;
  down)
    exists && docker stop "$NAME" >/dev/null && echo "Stopped $NAME (data kept in volume $VOLUME)."
    ;;
  status)
    docker ps -a --filter "name=^${NAME}$" --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
    ;;
  psql)
    docker exec -it "$NAME" psql -U academy -d academy
    ;;
  *)
    echo "Usage: scripts/db.sh {up|down|status|psql}" >&2
    exit 2
    ;;
esac
