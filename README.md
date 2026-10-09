# DSA Visualization & Experimental Learning Platform

Full-stack React + Spring Boot web app for animated, step-by-step
visualization of data structures and algorithms.

## Structure

- `frontend/src/pages/` — route-level views, including algorithm visualizers, Race Mode,
  Challenges, Playground and Experiment.
- `frontend/src/components/` — reusable layout, visualizer, form and feedback components.
- `frontend/src/engine/` — deterministic step generators, quiz question generation and
  operation-count benchmarks. Algorithm calculations stay separate from React rendering.
- `frontend/src/services/` — API clients and browser-backed local state.
- `backend/src/main/java/com/dsaviz/` — Spring REST controllers, services, DTOs, entities,
  repositories and JWT security configuration.
- `backend/src/test/` — Spring integration tests using an in-memory H2 database.
- `docs/` — API references and project documentation.

### Screenshots

Replace these placeholders with current captures before publishing a release:

> **Screenshot placeholder — Algorithm visualizer:** capture the visualizer with its
> playback controls and step explanation visible.

> **Screenshot placeholder — Race Mode:** capture at least two race lanes and the results
> summary.

> **Screenshot placeholder — Playground and Experiment:** capture a saved input preset and
> the operation-growth chart.

## Getting started

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Run the frontend test suite and production build with `npm test -- --run` and
`npm run build`.

### Backend

```bash
cd backend
cp .env.example .env      # then fill it in
./mvnw spring-boot:run
```

A Maven wrapper is included, so no local Maven install is needed. Copy
`backend/.env.example` to `backend/.env` and set at minimum the database, SMTP, and
`JWT_SECRET` values — see **[docs/auth-api.md](docs/auth-api.md)** for the full walkthrough,
including Brevo setup and deployment.

### Authentication

Email + password with one-time-code email verification and JWT sessions.
Endpoints, error format, design decisions and known gaps:
**[docs/auth-api.md](docs/auth-api.md)**.
Profile fields, password changes, and account deletion:
**[docs/profile-api.md](docs/profile-api.md)**.

```bash
cd backend && ./mvnw test    # 12 integration tests, no external services needed
```

## Deployment

`backend/Dockerfile` builds a stateless image that honours `PORT` and `DATABASE_URL`, so it
runs unchanged on Render, Railway, Fly.io or a plain VM. Health check:
`GET /actuator/health`.

## Team

| Module                             | Owner                       |
| ---------------------------------- | --------------------------- |
| Sorting & searching visualizers    |                             |
| Data structure visualizers         |                             |
| Backend (auth, progress API)       |                             |
| Cloudinary / email / deployment    |                             |


