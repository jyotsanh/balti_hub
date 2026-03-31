from fastapi import APIRouter, Depends, UploadFile, Response

from src.schemas import BlobUploadResponse, BlobMetadata
from src.models import User
from src.service import BlobStorageService
from src.auth import get_current_active_user
from .deps import get_blob_service, validate_blob_id


blob_router = APIRouter()


@blob_router.post(
    path="/upload",
    response_model=BlobUploadResponse,
    status_code=201,
)
async def upload_blob(
    file: UploadFile,
    service: BlobStorageService = Depends(get_blob_service),
    current_user: User = Depends(get_current_active_user)
) -> BlobUploadResponse:
    """
    
    """
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
async def get_blob(
    blob_id: str = Depends(validate_blob_id),
    service: BlobStorageService = Depends(get_blob_service),
    current_user: User = Depends(get_current_active_user)
):
    result = await service.get(blob_id)
    return Response(
        content=result["content"],
        media_type="application/octet-stream",
        headers={"X-Blob-Size": str(result["file_size"])},
    )

@blob_router.delete(
    path="/{blob_id}",
)
async def delete_blob(
    service: BlobStorageService = Depends(get_blob_service),
    current_user: User = Depends(get_current_active_user)
): ...


@blob_router.get(
    path="/"
)
async def list_blobs(
    service: BlobStorageService = Depends(get_blob_service),
    current_user: User = Depends(get_current_active_user)
): ...
