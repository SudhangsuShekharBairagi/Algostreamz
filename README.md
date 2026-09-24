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
./mvnw spring-boot:run
```
Set `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`
(Neon Postgres), `JWT_SECRET`, `CLOUDINARY_URL`, and mail credentials as
environment variables — see `backend/src/main/resources/application.properties`.

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
