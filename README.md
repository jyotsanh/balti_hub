# BaltiHub

A full-stack file storage web application. Users can register, log in, and upload/download/delete files (blobs). Admins can manage all users through a dedicated admin panel.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Router, Axios |
| Backend | FastAPI (Python), Uvicorn, Beanie ODM |
| Database | MongoDB |
| Cache / Rate Limiting | Redis |
| Blob Storage | Local filesystem (Docker volume) |
| Container | Docker, Docker Compose |

---

## Project Structure

```
balti_hub/
├── apps/
│   ├── backend/          # FastAPI application
│   │   ├── src/
│   │   │   ├── auth/         # JWT auth, password hashing, dependency guards
│   │   │   ├── config/       # Settings loaded from environment variables
│   │   │   ├── exception_handlers/
│   │   │   ├── middlewares/  # CORS, rate limiter, security headers, process time
│   │   │   ├── models/       # Beanie (MongoDB) document models
│   │   │   ├── routes/       # API route handlers
│   │   │   ├── schemas/      # Pydantic request/response schemas
│   │   │   ├── service/      # Blob storage service, Redis client
│   │   │   └── server.py     # App factory, lifespan, middleware wiring
│   │   ├── Dockerfile
│   │   └── pyproject.toml
│   └── frontend/         # React SPA
│       ├── src/
│       │   ├── api/          # Axios API functions (auth, blobs, users, admin)
│       │   ├── components/   # Navbar, route guards, toast, UI primitives
│       │   ├── lib/          # Axios instance, auth context, toast bus, utils
│       │   ├── pages/        # Page components (Login, Dashboard, Admin, etc.)
│       │   └── types/        # Shared TypeScript types
│       ├── Dockerfile
│       └── package.json
├── docker-compose.yml
├── .env.example          # Copy this to .env.prod and fill in your values
└── README.md
```

---

## API Endpoints

All routes are prefixed with `/api/v1`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| `POST` | `/login/access-token` | — | Log in, returns JWT |
| `POST` | `/user` | — | Register a new user |
| `GET` | `/user/me` | User | Get own profile |
| `PATCH` | `/user/me` | User | Update own profile |
| `DELETE` | `/user/me` | User | Delete own account |
| `POST` | `/blob/upload` | User | Upload a file (max 3 MB, txt/json/pdf) |
| `GET` | `/blob/` | User | List own blobs |
| `GET` | `/blob/{blob_id}` | User | Download a blob |
| `DELETE` | `/blob/{blob_id}` | User | Delete a blob |
| `GET` | `/admin` | Superuser | List all users (paginated) |
| `GET` | `/admin/{userid}` | Superuser | Get a specific user |
| `PATCH` | `/admin/{userid}` | Superuser | Update a user |
| `DELETE` | `/admin/{userid}` | Superuser | Delete a user |

Interactive docs are available at `http://localhost:8050/api/v1/docs` when the backend is running.

---

## Running with Docker

### 1. Create your environment file

```bash
cp .env.example .env.prod
```

Then open `.env.prod` and at minimum change:
- `FIRST_SUPERUSER` — the admin email
- `FIRST_SUPERUSER_PASSWORD` — the admin password
- `SECRET_KEY` — a strong random string (used to sign JWTs)

### 2. Start all containers

```bash
docker compose --env-file .env.prod up --build
```

This starts four containers:

| Container | What it does | Host port |
|-----------|-------------|-----------|
| `redis` | Rate limiting cache | `6370` |
| `mongodb` | Database | `27012` |
| `baltiHub-service` | FastAPI backend | `8050` |
| `baltiHub-frontend` | React frontend (Vite preview) | `4173` |

The backend waits for Redis and MongoDB to be healthy before starting. The frontend waits for the backend to be healthy before starting.

### 3. Open the app

- **Frontend:** http://localhost:4173
- **Backend API docs:** http://localhost:8050/api/v1/docs

### Useful commands

```bash
# Run in the background
docker compose --env-file .env.prod up --build -d

# View logs
docker compose logs -f

# Stop everything
docker compose down

# Stop and delete all data volumes (fresh start)
docker compose down -v
```

---

## Running Locally (without Docker)

### Backend

Requires Python 3.13+ and [uv](https://docs.astral.sh/uv/).

```bash
cd apps/backend

# Install dependencies
uv sync

# Create a local .env file (copy from example and set REDIS_HOST=localhost, MONGO_HOST=localhost)
cp ../../.env.example .env

# Start the dev server (hot reload)
uv run dev
```

The backend runs at `http://localhost:8015`.

### Frontend

Requires Node.js 20+.

```bash
cd apps/frontend

npm install

# Start the dev server (proxies /api to http://localhost:8050)
npm run dev
```

The frontend runs at `http://localhost:5173`.

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `FIRST_SUPERUSER` | Admin account email (created on first startup) | `admin@example.com` |
| `FIRST_SUPERUSER_PASSWORD` | Admin account password | `supersecret` |
| `SECRET_KEY` | Secret used to sign JWT tokens | `a-long-random-string` |
| `REDIS_HOST` | Redis hostname | `redis` (Docker), `localhost` (local) |
| `REDIS_PORT` | Redis port | `6379` |
| `MONGO_HOST` | MongoDB hostname | `mongodb` (Docker), `localhost` (local) |
| `MONGO_PORT` | MongoDB port (internal container port) | `27017` |
| `MONGO_DB` | MongoDB database name | `balti-hub` |
| `BACKEND_CORS_ORIGINS` | JSON array of allowed CORS origins | `["http://localhost:4173"]` |
| `VITE_API_URL` | Backend API URL as seen by the browser | `http://localhost:8050/api/v1` |
| `PROD_HOST` | Host the backend binds to | `0.0.0.0` |
| `PROD_PORT` | Port the backend listens on | `8015` |