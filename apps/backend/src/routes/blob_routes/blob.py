from fastapi import APIRouter, Depends, UploadFile, Response, Request

from src.schemas import BlobUploadResponse, BlobMetadata, BlobListResponse
from src.models import UserDocument, BlobDocument
from src.service import BlobStorageService
from src.service.blob_storage_service.exception import BlobUploadLimitError
from src.auth import get_current_active_user
from .deps import get_blob_service, validate_blob_id


blob_router = APIRouter()


@blob_router.post(
    path="/upload",
    response_model=BlobUploadResponse,
    status_code=201,
)
async def upload_blob(
    request: Request,
    file: UploadFile,
    service: BlobStorageService = Depends(get_blob_service),
    current_user: UserDocument = Depends(get_current_active_user)
) -> BlobUploadResponse:
    """
    
    """
    if current_user.blob_count >= 5:
        raise BlobUploadLimitError(
            status_code=403,
            message="maximum blob uploads reached",
            details={}
        )
    
    result = await service.save(
        file=file,
        user_uuid=current_user.uuid
    )
    await current_user.inc({UserDocument.blob_count: 1})
    return BlobUploadResponse(
        blob_id=result["blob_id"],
        blob_url=str(request.url_for("get_blob", blob_id=result["blob_id"])),
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
    current_user: UserDocument = Depends(get_current_active_user)
):
    result = await service.get(
        blob_id=blob_id,
        user_uuid=current_user.uuid    
    )
    return Response(
        content=result["content"],
        media_type="application/octet-stream",
        headers={
            "X-Blob-Size": str(result["file_size"])
        },
    )

@blob_router.delete(
    path="/{blob_id}",
    status_code=204
)
async def delete_blob(
    blob_id: str = Depends(validate_blob_id),
    service: BlobStorageService = Depends(get_blob_service),
    current_user: UserDocument = Depends(get_current_active_user)
):
    await service.delete(
        blob_id=blob_id,
        user_uuid=current_user.uuid
    )

    #  stops blob_count from going negative
    if current_user.blob_count > 0:
        await current_user.inc({UserDocument.blob_count: -1})
    
    return Response(
        status_code=204
    )
    

    


@blob_router.get(
    path="/",
    response_model=BlobListResponse
)
async def list_blobs(
    request: Request,
    service: BlobStorageService = Depends(get_blob_service),
    current_user: UserDocument = Depends(get_current_active_user)
) -> BlobListResponse:
    blob_list = await service.list_blob(user_uuid=current_user.uuid)
    
    return BlobListResponse(
        blobs=[str(request.url_for("get_blob", blob_id=blob_id)) for blob_id in blob_list],
        total=len(blob_list)
    )