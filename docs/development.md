# Local Development

This guide covers running BaltiHub locally **without Docker**, which gives you faster iteration cycles with hot-reload on both backend and frontend.

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Python | 3.12 |
| Node.js | 20 |
| MongoDB | 7 |
| Redis | 7 |

MongoDB and Redis must be running locally before you start the backend. The easiest way to get them running is via Docker (just for the data services):

```bash
docker run -d --name balti-mongo -p 27017:27017 mongo:7
docker run -d --name balti-redis -p 6379:6379 redis:7-alpine
```

---

## Backend Setup

### 1. Install dependencies

```bash
cd apps/backend
pip install -e .
```

This installs the package in editable mode using the `pyproject.toml` dependency list.

### 2. Create your `.env` file

Copy the example below and save it as `apps/backend/.env`:

```env
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changeme123
SECRET_KEY=replace-with-a-long-random-secret
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=balti-hub
REDIS_HOST=localhost
REDIS_PORT=6379
```

See [environment.md](environment.md) for all available variables.

### 3. Start the development server

```bash
cd apps/backend
dev
```

The `dev` script entry point (defined in `pyproject.toml`) starts Uvicorn with hot-reload enabled. The API is available at:

- API base: `http://localhost:8015/api/v1`
- Swagger UI: `http://localhost:8015/docs`
- ReDoc: `http://localhost:8015/redoc`

> **First startup:** The backend automatically creates the initial superuser defined by `FIRST_SUPERUSER` / `FIRST_SUPERUSER_PASSWORD` if no superuser exists in the database.

---

## Frontend Setup

### 1. Install dependencies

```bash
cd apps/frontend
npm install
```

### 2. Configure the API URL

Create `apps/frontend/.env` (or `apps/frontend/.env.local`):

```env
VITE_API_URL=http://localhost:8015/api/v1
```

### 3. Start the development server

```bash
cd apps/frontend
npm run dev
```

The frontend is available at `http://localhost:5173` with hot module replacement (HMR).

---

## Running Both Together

Open two terminal tabs:

**Tab 1 — backend**
```bash
cd apps/backend && dev
```

**Tab 2 — frontend**
```bash
cd apps/frontend && npm run dev
```

---

## Useful Commands

### Backend

| Command | Description |
|---|---|
| `dev` | Start Uvicorn with hot-reload (development) |
| `server` | Start Uvicorn without hot-reload (production-like) |

### Frontend

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Build for production into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across all TypeScript files |

---

## Project Structure Quick Reference

```
balti_hub/
├── apps/
│   ├── backend/       FastAPI application
│   │   ├── src/       Application source
│   │   ├── pyproject.toml
│   │   └── .env       ← create this
│   └── frontend/      React + Vite application
│       ├── src/
│       ├── package.json
│       └── .env       ← create this
├── docker-compose.yml
└── docs/
```

---

## Troubleshooting

**Backend fails to start with `RuntimeError: failed redis ping`**
- Ensure Redis is running: `redis-cli ping` should return `PONG`.

**Backend fails with MongoDB connection error**
- Ensure MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`.
- Check `MONGO_HOST` and `MONGO_PORT` in your `.env`.

**Frontend shows API errors**
- Confirm `VITE_API_URL` matches the port the backend is listening on.
- Check CORS: the backend's `BACKEND_CORS_ORIGINS` must include `http://localhost:5173`.

**`FIRST_SUPERUSER` / `FIRST_SUPERUSER_PASSWORD` missing**
- These are required. The backend will raise a `ValidationError` and refuse to start without them.
