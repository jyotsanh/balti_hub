from src.service import BlobStorageService
from pathlib import Path


def get_blob_service() -> BlobStorageService:
    return BlobStorageService(storage_path=Path("temp_storage"))