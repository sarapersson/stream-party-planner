# Postman and Newman API Verification

This folder contains local external API verification for the implemented WatchParty CRUD API. The backend must already be running locally on `http://localhost:8080` before running the collection.

Start the local backend:

```bash
cp .env.example .env
docker compose up -d
cd backend
SPRING_PROFILES_ACTIVE=dev ./mvnw spring-boot:run
```

Run the Postman collection with Newman from the repository root:

```bash
newman run postman/StreamPartyPlanner.postman_collection.json \
  -e postman/local.postman_environment.json
```

The collection verifies the health endpoint and the current WatchParty CRUD API through local HTTP requests. Running Newman in CI is planned for a later phase and is not implemented here.
