from fastapi import APIRouter, Depends, UploadFile

from src.schemas import BlobUploadResponse, BlobMetadata
from src.service import BlobStorageService
from .deps import get_blob_service


blob_router = APIRouter()


@blob_router.post(
    path="/upload",
    response_model=BlobUploadResponse,
    status_code=201,
)
async def upload_blob(
    file: UploadFile,
    service: BlobStorageService = Depends(get_blob_service),
) -> BlobUploadResponse:
    result = await service.save(file)
    return BlobUploadResponse(
        blob_id=result["blob_id"],
        file_metadata=BlobMetadata(
            file_name=result["file_name"],
            file_size=result["file_size"],
            file_type=result["file_type"],
        ),
    )



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
