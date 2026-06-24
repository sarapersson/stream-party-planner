# StreamParty Planner Frontend

React, TypeScript and Vite frontend for StreamParty Planner.

The frontend consumes the Spring Boot WatchParty API and lets the user create, browse, update and delete stream watch parties through the UI.

## Runtime

Use Node.js 24 LTS.

The repository root `.nvmrc` is set to `24`.

## Features

The current frontend includes:

* Listing watch parties from the backend API
* Creating new watch parties
* Editing existing watch parties
* Deleting watch parties after confirmation
* Basic client-side validation before create and update requests
* User-facing error messages when loading, creating, updating or deleting fails
* Responsive layout styling for desktop and smaller screens
* Playwright end-to-end tests for core UI flows

## Local development

Start PostgreSQL and the backend from the repository root first.

Then start the frontend:

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

## Available commands

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Build the production bundle:

```bash
npm run build
```

Run ESLint:

```bash
npm run lint
```

Run Playwright end-to-end tests:

```bash
npm run test:e2e
```

Run Playwright in headed mode:

```bash
npm run test:e2e:headed
```

Preview the production build locally:

```bash
npm run preview
```

## E2E test requirements

The Playwright tests require:

* PostgreSQL running
* The backend running at `http://localhost:8080`
* The frontend available through the Playwright web server configuration

By default, Playwright starts the Vite development server at:

```text
http://127.0.0.1:5173
```

The frontend base URL can be overridden with:

```bash
E2E_BASE_URL=http://127.0.0.1:5173 npm run test:e2e
```

The API base URL used by the E2E tests can be overridden with:

```bash
E2E_API_BASE_URL=http://localhost:8080 npm run test:e2e
```

The tests create test data through the API and clean up test-created watch parties after each test run.

## Notes

This frontend does not implement authentication or authorization in the current baseline.

The UI is intentionally focused on the WatchParty CRUD flow required for the course project.
