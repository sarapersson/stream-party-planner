# StreamParty Planner

Full-stack application for planning and managing stream watch parties.

The project is built as a DevSecOps-focused portfolio project with a Spring Boot backend, PostgreSQL persistence, a React frontend, automated API verification, end-to-end tests and protected CI workflows.

## Status

StreamParty Planner currently includes:

* WatchParty CRUD API
* React frontend for listing, creating, updating and deleting watch parties
* PostgreSQL local development setup with Docker Compose
* Flyway-managed database migrations
* Backend tests with Testcontainers
* Postman/Newman API verification
* Playwright end-to-end tests
* GitHub Actions CI for backend, API, frontend and E2E checks

Authentication, deployment and automated security scanning are intentionally not part of the current baseline.

## Tech stack

| Area     | Stack                                              |
| -------- | -------------------------------------------------- |
| Backend  | Java 25 LTS, Spring Boot 4.1.0, Maven              |
| Database | PostgreSQL 18, Flyway, Docker Compose              |
| Frontend | Node.js 24 LTS, React 19, TypeScript, Vite         |
| Testing  | JUnit, Testcontainers, Postman, Newman, Playwright |
| CI       | GitHub Actions                                     |

## Project structure

```text
stream-party-planner/
├── backend/
├── docs/
├── frontend/
├── postman/
├── scripts/
├── .github/workflows/
├── .env.example
├── docker-compose.yml
├── LICENSE
└── README.md
```

## Local setup

This section describes how to run the complete StreamParty Planner application locally with PostgreSQL, the Spring Boot backend and the React frontend.

### Prerequisites

Install these tools before starting:

* Java 25
* Node.js 24
* Docker
* Docker Compose

The repository root `.nvmrc` is set to Node.js 24.

### 1. Clone the repository

```bash
git clone https://github.com/sarapersson/stream-party-planner.git
cd stream-party-planner
```

### 2. Create a local environment file

Copy the example environment file:

```bash
cp .env.example .env
```

The example values are intended for local development only.

Do not commit real secrets or production credentials.

### 3. Start PostgreSQL

Start the local PostgreSQL database with Docker Compose:

```bash
docker compose --env-file .env up -d
```

This starts PostgreSQL using the values from `.env`.

### 4. Start the backend

From the repository root, start the Spring Boot backend:

```bash
./scripts/dev-backend.sh
```

The backend runs at:

```text
http://localhost:8080
```

Flyway migrations run automatically when the backend starts.

### 5. Verify backend health

In another terminal, verify that the backend is running:

```bash
curl http://localhost:8080/actuator/health
```

Expected response:

```json
{"groups":["liveness","readiness"],"status":"UP"}
```

### 6. Start the frontend

Open a second terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Open the Vite development server URL shown in the terminal, normally:

```text
http://localhost:5173
```

During local development, Vite proxies `/api` requests to the backend at:

```text
http://localhost:8080
```

### 7. Try the application

With PostgreSQL, the backend and the frontend running, the UI can be used to:

* List watch parties
* Create watch parties
* Edit watch parties
* Delete watch parties after confirmation

### 8. Stop local services

Stop the PostgreSQL container when you are done:

```bash
docker compose --env-file .env down
```

To also remove the local database volume:

```bash
docker compose --env-file .env down -v
```

## API

The backend exposes the following WatchParty endpoints:

| Method   | Endpoint                  | Description                |
| -------- | ------------------------- | -------------------------- |
| `POST`   | `/api/watch-parties`      | Create a watch party       |
| `GET`    | `/api/watch-parties`      | List watch parties         |
| `GET`    | `/api/watch-parties/{id}` | Get one watch party        |
| `PUT`    | `/api/watch-parties/{id}` | Fully update a watch party |
| `DELETE` | `/api/watch-parties/{id}` | Delete a watch party       |

The full API contract is documented in [`docs/API_CONTRACT.md`](docs/API_CONTRACT.md).

## Verification

Run backend tests:

```bash
cd backend
./mvnw --batch-mode --no-transfer-progress test
```

Run local Newman API verification:

```bash
npx --yes newman@6.2.2 run postman/StreamPartyPlanner.postman_collection.json \
  -e postman/local.postman_environment.json
```

Run frontend build and lint checks:

```bash
cd frontend
npm ci
npm run build
npm run lint
```

Run local Playwright E2E tests:

```bash
cd frontend
npx playwright install chromium
npm run test:e2e
```

Local Playwright tests require PostgreSQL and the backend to be running.

## Continuous integration

The protected `main` branch requires these GitHub Actions checks before merge:

| Workflow          | Required check            |
| ----------------- | ------------------------- |
| Backend CI        | `Backend tests`           |
| API CI            | `Newman API tests`        |
| Frontend CI       | `Frontend build and lint` |
| Playwright E2E CI | `Playwright E2E tests`    |

These checks run on pull requests targeting `main` and on updates to `main`, helping keep the protected branch stable.

The current CI setup verifies build and test quality. It does not deploy the application and does not include automated security scanning yet.

## Development workflow

Development is done through focused branches and pull requests.

Recommended flow:

1. Create a branch from an up-to-date `main`.
2. Make one focused change.
3. Run relevant local verification.
4. Open a pull request.
5. Wait for required CI checks.
6. Squash and merge after review.

## Security notes

* Real secrets must not be committed.
* `.env` is local-only and ignored by Git.
* `.env.example` contains safe local development example values.
* Authentication, authorization, deployment and automated security scanning are planned separately after the current baseline is confirmed.

## License

This project is licensed under the MIT License.
