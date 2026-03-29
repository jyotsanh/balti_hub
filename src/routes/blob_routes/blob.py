from fastapi import APIRouter, Depends

from src.service import BlobStorageService
from .deps import get_blob_service


blob_router = APIRouter()

@blob_router.post(
    path="/upload"
)
async def upload_blob(service: BlobStorageService = Depends(get_blob_service)): ...


@blob_router.get(
    path="/{blob_id}"
)
async def get_blob(service: BlobStorageService = Depends(get_blob_service)): ...


@blob_router.delete(
    path="/{blob_id}"
)
async def delete_blob(service: BlobStorageService = Depends(get_blob_service)): ...


@blob_router.get(
    path="/"
)
async def list_blobs(service: BlobStorageService = Depends(get_blob_service)): ...
