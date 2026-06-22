# Postman and Newman API Verification

This folder contains local external API verification for the implemented WatchParty CRUD API. The backend must already be running locally on `http://localhost:8080` before running the collection.

Start the local backend:

```bash
cp .env.example .env
docker compose --env-file .env up -d
./scripts/dev-backend.sh
```

Run the Postman collection with Newman from the repository root:

```bash
newman run postman/StreamPartyPlanner.postman_collection.json \
  -e postman/local.postman_environment.json
```

The collection verifies the health endpoint and the current WatchParty CRUD API through local HTTP requests.

## CI verification

The same Postman collection runs in GitHub Actions in the `Newman API tests` workflow.

CI starts the backend against an ephemeral PostgreSQL service container with disposable CI test database values. These values are not production or staging secrets.
