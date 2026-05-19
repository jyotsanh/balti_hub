# Architecture

## Overview

BaltiHub is a full-stack blob storage platform. Users can register, authenticate, and store up to 5 binary files (blobs) per account. A superuser role provides administrative access to manage all users. The system is composed of four services orchestrated via Docker Compose.

---

## Services

| Service | Image / Source | Responsibility |
|---|---|---|
| **backend** | `apps/backend/` (FastAPI) | REST API, auth, business logic |
| **frontend** | `apps/frontend/` (React + Vite) | Single-page application |
| **mongodb** | `mongo:7` | Persistent document storage (users, blob metadata) |
| **redis** | `redis:7-alpine` | Rate limiting (fixed-window counter per IP) |

---

## High-Level Data Flow

```
Browser
  │
  ▼
Frontend (React SPA, port 4173)
  │   Axios + Bearer token
  ▼
Backend API (FastAPI, port 8050 → container 8015)
  ├── Auth middleware (JWT decode)
  ├── Rate limiter (Redis)
  ├── Security headers middleware
  │
  ├─► MongoDB  — user documents, blob metadata documents
  └─► Filesystem volume (blob_data) — raw blob binary files
```

---

## Backend Layers

```
src/
├── server.py              Application factory, lifespan startup/shutdown
├── config/                Typed environment settings (pydantic-settings)
├── auth/                  JWT creation/validation, password hashing, user guards
├── middleware/            CORS, rate limiter, security headers, process-time logger
├── models/                Beanie ODM documents (UserDocument, BlobDocument)
├── schemas/               Pydantic request/response schemas
├── routes/                FastAPI route handlers
│   ├── login/             POST /login/access-token
│   ├── user/              User CRUD + admin user management
│   └── blob/              Blob upload / download / list / delete
├── service/
│   ├── blob_storage/      Filesystem read/write/delete logic
│   └── redis/             Async Redis client wrapper
└── exception_handlers/    Global error response formatting
```

---

## Frontend Layers

```
src/
├── main.tsx               App entry point
├── App.tsx                Route table, QueryClient, AuthProvider
├── lib/
│   ├── api.ts             Axios instance with token injection + 401 redirect
│   └── auth-context.tsx   React context for current user state
├── api/                   Per-domain API call functions (auth, blobs, users, admin)
├── pages/                 Route-level page components
├── components/            Shared UI components (Navbar, Footer, guards)
└── types/                 Shared TypeScript type definitions
```

---

## Authentication Flow

1. User submits email + password to `POST /api/v1/login/access-token`.
2. Backend validates credentials, returns a signed JWT (HS256, expires in 8 days by default).
3. Frontend stores the token in `localStorage`.
4. All subsequent API requests include `Authorization: Bearer <token>`.
5. A response interceptor on the Axios instance clears storage and redirects to `/login` on any `401`.

---

## Blob Storage

- Blob binary content is stored on the local filesystem under `BLOB_STORAGE_PATH` (default: `temp_storage`), mounted as a Docker named volume (`blob_data`).
- Each user gets their own subdirectory: `{BLOB_STORAGE_PATH}/{user_uuid}/{blob_id}`.
- Blob metadata (file name, size, content type) is stored as a `BlobDocument` in MongoDB.
- Constraints: max **5 blobs per user**, max **3 MB per file**, allowed types: `text/plain`, `application/json`, `application/pdf`.

---

## Rate Limiting

- Implemented as a Starlette middleware (`RateLimiterMiddleware`) backed by Redis.
- Fixed-window strategy: per client IP, keyed as `rate_limit:{ip}`.
- Default: **20 requests per 60-second window** (configurable via `API_LIMIT` / `API_WINDOW`).
- If Redis is unavailable the middleware fails open — requests pass through without limiting.

---

## Security Headers

`SecurityHeadersMiddleware` appends the following headers to every response:

| Header | Value |
|---|---|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `no-referrer` |
| `X-Frame-Options` | `Deny` |
| `X-XSS-Protection` | `1; mode=block` |
| `Content-Security-Policy` | `frame-ancestors 'self'` |
| `X-Permitted-Cross-Domain-Policies` | `none` |

---

## Startup Sequence

On application boot the lifespan handler:

1. Connects to Redis and verifies with `PING`.
2. Connects to MongoDB and verifies with `ping` command.
3. Initialises Beanie ODM with `UserDocument` and `BlobDocument`.
4. Creates the first superuser if no superuser exists yet (uses `FIRST_SUPERUSER` / `FIRST_SUPERUSER_PASSWORD` from config).
