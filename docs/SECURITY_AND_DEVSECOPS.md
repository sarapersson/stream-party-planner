# Security and DevSecOps

This document describes the security-related DevSecOps practices used in StreamParty Planner.

The current project baseline focuses on secure development workflow, dependency verification, safe local configuration and automated quality gates.

## Security Goals

The security goals for the current baseline are:

* Avoid committing real secrets to the repository
* Keep local configuration separate from committed source code
* Verify dependencies automatically in CI
* Run automated tests before changes are merged
* Use branch protection as a quality gate
* Keep the application simple, testable and understandable

## Secrets and Configuration

The project uses a local `.env` file for development configuration.

The committed `.env.example` file contains safe example values only.

Real secrets, production credentials and private environment-specific values must not be committed.

The `.env` file is ignored by Git and should be created locally from:

```bash
cp .env.example .env
```

The backend dependency audit requires a GitHub repository secret:

```text
NVD_API_KEY
```

This secret is used by OWASP Dependency-Check to query the NVD vulnerability database reliably.

If this secret is missing, the backend dependency audit fails intentionally.

## CI/CD Security Controls

The project uses GitHub Actions to run automated verification.

The workflows include:

| Area                         | Control                          |
| ---------------------------- | -------------------------------- |
| Backend quality              | Spring Boot and JUnit tests      |
| API contract                 | Postman/Newman API tests         |
| Frontend quality             | Vite production build and ESLint |
| E2E behavior                 | Playwright browser tests         |
| Frontend dependency security | `npm audit`                      |
| Backend dependency security  | OWASP Dependency-Check           |

These controls help prevent broken, untested or vulnerable changes from being merged into `main`.

## Security Gates

The intended security and quality gates are:

* Pull requests are used before integration into `main`
* Relevant GitHub Actions checks must pass before merge
* Code review should be required before merge
* Dependency audit results are checked automatically
* Failed verification blocks the normal merge flow

The exact branch protection configuration is managed in GitHub repository settings and is documented separately in [`BRANCH_PROTECTION.md`](BRANCH_PROTECTION.md).

## GitHub Actions Hardening

The workflows use defensive defaults where possible:

* Repository permissions are limited to read access where possible
* Checkout steps use `persist-credentials: false`
* CI uses disposable test database values
* Secrets are provided through GitHub repository secrets rather than committed files

## Application Security

The current application includes basic application-level security measures:

* Backend input validation for create and update request payloads
* Controlled API error responses
* HTTP status codes for validation failures and missing resources
* Frontend error messages for failed operations
* No sensitive production data is included in the repository

The current baseline does not include authentication or authorization. This is documented as a known limitation because the application is focused on the WatchParty CRUD flow and DevSecOps verification pipeline.

## Logging and Observability

The current baseline relies on standard Spring Boot application logging and GitHub Actions logs.

Errors are surfaced through:

* Backend API error responses
* Frontend user-facing error messages
* GitHub Actions workflow logs
* Test reports and uploaded CI artifacts

Structured application logging, security event logging, metrics, alerting and external monitoring are not implemented in the current baseline.

## Privacy and Data Protection

The application stores watch party planning data only.

The current resource model stores:

* Watch party title
* Optional description
* Scheduled date and time
* Genre
* Maximum participant count
* Status
* Technical timestamps

The baseline does not store passwords, payment data, private messages or personally sensitive account data.

If the application were extended with users, authentication or invitations, privacy and access control requirements would need to be revisited.

## Known Limitations

The current baseline does not include:

* Authentication
* Authorization
* Role-based access control
* SAST scanning
* DAST scanning
* Container image scanning
* Deployment gates
* Production deployment
* Structured security logging
* External monitoring or alerting

These are suitable future improvements after the core full-stack application, automated tests and CI verification have been established.

## Future Improvements

Possible future DevSecOps improvements include:

* Add CodeQL or Semgrep for SAST
* Add container image scanning if container images are published
* Add deployment to a staging environment
* Add smoke tests after deployment
* Add structured logging
* Add authentication and authorization
* Add role-based access control
* Add monitoring, metrics and alerting
* Add OpenAPI documentation generation
