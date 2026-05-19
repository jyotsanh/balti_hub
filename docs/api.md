# API Reference

All endpoints are prefixed with `/api/v1`.

Interactive documentation is available at `http://localhost:8050/docs` (Swagger UI) and `http://localhost:8050/redoc` (ReDoc) when the backend is running.

---

## Authentication

BaltiHub uses **OAuth2 Bearer tokens** (JWT, HS256). Obtain a token from the login endpoint and include it in the `Authorization` header for all protected routes.

```
Authorization: Bearer <access_token>
```

---

## Login

### `POST /api/v1/login/access-token`

Authenticate a user and receive a JWT access token.

**Request** — `application/x-www-form-urlencoded`

| Field | Type | Required | Description |
|---|---|---|---|
| `username` | string | Yes | User's email address |
| `password` | string | Yes | User's password |

**Response `200`**

```json
{
  "access_token": "<jwt_string>",
  "token_type": "bearer"
}
```

**Error responses**

| Status | Detail |
|---|---|
| `400` | `Incorrect email or password` |
| `400` | `Inactive user` |

---

## Users

### `POST /api/v1/user`

Register a new user. Public — no authentication required.

**Request** — `application/json`

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string (email) | Yes | Unique email address |
| `password` | string | Yes | Plain-text password (hashed server-side) |
| `first_name` | string | No | Display first name |
| `last_name` | string | No | Display last name |

**Response `200`** — [User object](#user-object)

**Error responses**

| Status | Detail |
|---|---|
| `400` | `User with that email already exists.` |

---

### `GET /api/v1/user/me`

Get the authenticated user's profile. Requires authentication.

**Response `200`** — [User object](#user-object)

---

### `PATCH /api/v1/user/me`

Update the authenticated user's profile. Requires authentication. `is_active` and `is_superuser` fields are ignored — users cannot escalate their own privileges.

**Request** — `application/json` (all fields optional)

| Field | Type | Description |
|---|---|---|
| `first_name` | string | Updated first name |
| `last_name` | string | Updated last name |
| `picture` | string | Profile picture URL |
| `password` | string | New password (hashed server-side) |
| `email` | string (email) | New email address |

**Response `200`** — [User object](#user-object)

**Error responses**

| Status | Detail |
|---|---|
| `400` | `User with that email already exists.` |

---

### `DELETE /api/v1/user/me`

Delete the authenticated user's own account. Requires authentication.

**Response `200`** — [User object](#user-object) of the deleted user.

---

## Blobs

All blob endpoints require authentication.

### `POST /api/v1/blob/upload`

Upload a blob file. Max 5 blobs per user, max 3 MB per file.

**Request** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `file` | file | The file to upload |

**Allowed content types:** `text/plain`, `application/json`, `application/pdf`

**Response `201`**

```json
{
  "blob_id": "01960000-0000-7000-0000-000000000000",
  "blob_url": "http://localhost:8050/api/v1/blob/01960000-0000-7000-0000-000000000000",
  "file_metadata": {
    "file_name": "example.txt",
    "file_size": 1024,
    "file_type": "text/plain"
  }
}
```

**Error responses**

| Status | Detail |
|---|---|
| `403` | `maximum blob uploads reached` (> 5 blobs) |
| `413` | `File exceeds the 3 MB size limit.` |
| `415` | `Content type '...' is not allowed.` |

---

### `GET /api/v1/blob/`

List all blob download URLs belonging to the authenticated user.

**Response `200`**

```json
{
  "blobs": [
    "http://localhost:8050/api/v1/blob/01960000-...",
    "http://localhost:8050/api/v1/blob/01960001-..."
  ],
  "total": 2
}
```

---

### `GET /api/v1/blob/{blob_id}`

Download a blob by its ID. Returns raw binary content.

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `blob_id` | UUID string | The blob's unique ID |

**Response `200`** — `application/octet-stream`

Response headers include `X-Blob-Size` with the file size in bytes.

**Error responses**

| Status | Detail |
|---|---|
| `404` | Blob not found or does not belong to the current user |

---

### `DELETE /api/v1/blob/{blob_id}`

Delete a blob by its ID.

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `blob_id` | UUID string | The blob's unique ID |

**Response `204`** — No content.

**Error responses**

| Status | Detail |
|---|---|
| `404` | Blob not found or does not belong to the current user |

---

## Admin

All admin endpoints require authentication **and** superuser privileges (`is_superuser: true`).

### `GET /api/v1/admin`

List all registered users with pagination.

**Query parameters**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `limit` | integer | `10` | Maximum number of users to return |
| `offset` | integer | `0` | Number of users to skip |

**Response `200`**

```json
{
  "users": [ /* array of User objects */ ],
  "total": 42
}
```

---

### `GET /api/v1/admin/{userid}`

Get a specific user by UUID.

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `userid` | UUID | The user's UUID |

**Response `200`** — [User object](#user-object)

**Error responses**

| Status | Detail |
|---|---|
| `404` | `User not found` |

---

### `PATCH /api/v1/admin/{userid}`

Update any user's fields (including `is_active` and `is_superuser`).

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `userid` | UUID | The user's UUID |

**Request** — `application/json` (all fields optional)

| Field | Type | Description |
|---|---|---|
| `first_name` | string | Updated first name |
| `last_name` | string | Updated last name |
| `picture` | string | Profile picture URL |
| `password` | string | New password |
| `email` | string (email) | New email address |
| `is_active` | boolean | Activate or deactivate the user |
| `is_superuser` | boolean | Grant or revoke superuser role |

**Response `200`** — [User object](#user-object)

**Error responses**

| Status | Detail |
|---|---|
| `400` | `User with that email already exists.` |
| `404` | `User not found` |

---

### `DELETE /api/v1/admin/{userid}`

Delete any user by UUID.

**Path parameters**

| Parameter | Type | Description |
|---|---|---|
| `userid` | UUID | The user's UUID |

**Response `200`** — [User object](#user-object) of the deleted user.

**Error responses**

| Status | Detail |
|---|---|
| `404` | `User not found` |

---

## Common Response Shapes

### User object

```json
{
  "id": "64a1b2c3d4e5f6a7b8c9d0e1",
  "uuid": "01960000-0000-7000-0000-000000000000",
  "email": "user@example.com",
  "first_name": "Jane",
  "last_name": "Doe",
  "picture": null,
  "is_active": true,
  "is_superuser": false,
  "provider": "local"
}
```

---

## Common Error Codes

| Status | Meaning |
|---|---|
| `400` | Bad request / validation error |
| `401` | Missing or invalid token |
| `403` | Authenticated but insufficient permissions |
| `404` | Resource not found |
| `413` | Payload too large |
| `415` | Unsupported media type |
| `422` | Request body validation failed (Pydantic) |
| `429` | Rate limit exceeded |
