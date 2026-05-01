# Project

## Docker

Run the full stack with Docker Compose:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`
- Postgres: `localhost:5432`

Notes:

- The backend container runs `alembic upgrade head` before starting Uvicorn.
- The backend also runs `python -m app.init_db` to seed shared roles and status options from `shared/app_config.json`.
- The backend expects `backend/app/serviceAccountKey.json` to exist for Firebase initialization.
- You can copy `.env.example` to `.env` and override any defaults before starting the stack.
