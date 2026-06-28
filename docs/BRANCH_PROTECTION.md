# Branch Protection

This document describes the intended branch protection and pull request workflow for StreamParty Planner.

Branch protection is configured in GitHub and is therefore not fully visible from the repository files alone. The purpose of this document is to describe the expected repository workflow and the quality gates used before changes are merged into `main`.

## Protected Branch

The `main` branch is the protected integration branch.

Development work should be done on separate branches and merged into `main` through pull requests.

Direct pushes to `main` are not part of the normal development workflow.

## Pull Request Workflow

The intended workflow is:

1. Create a branch from an up-to-date `main`.
2. Make one focused change.
3. Run relevant verification locally.
4. Open a pull request targeting `main`.
5. Wait for relevant GitHub Actions checks to complete.
6. Request or receive code review.
7. Merge only after the configured quality gates have passed.

## Quality Gates

Branch protection is intended to use relevant CI checks as merge gates.

The project includes these checks:

| Workflow          | Check name                  | Purpose                                 |
| ----------------- | --------------------------- | --------------------------------------- |
| Backend CI        | `Backend tests`             | Runs the backend automated test suite   |
| API CI            | `Newman API tests`          | Verifies the external REST API contract |
| Frontend CI       | `Frontend build and lint`   | Builds the frontend and runs ESLint     |
| Playwright E2E CI | `Playwright E2E tests`      | Verifies browser-based user flows       |
| Security CI       | `Frontend dependency audit` | Checks frontend dependencies with audit |
| Security CI       | `Backend dependency audit`  | Checks backend dependencies for CVEs    |

## Code Review

For a review-based workflow, pull requests should require approval from another person before merge.

This supports peer review and adds a manual quality gate in addition to automated checks.

## Security-Related Checks

Security CI is used to check dependencies before changes are accepted.

The backend dependency audit requires the repository secret `NVD_API_KEY`. If this secret is missing, the `Backend dependency audit` job fails intentionally.

## Notes

The exact GitHub branch protection configuration must be verified in the GitHub repository settings.

This document describes the intended branch protection setup and should be kept in sync with the actual repository configuration.
