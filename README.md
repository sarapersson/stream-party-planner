# 🚧

# StreamParty Planner

Full-stack web application for planning and managing stream watch parties.

This project is built step by step as part of a DevSecOps/full-stack course project, with focus on clean architecture, automated testing, CI/CD practices and secure development workflows.

## Current status

The repository currently contains:

- Initial repository baseline
- Spring Boot backend skeleton
- Backend health check through Spring Boot Actuator

The next phases will add the watch party REST API, database integration, frontend, automated tests, CI pipeline and security scanning.

## Tech stack

Current backend setup:

- Java 25 LTS
- Spring Boot 4.1.0
- Maven Wrapper
- Spring Web MVC
- Spring Boot Actuator
- Spring Validation

Planned project stack:

- PostgreSQL 18.x
- Node.js 24 LTS
- React 19
- TypeScript
- Vite
- Playwright
- GitHub Actions

## Project structure

```text
stream-party-planner/
├── backend/
├── frontend/
├── .github/
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

## Development workflow

Development is done through feature branches and pull requests.

The `main` branch should stay stable.

## Security notes

- Do not commit secrets
- Do not commit `.env` files
- Keep generated files, build output and local machine files out of Git
- Add validation, dependency scanning and security checks in later phases

## License

This project is licensed under the MIT License.
