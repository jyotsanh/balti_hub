from fastapi import APIRouter

from .blob_routes import blob_router

api_router = APIRouter()

# blob routes
api_router.include_router(blob_router, prefix="/blob", tags=["Blob API"])

