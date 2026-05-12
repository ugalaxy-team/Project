<h1 align="center">English documentation</h1>
<p align="center">
  <a href="./README.md">
    <img src="https://img.shields.io/badge/⬅_Back_to_Documentation-grey?style=for-the-badge">
  </a>
</p>

## Project overview

This repository is a full-stack **tournament management** application: organizers can create and manage tournaments, tasks, teams, and news; participants work through a guided flow; jury members can evaluate submissions. The UI is a single-page React app backed by a **FastAPI** service with **real-time notifications** over **Socket.IO**.

**Main capabilities (high level)**

- User profiles tied to **Firebase Authentication** (Google sign-in in the UI).
- Tournaments with tasks, teams, submissions, and evaluation workflows.
- Role requests (for example organizer/admin) with notifications.
- Optional **SQLAdmin** dashboard on the API host for data administration.

**Architecture (short)**

```text
Browser (React + Vite)
    │  HTTPS / REST + WebSocket (Socket.IO client)
    ▼
FastAPI + python-socketio ASGI app (`app:socket_app`)
    │  SQLAlchemy (async) + Alembic migrations
    ▼
PostgreSQL
```

Shared configuration for roles, statuses, and categories lives in `shared/app_config.json` and is read by both the backend (`app.config`) and the frontend (`src/config/appConfig.ts`).

---

## Tech stack

| Area | Technologies |
|------|----------------|
| **Frontend** | React 19, TypeScript, Vite 7, Tailwind CSS 4, Redux Toolkit, TanStack Query, React Router 7, Socket.IO client, Firebase JS SDK, Vitest, Testing Library |
| **Backend** | Python 3.12, FastAPI, Uvicorn, SQLAlchemy 2 (async), Alembic, Pydantic Settings, python-socketio, Firebase Admin SDK, SQLAdmin |
| **Database** | PostgreSQL 16 (async driver: `asyncpg`; tests use SQLite via `aiosqlite`) |
| **Testing** | Frontend: Vitest (`npm run test`, `npm run test:coverage`). Backend: pytest + pytest-asyncio (`pytest` from `backend/`) |
| **Docker / dev** | Docker Compose (`db`, `backend`, `frontend`), multi-stage Dockerfiles under `backend/` and `frontend/` |

---

## Quick start (recommended): Docker Compose

This is the fastest way for reviewers to run **Postgres + API + Vite dev server** together.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose v2 (`docker compose`).

### 1. Clone the repository

```bash
git clone <repository-url>
cd Project
```

### 2. Environment file

```bash
cp .env.example .env
```

