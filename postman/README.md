# StreamParty Planner Postman API Tests

This directory contains the Postman collection and local environment used to verify the StreamParty Planner REST API.

The collection is also used by Newman in GitHub Actions as part of the automated API verification workflow.

## Files

```text
postman/
├── StreamPartyPlanner.postman_collection.json
├── local.postman_environment.json
└── README.md
```

## What the collection tests

The Postman/Newman test suite verifies the main WatchParty API contract.

It covers:

* Backend health check
* Listing watch parties
* Creating a valid watch party
* Fetching a created watch party by id
* Updating a watch party
* Rejecting invalid create requests
* Rejecting invalid update requests
* Rejecting invalid enum values
* Deleting a watch party
* Returning `404 Not Found` for a deleted watch party

The tests validate both HTTP status codes and response bodies.

## Prerequisites

Before running the collection locally, make sure you have:

* Node.js 24 installed
* PostgreSQL running
* The Spring Boot backend running at `http://localhost:8080`

The easiest local setup is to start PostgreSQL with Docker Compose and then start the backend from the repository root.

## Local setup

From the repository root, create a local environment file if it does not already exist:

```bash
cp .env.example .env
```

Start only the PostgreSQL service:

```bash
docker compose --env-file .env up -d postgres
```

Then start the backend:

```bash
./scripts/dev-backend.sh
```

Verify that the backend is running:

```bash
curl http://localhost:8080/actuator/health
```

Expected response:

```json
{"groups":["liveness","readiness"],"status":"UP"}
```

## Run the API tests locally

From the repository root, run:

```bash
npx --yes newman@6.2.2 run postman/StreamPartyPlanner.postman_collection.json \
  -e postman/local.postman_environment.json
```

The collection uses the local environment file to target:

```text
http://localhost:8080
```

## CI usage

The same collection is executed in GitHub Actions by the API CI workflow.

In CI, the workflow starts the required database and backend services before running Newman. The workflow fails if any request, assertion or API contract check fails.

## Test data

The collection creates its own WatchParty test data during the run.

Where needed, created resource ids are stored as Postman environment variables and reused by later requests, for example when fetching, updating or deleting the created watch party.

## Notes

The API tests are intended to verify the external REST API contract.

They complement the backend JUnit tests and the Playwright end-to-end tests by checking the API through real HTTP requests.
