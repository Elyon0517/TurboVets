# Turbo Tasks

Task board with a NestJS API and an Angular dashboard (Nx monorepo).

## Setup Instructions

### Requirements

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### `.env` configuration

The API reads `apps/api/.env`.

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=change-me
JWT_EXPIRES_IN=24h
DB_PATH=turbo-tasks.sqlite
FRONTEND_URL=http://localhost:4200
```

### Run backend and frontend

```bash
npx nx serve api
npx nx serve dashboard
```

- API: `http://localhost:3000/api`
- Dashboard: `http://localhost:4200`

Demo users (seeded on first API start):

- owner@acme.com / Password123!
- admin@acme.com / Password123!
- viewer@acme.com / Password123!

## Architecture Overview

### Nx monorepo layout

```
turbo-tasks/
  apps/
    api/            NestJS API
    api-e2e/        API E2E tests
    dashboard/      Angular app
    dashboard-e2e/  Playwright E2E tests
  libs/
    data/           shared types (DTOs/enums/interfaces)
    auth/           shared RBAC helpers
```

### Why the shared libs exist

- `@org/data`: the “contract” between frontend and backend (DTOs + enums + interfaces).
- `@org/auth`: role/permission helpers used by the API (and can be reused elsewhere).

## Data Model Explanation

### Schema (high level)

- `organizations`: org tree (supports parent/children)
- `roles`: role per organization (owner/admin/viewer)
- `users`: belongs to an organization + role
- `tasks`: belongs to an organization + owner, sortable with `order`
- `audit_logs`: records actions (read/write/access denied, etc.)

### ERD (text)

```
organizations (1) ──< roles (many)
organizations (1) ──< users (many)
users (1) ──────────< tasks (many)
users (0..1) ───────< audit_logs (many)

organizations (parentId) ──< organizations (children)
```

## Access Control Implementation

### Roles, permissions, org scope

- **Owner**: full access (across org tree)
- **Admin**: manage tasks in their org, can view audit log
- **Viewer**: can only see/edit their own tasks

Organizations form a simple hierarchy via `parentId`. Task visibility is scoped from role + org.

### JWT + guards

- Login/registration returns a JWT containing `sub`, `email`, `role`, `organizationId`.
- Dashboard stores the token and sends it as `Authorization: Bearer <token>`.
- API validates the token (JWT strategy) and then checks role requirements (roles guard + shared RBAC helpers).

## API Documentation

All endpoints are prefixed with `/api`. Protected endpoints require `Authorization: Bearer <jwt>`.

### Endpoints

Auth:

- `POST /auth/login`
- `POST /auth/register`
- `GET /auth/me` (protected)

Tasks (protected):

- `GET /tasks`
- `POST /tasks`
- `GET /tasks/:id`
- `PUT /tasks/:id`
- `DELETE /tasks/:id`
- `POST /tasks/reorder`

Organizations (protected):

- `GET /organizations`
- `GET /organizations/:id`
- `POST /organizations` (owner)

Users (protected, admin+):

- `GET /users`
- `GET /users/:id`

Audit log (protected, admin+):

- `GET /audit-log?page=1&limit=50`

### Sample requests

Login:

```bash
curl -sS -X POST "http://localhost:3000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@acme.com","password":"Password123!"}'
```

List tasks:

```bash
curl -sS "http://localhost:3000/api/tasks" \
  -H "Authorization: Bearer $JWT"
```

Create a task:

```bash
curl -sS -X POST "http://localhost:3000/api/tasks" \
  -H "Authorization: Bearer $JWT" \
  -H "Content-Type: application/json" \
  -d '{"title":"My task","priority":"high","category":"work"}'
```

## Future Considerations

- **Advanced role delegation**: multiple roles per user, org-level delegation, or per-project roles.
- **Production-ready security**
  - JWT refresh tokens (short-lived access tokens + refresh rotation)
  - CSRF protection if moving to cookie-based auth
  - RBAC caching (short TTL / invalidation on role change)
- **Scaling permission checks**: consider ABAC / policy engines when roles and rules grow beyond simple hierarchies.

## Tests

```bash
npx nx test api
npx nx test dashboard
```

## Build

```bash
npx nx build api
npx nx build dashboard
```
