# Environment Variables

BaltiHub uses two separate env files:

| File | Used by |
|---|---|
| `.env` | Local development (backend reads this directly via pydantic-settings) |
| `.env.prod` | Docker Compose production stack (`env_file` in `docker-compose.yml`) |

The backend loads settings from the env file automatically at startup. Unknown keys are ignored. Empty values are treated as unset.

---

## Required Variables

These **must** be set or the backend will fail to start.

| Variable | Type | Description |
|---|---|---|
| `FIRST_SUPERUSER` | `EmailStr` | Email address of the initial superuser account |
| `FIRST_SUPERUSER_PASSWORD` | `string` | Password for the initial superuser account |

---

## Security

| Variable | Type | Default | Description |
|---|---|---|---|
| `SECRET_KEY` | `string` | `baltiiiii` | Secret used to sign JWT tokens. **Change this in production.** |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `integer` | `11520` (8 days) | JWT token lifetime in minutes |
| `ALLOW_CREDENTIALS` | `boolean` | `False` | Whether CORS allows credentials |

> **Warning:** The default `SECRET_KEY` is insecure. Always set a strong random secret in production:
> ```bash
> python -c "import secrets; print(secrets.token_hex(32))"
> ```

---

## CORS

| Variable | Type | Default | Description |
|---|---|---|---|
| `BACKEND_CORS_ORIGINS` | `list[AnyHttpUrl]` | `["http://localhost:8015", "http://localhost:8000", "http://localhost", "http://localhost:80"]` | Comma-separated list of allowed origins |

---

## Rate Limiting

| Variable | Type | Default | Description |
|---|---|---|---|
| `API_LIMIT` | `integer` | `20` | Maximum requests allowed per window |
| `API_WINDOW` | `integer` | `60` | Window duration in seconds |

---

## MongoDB

| Variable | Type | Default | Description |
|---|---|---|---|
| `MONGO_URI` | `string \| None` | `None` | Full MongoDB connection URI. When set, takes priority over host/port/db below. |
| `MONGO_HOST` | `string` | `localhost` | MongoDB host (used if `MONGO_URI` is not set) |
| `MONGO_PORT` | `integer` | `27017` | MongoDB port |
| `MONGO_DB` | `string` | `balti-hub` | Database name |

When running with Docker Compose, set `MONGO_URI` to point to the `mongodb` service:
```
MONGO_URI=mongodb://mongodb:27017/balti-hub
```

---

## Redis

| Variable | Type | Default | Description |
|---|---|---|---|
| `REDIS_HOST` | `string` | `localhost` | Redis host |
| `REDIS_PORT` | `integer` | `6379` | Redis port |
| `REDIS_PASSWORD` | `string \| None` | `None` | Redis password (leave unset for passwordless instances) |
| `REDIS_DB` | `integer` | `0` | Redis database index |
| `REDIS_TTL` | `integer` | `28800` (8 hours) | Default TTL for Redis keys in seconds |

When running with Docker Compose, set:
```
REDIS_HOST=redis
REDIS_PORT=6379
```

---

## Blob Storage

| Variable | Type | Default | Description |
|---|---|---|---|
| `BLOB_STORAGE_PATH` | `string` | `temp_storage` | Filesystem path where blob files are stored |

In Docker, this path is mounted as the `blob_data` named volume at `/app/temp_storage`.

---

## Server

| Variable | Type | Default | Description |
|---|---|---|---|
| `PROD_HOST` | `string` | `0.0.0.0` | Host the server binds to in production mode |
| `PROD_PORT` | `integer` | `8015` | Port the server listens on in production mode |
| `DEV_HOST` | `string` | `localhost` | Host for the development server |
| `DEV_PORT` | `integer` | `8015` | Port for the development server |

---

## Frontend

The frontend reads one build-time variable injected via Docker build arg or a `.env` file in `apps/frontend/`.

| Variable | Type | Default | Description |
|---|---|---|---|
| `VITE_API_URL` | `string` | `http://localhost:8050/api/v1` | Base URL the React app uses for all API calls |

---

## Example `.env` (local development)

```env
# Required
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=changeme123

# Security
SECRET_KEY=replace-with-a-long-random-secret

# MongoDB (local)
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=balti-hub

# Redis (local)
REDIS_HOST=localhost
REDIS_PORT=6379

# Optional
API_LIMIT=20
API_WINDOW=60
```

## Example `.env.prod` (Docker Compose)

```env
# Required
FIRST_SUPERUSER=admin@example.com
FIRST_SUPERUSER_PASSWORD=strongpassword

# Security
SECRET_KEY=replace-with-a-long-random-secret

# MongoDB (Docker service name)
MONGO_URI=mongodb://mongodb:27017/balti-hub
MONGO_DB=balti-hub

# Redis (Docker service name)
REDIS_HOST=redis
REDIS_PORT=6379

# Rate limiting
API_LIMIT=20
API_WINDOW=60
```
