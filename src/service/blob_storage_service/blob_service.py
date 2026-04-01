from pathlib import Path

from uuid6 import uuid7
import aiofiles
from fastapi import UploadFile

from src.service.blob_storage_service.exception import (
    BlobServiceException,
    BlobTooLargeError,
    BlobNotFoundError,
    UnsupportedContentTypeError,
)


MAX_SIZE = 3 * 1024 * 1024  # 3 MB
ALLOWED_TYPES = {"text/plain", "application/json", "application/pdf"}


class BlobStorageService:

    def __init__(self, storage_path: Path) -> None:
        self.storage_path = storage_path
        self.storage_path.mkdir(parents=True, exist_ok=True)

    async def save(self, file: UploadFile) -> dict:
        """
        
        """
        if file.content_type not in ALLOWED_TYPES:
            raise UnsupportedContentTypeError(
                message=f"Content type '{file.content_type}' is not allowed.",
                status_code=415,
                details={
                    "received": file.content_type,
                    "allowed": sorted(ALLOWED_TYPES),
                },
            )

        # TODO (jyotsanh): Fix the memory vulnerability
        # Stream the upload using chunked reads with a running byte counter
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

        blob_id = str(uuid7())

        try:
            async with aiofiles.open(self.storage_path / blob_id, "wb") as f:
                await f.write(content)
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

    async def get(self, blob_id: str) -> dict:
        """
        
        """
        blob_path = self.storage_path / blob_id

        try:
            async with aiofiles.open(blob_path, "rb") as f:
                content = await f.read()
        except FileNotFoundError:
            raise BlobNotFoundError(
                message=f"Blob '{blob_id}' not found.",
                status_code=404,
                details={"blob_id": blob_id},
            )
        except OSError as e:
            raise BlobServiceException(
                message="Failed to read blob from storage.",
                status_code=500,
                details={"reason": str(e)},
            )
    
        return {
            "blob_id": blob_id,
            "content": content,
            "file_size": len(content),
        }

    async def delete(self): ...

    async def list(self): ...