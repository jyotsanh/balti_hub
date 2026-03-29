# third-party imports
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# application
from src.config import settings
from src.middlewares import (
    RateLimiterMiddleware, 
    SecurityHeadersMiddleware, 
    ProcessTimeMiddleware
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Middleware layers
## Layer 1: cors middleware
app.add_middleware(
    CORSMiddleware,
    # TODO, implement BACKEND_CORS_ORIGINS list based on server start mode.
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    # TODO: important implement 'True' for cors origins.
    allow_credentials=settings.ALLOW_CREDENTIALS,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Layer 2: Rate limit middleware (50 sec , 20 request)
app.add_middleware(
    RateLimiterMiddleware,
    limit=settings.API_LIMIT, 
    window=settings.API_WINDOW
)

## Layer 3: add security header middleware
app.add_middleware(SecurityHeadersMiddleware)

## Layer 4: middleware for tracking response time.
app.add_middleware(ProcessTimeMiddleware)


# app.include_router(api_router, prefix=settings.API_V1_STR)
