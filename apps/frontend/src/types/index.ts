// ── Auth ──────────────────────────────────────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  token_type: string;
}

// ── User ──────────────────────────────────────────────────────────────────────
export interface User {
  id: string;
  uuid: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  picture: string | null;
  is_active: boolean | null;
  is_superuser: boolean | null;
  provider: string | null;
}

export interface UserUpdatePayload {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  picture?: string;
}

export interface AdminUserUpdatePayload extends UserUpdatePayload {
  is_active?: boolean;
  is_superuser?: boolean;
}

export interface UserListResponse {
  users: User[];
  total: number;
}

// ── Blobs ─────────────────────────────────────────────────────────────────────
export interface FileMetadata {
  file_name: string;
  file_size: number;
  file_type: string;
}

export interface BlobUploadResponse {
  blob_id: string;
  blob_url: string;
  file_metadata: FileMetadata;
}

export interface BlobListResponse {
  blobs: string[];
  total: number;
}

// ── API Error ─────────────────────────────────────────────────────────────────
export interface ApiError {
  error: string;
  details?: unknown;
}
