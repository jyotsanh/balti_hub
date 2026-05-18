import uuid
from pathlib import Path

from fastapi import Path as PathParam
from fastapi.exceptions import RequestValidationError

from apps.backend.src.service import BlobStorageService
from apps.backend.src.config import settings

def get_blob_service() -> BlobStorageService:
    return BlobStorageService(storage_path=Path(settings.BLOB_STORAGE_PATH))

def validate_blob_id(blob_id:str = PathParam(...)) -> str:
    try:
        uuid.UUID(blob_id)
    except ValueError:
        raise RequestValidationError(
            errors=[
                {
                    "loc": ("path", "blob_id"),
                    "msg": f"'{blob_id}' is not a valid UUID.",
                    "type": "uuid_parsing",
                }
            ]
        )
    return blob_id