Edit `.env` and fill in the **Firebase** fields (see [Environment variables](#environment-variables)). The stack can start with empty Firebase strings, but **sign-in and authenticated API calls require real Firebase configuration** and a **service account key** on the backend (see [Notes for reviewers](#notes-for-reviewers)).

### 3. Firebase service account (required for real login)

The backend expects an Admin SDK key at:

`backend/app/serviceAccountKey.json`

This path is gitignored. Download a service account JSON from your Firebase project and save it there. If the file is missing, the app still starts, but **ID token verification** used by protected routes will not work until a valid key is present.

### 4. Start all services

From the **repository root** (where `docker-compose.yml` is):

```bash
docker compose up --build
```

Wait until the database health check passes and the backend finishes `alembic upgrade head` and `python -m app.init_db` before using the app.

### 5. Open the app

| Service | URL |
|---------|-----|
| Frontend (Vite) | [http://localhost:5173](http://localhost:5173) |
| Backend API | [http://localhost:8000](http://localhost:8000) |
| API docs (Swagger) | [http://localhost:8000/docs](http://localhost:8000/docs) |
| SQLAdmin (when logged in as admin) | [http://localhost:8000/admin](http://localhost:8000/admin) |
| PostgreSQL (host) | `localhost:5432` — database `tournament`, user `tournament`, password `tournament` |

### Rebuild after dependency changes

```bash
docker compose build --no-cache
docker compose up
```

### Stop containers

```bash
docker compose down
```

Remove the database volume as well (fresh DB next time):

```bash
docker compose down -v
```

---

## Manual setup

Use this when you prefer native Node/Python or are developing without Docker.

### Database (PostgreSQL)

1. Install PostgreSQL 16 (or compatible) locally.
2. Create a database and user matching your connection string, for example:

```sql
CREATE USER tournament WITH PASSWORD 'tournament';
CREATE DATABASE tournament OWNER tournament;
```

3. Set `SQLALCHEMY_DATABASE_URI` in the root `.env` (see `.env.example`). Use the `postgresql+asyncpg://` scheme.

### Backend

From the **repository root**:

```bash
python3.12 -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Ensure the root `.env` exists (copy from `.env.example`) with `SECRET_KEY`, `SQLALCHEMY_DATABASE_URI`, `FRONTEND_URL`, and all Firebase-related keys (same names as in `.env.example`).

Place `serviceAccountKey.json` under `backend/app/` if you need token verification.

From the **`backend/`** directory:

```bash
cd backend
alembic upgrade head
python -m app.init_db
python main.py
```

`python main.py` runs **Uvicorn** with reload on `http://127.0.0.1:8000` using the combined FastAPI + Socket.IO app (`app:socket_app`).

Equivalent without reload:

```bash
uvicorn app:socket_app --host 0.0.0.0 --port 8000
```

### Frontend

Requires **Node.js** (the Docker image uses Node 22; CI uses Node 20).

```bash
cd frontend
npm ci
npm run dev
```

Vite is configured with `envDir: ".."` so it loads `.env` from the **repository root**, not only from `frontend/`.

---

## Environment variables

Configuration is driven by a **`.env` file at the repository root** (see `backend/app/config.py`: `ENV_PATH` and `Settings`).

| Variable | Required | Purpose |
|----------|----------|---------|
| `SECRET_KEY` | Yes | Signing key for sessions (e.g. SQLAdmin). |
| `SQLALCHEMY_DATABASE_URI` | Yes | Async SQLAlchemy URL (`postgresql+asyncpg://...` for Postgres). |
| `FRONTEND_URL` | Yes | Frontend origin (CORS-related usage, admin UI links). |
| `VITE_BACKEND_URL` | Yes (frontend) | Base URL for REST calls from the browser. |
| `VITE_SOCKETIO_SERVER_URL` | Yes (frontend) | Socket.IO server URL (same host/port as API in typical setups). |
| `VITE_FIREBASE_*` | Yes for auth UI | Firebase web app config; backend `Settings` reads the same names (or `FIREBASE_*` aliases where noted in code). |

**Creating `.env`**

```bash
cp .env.example .env
```

Fill in values. For Docker Compose, variables in `.env` are substituted into `docker-compose.yml` (e.g. `${VITE_FIREBASE_API_KEY:-}`).

---

## Database setup

- **Docker:** Postgres is defined in `docker-compose.yml` (`postgres:16-alpine`) with database/user/password `tournament`.
- **Migrations:** Managed with **Alembic** (`backend/alembic/`). Run `alembic upgrade head` from `backend/` after setting `SQLALCHEMY_DATABASE_URI`.
- **Seeding / static reference data:** On container start, the backend runs `python -m app.init_db` after migrations. That script creates tables if needed and runs `init_static_data` (roles, statuses, categories, etc.). The FastAPI **lifespan** hook also runs `init_static_data` on startup (`backend/app/__init__.py`). Source definitions are ultimately driven by `shared/app_config.json` and `backend/app/core/seeds/`.
- **Seed users:** There are **no default application passwords**; users authenticate with **Firebase**. Create users by signing in through the UI once Firebase is configured.

---

## Running tests

Commands below match `.github/workflows/tests.yml` and `package.json`.

### Frontend (`frontend/`)

```bash
cd frontend
npm install   # or npm ci when lockfile is trusted
npm run test
```

Coverage (Vitest + v8):

```bash
npm run test:coverage
```

Interactive UI:

```bash
npm run test:ui
```

### Backend (`backend/`)

CI sets `SQLALCHEMY_DATABASE_URI` to SQLite and runs:

```bash
cd backend
pip install -r ../requirements.txt
pytest
```

There is **no** dedicated `pytest` coverage script in `requirements.txt`; add tools such as `pytest-cov` locally if you need coverage reports.

---

## Useful commands

| Task | Command |
|------|---------|
| Full stack (Docker) | `docker compose up --build` |
| Stop stack | `docker compose down` |
| Reset DB volume | `docker compose down -v` |
| Backend migrations | `cd backend && alembic upgrade head` |
| Backend one-off init script | `cd backend && python -m app.init_db` |
| Backend dev server | `cd backend && python main.py` |
| Frontend dev server | `cd frontend && npm run dev` |
| Frontend production build | `cd frontend && npm run build` |
| Frontend lint | `cd frontend && npm run lint` |
| Backend linter (Ruff) | `cd backend && ruff check .` |

---

## Troubleshooting

| Problem | What to try |
|---------|-------------|
| **Docker build fails** | Ensure Docker has enough disk/RAM; run `docker compose build --no-cache`. On Linux, your user must be in the `docker` group or use `sudo` per your site policy. |
| **Backend container exits on start** | Check logs: `docker compose logs backend`. Confirm `SQLALCHEMY_DATABASE_URI` uses host `db` inside Compose (already set in `docker-compose.yml`). Ensure all required env vars exist (use `.env` from `.env.example`). |
| **Alembic / migration errors** | Run from `backend/` with the same `SQLALCHEMY_DATABASE_URI` as the running database. If branches were merged badly, resolve Alembic heads per Alembic docs. After schema mistakes, only use `down -v` in development if you can afford losing data. |
| **Database connection refused** | Postgres not ready: wait for healthcheck. Manual runs must use `localhost` and the correct port (default `5432`). |
| **`ModuleNotFoundError` (Python)** | Activate the venv and `pip install -r requirements.txt` from the repo root. |
| **`npm` errors** | Use the Node version close to CI (20+) or Docker (22). Delete `node_modules` and run `npm ci`. |
| **Port already in use** | Change host ports in `docker-compose.yml` (e.g. `5174:5173`) or stop the process using `8000` / `5173` / `5432`. |
| **401 / Invalid id token** | Backend needs `backend/app/serviceAccountKey.json` from the **same** Firebase project as the frontend config. |
| **Blank or broken login UI** | Set all `VITE_FIREBASE_*` values in `.env` and rebuild/restart the frontend so Vite picks them up. |

---

## Notes for reviewers

- **No default accounts:** Access is via **Firebase Authentication** (e.g. Google). Configure a Firebase project, enable the sign-in providers you need, add web app credentials to `.env`, and add the Admin SDK JSON as `backend/app/serviceAccountKey.json`.
- **Admin SQLAdmin:** After a user exists and has the **admin** role in the database, they can sign in through the admin login flow at `/admin` (Firebase-based; see `backend/app/admin/__init__.py`).
- **Demo-style data:** Some UI pieces import types or sample data from `frontend/src/data/mockTournaments.ts`; live tournament lists come from the API when authenticated.
- **Areas worth exercising:** Auth and profile sync, tournament CRUD (organizer flows), task and team flows, jury evaluation views, notifications (Socket.IO), role requests, news.
- **Known limitations:** Without Firebase and a service account file, you can still inspect static pages and API documentation, but **authenticated flows will not behave correctly**. Firebase Analytics is initialized in `frontend/src/firebase.ts`; use a valid web `appId` for production-like behavior.

---

## Repository layout (reference)

```text
docker-compose.yml    # Orchestrates db, backend, frontend
requirements.txt      # Python dependencies (root; used by backend Dockerfile and CI)
backend/                # FastAPI app, Alembic, tests
frontend/               # Vite + React SPA
shared/                 # Shared JSON config consumed by both tiers
.env.example            # Template for root `.env`
```

For more detail on the Vite template defaults, see `frontend/README.md` (upstream template notes).


## Quick evaluation flow

1. Run the project with Docker
2. Open http://localhost:5173
3. Sign in with Firebase
4. Create a tournament
5. Add tasks and teams
6. Open organizer panel
7. Test jury workflows and notifications