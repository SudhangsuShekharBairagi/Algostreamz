# DSA Visualization & Experimental Learning Platform

Full-stack React + Spring Boot web app for animated, step-by-step
visualization of data structures and algorithms.

## Structure

- `frontend/` — React + Vite + Tailwind CSS (client-side visualizers, fully
  functional standalone)
- `backend/` — Spring Boot REST API (optional: auth, progress tracking,
  Cloudinary media storage, email notifications)
- `docs/` — synopsis, ER diagram, UML diagrams

## Getting started

### Frontend
```bash
cd frontend
npm install
npm run dev
```

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

```bash
cd backend && ./mvnw test    # 12 integration tests, no external services needed
```

## Deployment
`backend/Dockerfile` builds a stateless image that honours `PORT` and `DATABASE_URL`, so it
runs unchanged on Render, Railway, Fly.io or a plain VM. Health check:
`GET /actuator/health`.

## Team

| Module                              | Owner   |
|--------------------------------------|---------|
| Sorting & searching visualizers      |         |
| Data structure & graph visualizers   |         |
| Backend (auth, progress API)         |         |
| Cloudinary / email / deployment      |         |

## Branching

- `main` — always deployable
- `feature/<name>` — one branch per module, PR into `main`
