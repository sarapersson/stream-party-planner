# Branch Protection

This document describes the branch protection and pull request workflow for StreamParty Planner.

Branch protection is configured in GitHub as a repository ruleset and is therefore not visible from the repository files alone. This document describes the configured rules and the quality gates used before changes are merged into `main`.

## Protected Branch

The `main` branch is the protected integration branch. It is protected by the active ruleset `Protect main`, which targets the default branch and has no bypass actors, so the rules also apply to the repository owner.

The ruleset enforces:

* Changes to `main` must go through a pull request.
* All required status checks must pass before merge.
* The pull request branch must be up to date with `main` before merge.
* All review conversations must be resolved before merge.
* Force pushes to `main` are blocked.
* Deletion of `main` is blocked.

## Pull Request Workflow

The workflow is:

1. Create a branch from an up-to-date `main`.
2. Make one focused change.
3. Run relevant verification locally.
4. Open a pull request targeting `main`.
5. Wait for the required GitHub Actions checks to complete.
6. Review the changes and resolve any review conversations.
7. Squash and merge after the quality gates have passed.

## Quality Gates

The ruleset requires these checks to pass before merge:

| Workflow          | Check name                  | Purpose                                 |
| ----------------- | --------------------------- | --------------------------------------- |
| Backend CI        | `Backend tests`             | Runs the backend automated test suite   |
| API CI            | `Newman API tests`          | Verifies the external REST API contract |
| Frontend CI       | `Frontend build and lint`   | Builds the frontend and runs ESLint     |
| Playwright E2E CI | `Playwright E2E tests`      | Verifies browser-based user flows       |
| Security CI       | `Frontend dependency audit` | Checks frontend dependencies with audit |
| Security CI       | `Backend dependency audit`  | Checks backend dependencies for CVEs    |

## Code Review

The number of required approvals is set to zero because this is a single-developer project. In a team setting, pull requests should require approval from at least one other person before merge, adding a manual quality gate in addition to the automated checks.

## Security-Related Checks

Security CI is used to check dependencies before changes are accepted.

The backend dependency audit requires the repository secret `NVD_API_KEY`. If this secret is missing, the `Backend dependency audit` job fails intentionally.

## Notes

This document should be kept in sync with the ruleset configuration in the GitHub repository settings.
