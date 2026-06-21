# 🚧

# StreamParty Planner

Full-stack web application for planning and managing stream watch parties.

This project is built step by step as part of a DevSecOps/full-stack course project, with focus on clean architecture, automated testing, CI/CD practices and secure development workflows.

## Current status

The repository currently contains:

- Initial repository baseline
- Spring Boot backend skeleton
- Backend health check through Spring Boot Actuator
- Backend CI for Spring Boot backend tests

The next phases will add the watch party REST API, database integration, frontend implementation, additional automated tests and security scanning.

## Tech stack

Current backend setup:

- Java 25 LTS
- Spring Boot 4.1.0
- Maven Wrapper
- Spring Web MVC
- Spring Boot Actuator
- Spring Validation
- GitHub Actions backend CI

Planned project stack:

- PostgreSQL 18.x
- Node.js 24 LTS
- React 19
- TypeScript
- Vite
- Playwright

## Project structure

```text
stream-party-planner/
├── backend/
├── frontend/
├── .github/
│   └── workflows/
├── .editorconfig
├── .gitignore
├── .gitmessage
├── .java-version
├── .nvmrc
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

### Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

The backend starts on:

```text
http://localhost:8080
```

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

- Do not commit secrets
- Do not commit `.env` files
- Keep generated files, build output and local machine files out of Git
- Add validation, dependency scanning and security checks in later phases

## License

This project is licensed under the MIT License.