# Deployment

BaltiHub ships with a `docker-compose.yml` that orchestrates all four services: backend, frontend, MongoDB, and Redis. This is the recommended way to run the application in production or for a full integration environment.

---

## Prerequisites

| Tool | Minimum version |
|---|---|
| Docker | 24 |
| Docker Compose | v2 (plugin, `docker compose`) |

---

## Service Overview

| Service | Container name | Host port | Container port |
|---|---|---|---|
| Redis | `balti-redis-service` | `6370` | `6379` |
| MongoDB | `baltihub-mongodb-service` | `27012` | `27017` |
| Backend (FastAPI) | `baltiHub-service` | `8050` | `8015` |
| Frontend (React) | — | `4173` | `4173` |

Healthchecks on Redis and MongoDB ensure the backend does not start until both are ready. The frontend waits for the backend to pass its healthcheck.

---

## Step 1 — Create `.env.prod`

The Docker Compose file reads backend environment variables from `.env.prod` in the project root. Create it before building:

```env
# Required
FIRST_SUPERUSER=admin@yourdomain.com
FIRST_SUPERUSER_PASSWORD=use-a-strong-password

# Security — generate with: python -c "import secrets; print(secrets.token_hex(32))"
SECRET_KEY=replace-with-a-long-random-secret

# MongoDB — uses Docker service name as hostname
MONGO_URI=mongodb://mongodb:27017/balti-hub
MONGO_DB=balti-hub

# Redis — uses Docker service name as hostname
REDIS_HOST=redis
REDIS_PORT=6379

# Rate limiting
API_LIMIT=20
API_WINDOW=60
```

See [environment.md](environment.md) for the full variable reference.

---

## Step 2 — Build and Start

```bash
docker compose up --build -d
```

- `--build` rebuilds the backend and frontend images from their Dockerfiles.
- `-d` runs all containers in detached mode.

On first startup the backend will automatically create the superuser defined by `FIRST_SUPERUSER` and `FIRST_SUPERUSER_PASSWORD`.

---

## Step 3 — Verify

Check that all containers are healthy:

```bash
docker compose ps
```

All services should show `healthy` or `running`. Then visit:

| URL | Description |
|---|---|
| `http://localhost:4173` | Frontend application |
| `http://localhost:8050/docs` | Backend Swagger UI |
| `http://localhost:8050/api/v1` | API base URL |

---

## Stopping the Stack

```bash
docker compose down
```

This stops and removes containers but **preserves named volumes** (`mongodb_data`, `redis_data`, `blob_data`). Your data is not lost.

To stop **and remove all data volumes**:

```bash
docker compose down -v
```

> This is destructive. All stored blobs, users, and database records will be deleted.

---

## Rebuilding a Single Service

If you change only the backend source:

```bash
docker compose up --build balti_hub -d
```

If you change only the frontend:

```bash
docker compose up --build frontend -d
```

---

## Named Volumes

| Volume | Mount point in container | Contents |
|---|---|---|
| `mongodb_data` | `/data/db` (MongoDB) | Database files |
| `redis_data` | `/data` (Redis) | Redis append-only log |
| `blob_data` | `/app/temp_storage` (backend) | Uploaded blob binary files |

Volumes are created automatically on first `docker compose up`. They persist across restarts and `docker compose down` (without `-v`).

---

## Logs

View logs for all services:

```bash
docker compose logs -f
```

View logs for a single service:

```bash
docker compose logs -f balti_hub
docker compose logs -f mongodb
docker compose logs -f redis
```

---

## Updating the Application

```bash
git pull
docker compose up --build -d
```

This rebuilds changed images and restarts only affected containers while keeping volumes intact.

---

## Production Considerations

- **Reverse proxy:** Place an Nginx or Caddy reverse proxy in front of the stack to handle TLS termination, a single public port, and proper domain routing.
- **SECRET_KEY:** Never use the default. Generate a cryptographically strong key and store it securely (e.g. in a secrets manager or CI environment variable).
- **CORS:** Set `BACKEND_CORS_ORIGINS` to your actual frontend domain, not `localhost`.
- **MongoDB authentication:** The current Compose file does not enable MongoDB authentication. For production, add `MONGO_INITDB_ROOT_USERNAME` / `MONGO_INITDB_ROOT_PASSWORD` and update `MONGO_URI` accordingly.
- **Redis persistence:** Redis append-only file (AOF) is already enabled (`--appendonly yes`). Ensure the `redis_data` volume is backed up regularly.
- **Blob volume backups:** The `blob_data` volume contains all user-uploaded files. Include it in your backup strategy.
