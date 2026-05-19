# Data Models

BaltiHub uses **MongoDB** as its document store, accessed through **Beanie ODM**. This page documents every document schema and the Pydantic response schemas exposed by the API.

---

## MongoDB Documents

### `UserDocument`

Collection: `user` (Beanie default, derived from class name)

Represents a registered user.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `PydanticObjectId` | Auto-generated | MongoDB `_id` |
| `uuid` | `UUID` (v7) | Unique, indexed | Public-facing user identifier |
| `email` | `EmailStr` | Unique, indexed | User's email address |
| `first_name` | `str \| None` | Optional | Display first name |
| `last_name` | `str \| None` | Optional | Display last name |
| `hashed_password` | `str \| None` | Optional | bcrypt hash of the user's password |
| `provider` | `str \| None` | Optional | Auth provider (e.g. `"local"`) |
| `picture` | `str \| None` | Optional | URL to profile picture |
| `blob_count` | `int` | Default: `0` | Number of blobs currently owned |
| `is_active` | `bool` | Default: `True` | Whether the account is active |
| `is_superuser` | `bool` | Default: `False` | Whether the user has admin privileges |
| `created_date` | `datetime` | UTC, set on insert | Record creation timestamp |
| `updated_date` | `datetime` | UTC, updated on every write | Record last-modified timestamp |

**Lifecycle hooks**

- `before_event(Insert)` — sets `created_date` to the current UTC time.
- `before_event([Replace, Update, SaveChanges])` — refreshes `updated_date` on every write operation.

---

### `BlobDocument`

Collection: `blob` (Beanie default, derived from class name)

Stores metadata for an uploaded blob. The binary content is stored separately on the filesystem.

| Field | Type | Constraints | Description |
|---|---|---|---|
| `id` | `PydanticObjectId` | Auto-generated | MongoDB `_id` |
| `blob_id` | `UUID` (v7) | Unique, indexed | Public-facing blob identifier |
| `owner_uuid` | `UUID` | Indexed | UUID of the owning `UserDocument` |
| `file_name` | `str` | — | Original file name at upload time |
| `file_size` | `int` | — | File size in bytes |
| `content_type` | `str` | — | MIME type (e.g. `text/plain`) |
| `created_at` | `str` | — | Upload timestamp (ISO string) |
| `created_date` | `datetime` | UTC, set on insert | Record creation timestamp |
| `updated_date` | `datetime` | UTC, updated on every write | Record last-modified timestamp |

**Lifecycle hooks** — same pattern as `UserDocument`.

**Filesystem layout**

The binary file is stored at:
```
{BLOB_STORAGE_PATH}/{owner_uuid}/{blob_id}
```

---

## API Response Schemas

These Pydantic models define what the API returns. They are subsets of the internal document schemas, with sensitive fields (e.g. `hashed_password`) excluded.

### `User`

Returned by all user-related endpoints.

```python
class User(BaseModel):
    id: PydanticObjectId
    uuid: UUID
    email: EmailStr
    first_name: str | None
    last_name: str | None
    picture: str | None
    is_active: bool | None
    is_superuser: bool | None
    provider: str | None
```

### `UserUpdate`

Request body for `PATCH /user/me` and `PATCH /admin/{userid}`.

```python
class UserUpdate(BaseModel):
    first_name: str | None
    last_name: str | None
    picture: str | None
    password: str | None      # plain text, hashed server-side
    email: EmailStr | None
    is_active: bool | None    # ignored for self-update
    is_superuser: bool | None # ignored for self-update
```

### `UserListResponse`

Returned by `GET /admin`.

```python
class UserListResponse(BaseModel):
    users: list[User]
    total: int
```

### `BlobUploadResponse`

Returned by `POST /blob/upload`.

```python
class BlobUploadResponse(BaseModel):
    blob_id: str
    blob_url: AnyHttpUrl
    file_metadata: BlobMetadata
```

### `BlobMetadata`

```python
class BlobMetadata(BaseModel):
    file_name: str
    file_size: int   # bytes
    file_type: str   # MIME type
```

### `BlobListResponse`

Returned by `GET /blob/`.

```python
class BlobListResponse(BaseModel):
    blobs: list[str]   # list of download URLs
    total: int
```

### `Token`

Returned by `POST /login/access-token`.

```python
class Token(BaseModel):
    access_token: str
    token_type: str    # always "bearer"
```

---

## Constraints Summary

| Rule | Value |
|---|---|
| Maximum blobs per user | 5 |
| Maximum blob file size | 3 MB (3,145,728 bytes) |
| Allowed blob MIME types | `text/plain`, `application/json`, `application/pdf` |
| JWT algorithm | HS256 |
| Default token expiry | 8 days (11,520 minutes) |
