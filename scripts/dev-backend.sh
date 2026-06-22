#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "Missing .env file. Copy .env.example to .env and adjust local values if needed." >&2
  exit 1
fi

line_number=0

while IFS= read -r line || [[ -n "$line" ]]; do
  line_number=$((line_number + 1))
  line="${line%$'\r'}"

  if [[ -z "$line" || "$line" =~ ^[[:space:]]*$ || "$line" =~ ^[[:space:]]*# ]]; then
    continue
  fi

  if [[ ! "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*= ]]; then
    echo "Invalid .env entry on line $line_number." >&2
    echo "Use simple KEY=value entries without spaces around '='." >&2
    exit 1
  fi

  export "$line"
done < "$ENV_FILE"

: "${SPRING_PROFILES_ACTIVE:?SPRING_PROFILES_ACTIVE must be set in .env}"
: "${POSTGRES_HOST:?POSTGRES_HOST must be set in .env}"
: "${POSTGRES_PORT:?POSTGRES_PORT must be set in .env}"
: "${POSTGRES_DB:?POSTGRES_DB must be set in .env}"
: "${POSTGRES_USER:?POSTGRES_USER must be set in .env}"
: "${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be set in .env}"

cd "$REPO_ROOT/backend"
exec ./mvnw spring-boot:run
