# 🚧

# StreamParty Planner

Planned full-stack web application for planning and managing stream watch parties.

This project is built step by step as part of a DevSecOps/full-stack course project, with focus on a clear layered Spring Boot architecture, automated testing, CI/CD practices and secure development workflows.

## Current status

The repository currently contains:

- Initial repository baseline
- Spring Boot backend skeleton
- Backend health check through Spring Boot Actuator
- Backend CI for Spring Boot backend tests
- PostgreSQL local development setup with Docker Compose
- Spring Data JPA foundation and Testcontainers-backed backend context tests
- Flyway foundation for database schema migrations
- WatchParty persistence domain model and initial database migration
- WatchParty REST API baseline for CRUD use cases

The next phases will add frontend implementation, additional automated tests, security scanning and further product capabilities.

## Tech stack

Current backend setup:

- Java 25 LTS
- Spring Boot 4.1.0
- Maven Wrapper
- Spring Web MVC
- Spring Boot Actuator
- Spring Validation
- Spring Data JPA
- Flyway
- PostgreSQL 18.x
- Docker Compose for local PostgreSQL
- Testcontainers for backend integration testing
- GitHub Actions backend CI

Planned project stack:

- Node.js 24 LTS
- React 19
- TypeScript
- Vite
- Playwright

## Project structure

```text
stream-party-planner/
├── backend/
├── docs/
├── postman/
├── .github/
│   └── workflows/
├── .editorconfig
├── .gitignore
├── .gitmessage
├── .java-version
├── .nvmrc
├── .env.example
├── scripts/
├── docker-compose.yml
├── LICENSE
└── README.md
```

## Backend

The backend is located in `backend/`.

### Run tests

```bash
cd backend
./mvnw test
```

Backend tests use Testcontainers with PostgreSQL, so Docker must be running.

### Database migrations

Database schema migrations are managed with Flyway.

Hibernate schema generation remains disabled with `spring.jpa.hibernate.ddl-auto: none`.

Schema migration scripts live under `backend/src/main/resources/db/migration`.

The current schema includes the `watch_parties` table used by the backend WatchParty persistence model.

### Local configuration

`.env.example` is a committed local development template. Copy it to `.env` for local use; `.env` is ignored by Git, and the example values are local development values, not real secrets.

Docker Compose is started with `--env-file .env` so the selected local configuration is explicit. `scripts/dev-backend.sh` loads the repository-root `.env` before starting Spring Boot with the `dev` profile. The backend dev profile no longer silently falls back to database credentials, so missing local configuration fails during startup instead of using example values.

If PostgreSQL credentials are changed after the Docker volume has already been initialized, reset the local volume:

```bash
docker compose down -v
docker compose --env-file .env up -d
```

### Start the backend

```bash
cp .env.example .env
docker compose --env-file .env up -d
./scripts/dev-backend.sh
```

The backend starts on:

```text
http://localhost:8080
```

### WatchParty CRUD API baseline

The backend currently implements these WatchParty endpoints:

- `POST /api/watch-parties`
- `GET /api/watch-parties`
- `GET /api/watch-parties/{id}`
- `PUT /api/watch-parties/{id}`
- `DELETE /api/watch-parties/{id}`

The API contract is documented in `docs/API_CONTRACT.md`.

Local external API verification with Postman/Newman is documented in `postman/README.md`.

### Health check

When the backend is running:

```bash
curl http://localhost:8080/actuator/health
```

Expected response:

```json
{"groups":["liveness","readiness"],"status":"UP"}
```

## Continuous integration

Backend CI is configured with GitHub Actions.

The backend CI workflow runs Spring Boot backend tests on:

- Pushes to `main`
- Pushes to `feature/**`
- Pull requests targeting `main`
- Manual workflow dispatch

## Development workflow

Development is done through feature branches and pull requests.

The `main` branch should stay stable.

Recommended flow:

1. Create a feature branch.
2. Open a pull request.
3. Wait for CI to pass.
4. Squash and merge into `main`.
5. Delete the remote feature branch.
6. Pull latest `main` locally.
7. Delete the local feature branch.

## Security notes

- Do not commit real staging or production secrets.
- Do not commit `.env` files; use `.env.example` only for safe local development template values.
- Future CI and deployment workflows must use GitHub Actions secrets, deployment environment secrets, OIDC or a secrets manager where appropriate.
- Current backend CI does not require real secrets.

## License

This project is licensed under the MIT License.