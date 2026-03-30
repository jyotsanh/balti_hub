from pathlib import Path
from uuid import uuid4

from fastapi import UploadFile

from src.service.blob_storage_service.exception import (
    BlobServiceException,
    BlobTooLargeError,
    UnsupportedContentTypeError,
)


MAX_SIZE = 3 * 1024 * 1024  # 3 MB
ALLOWED_TYPES = {"text/plain", "application/json", "application/pdf"}


class BlobStorageService:

    def __init__(self, storage_path: Path) -> None:
        self.storage_path = storage_path
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile) -> dict:
        if file.content_type not in ALLOWED_TYPES:
            raise UnsupportedContentTypeError(
                message=f"Content type '{file.content_type}' is not allowed.",
                status_code=415,
                details={
                    "received": file.content_type,
                    "allowed": sorted(ALLOWED_TYPES),
                },
            )

        content = await file.read()

        if len(content) > MAX_SIZE:
            raise BlobTooLargeError(
                message="File exceeds the 3 MB size limit.",
                status_code=413,
                details={
                    "received_bytes": len(content),
                    "max_bytes": MAX_SIZE,
                },
            )

        blob_id = str(uuid4())

        try:
            (self.storage_path / blob_id).write_bytes(content)
        except OSError as e:
            raise BlobServiceException(
                message="Failed to save blob to storage.",
                status_code=500,
                details={"reason": str(e)},
            )

        return {
            "blob_id": blob_id,
            "file_name": file.filename,
            "file_size": len(content),
            "file_type": file.content_type,
        }

    async def get(self): ...

    async def delete(self): ...

    async def list(self): ...