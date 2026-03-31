from fastapi import APIRouter

from .blob_routes import blob_router
from .login_routes import login_router
from .user_routes import user_router
api_router = APIRouter()

# blob routes
# TODO (jyotsanh):
# - add db connection for file metadata storage.
# - add authentication and authorization for blob.
# - add bucket based service.
api_router.include_router(blob_router, prefix="/blob", tags=["Blob API"])
api_router.include_router(login_router, prefix="/login", tags=["Login"])
api_router.include_router(user_router, prefix="/user", tags=["Users"])