# third-party imports
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from loguru import logger

# application
from src.config import settings
from src.middlewares import (
    RateLimiterMiddleware, 
    SecurityHeadersMiddleware, 
    ProcessTimeMiddleware
)
from src.service import AsyncRedisClient
from src.routes import api_router
from src.exception_handlers import (
    api_exception_handler, 
    validation_exception_handler
)
from src.exception import AppBaseException

@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        
        rclient = AsyncRedisClient(
            host=settings.REDIS_HOST,
            port=settings.REDIS_PORT,
        )
        if not await rclient.ping(): # check redis connection
            logger.error(
                "failed connecting redis:"
                f"host:{settings.REDIS_HOST}"
                f"port:{settings.REDIS_PORT}"
            )
            raise RuntimeError("failed redis ping")
        else:
            logger.info("redis connection successfull.")
            app.state.redis_client = rclient  # AsyncRedisClient instance
    
    except ConnectionError as r_error:
        logger.error(f"redis connection error: {r_error}")
        logger.error(
                "failed connecting redis -> "
                f"host:{settings.REDIS_HOST} "
                f"port:{settings.REDIS_PORT}"
            )
        raise RuntimeError("redis connection error")
   
    yield

    await app.state.redis_client.close()  


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    lifespan=lifespan,
)

# Middleware layers
## Layer 1: cors middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        str(origin).rstrip("/")
        for origin in settings.BACKEND_CORS_ORIGINS
    ],
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


app.add_exception_handler(AppBaseException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.include_router(api_router, prefix=settings.API_V1_STR)
