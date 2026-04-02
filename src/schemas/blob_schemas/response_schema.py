from pydantic import BaseModel, AnyHttpUrl


class BlobMetadata(BaseModel):
    file_name: str
    file_size: int  # bytes
    file_type: str


class BlobUploadResponse(BaseModel):
    blob_id: str
    blob_url: AnyHttpUrl
    file_metadata: BlobMetadata


class BlobListResponse(BaseModel):
    blobs: list[str]
    total: int