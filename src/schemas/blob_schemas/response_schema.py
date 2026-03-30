from pydantic import BaseModel


class BlobMetadata(BaseModel):
    file_name: str
    file_size: int  # bytes
    file_type: str


class BlobUploadResponse(BaseModel):
    blob_id: str
    file_metadata: BlobMetadata


class BlobListResponse(BaseModel): ...