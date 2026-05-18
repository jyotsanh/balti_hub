# third-party imports
from loguru import logger
from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError

# mongo packages
from pymongo import AsyncMongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# beanie
from beanie import Document, Indexed, init_beanie

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
from src.auth import get_hashed_password
# models
from src.models import UserDocument, BlobDocument

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
   
    if settings.MONGO_URI: # check if mongo URI is given or not.
        # If URI exists in .env, use it
        mongo_connection_string = settings.MONGO_URI
        logger.info("Initializing MongoDB client using MONGO_URI from env...")
    else:
        # Fallback to local configuration
        mongo_connection_string = f"mongodb://{settings.MONGO_HOST}:{settings.MONGO_PORT}"
        logger.info(
            f"MONGO_URI missing. Initializing "
            f"Local MongoDB at {settings.MONGO_HOST}:{settings.MONGO_PORT}..."
        )

    # mongo initialization
    app.state.mongo_client = AsyncMongoClient(
        mongo_connection_string,
        serverSelectionTimeoutMS=5000
    )
    try:
    
        result  = await app.state.mongo_client.admin.command("ping")
        logger.info(f"Ping successful! Result: {result}")
        logger.info("Mongo connection initialized")
    
    except ConnectionFailure as e:
        logger.error(f"Unable to connect to the server: \n{e}")
        raise RuntimeError(f"MongoDB Unable to Ping: {e}") from e
    except ServerSelectionTimeoutError as e:
        # 5. Log as ERROR and re-raise to stop app startup
        logger.error(f"CRITICAL: Unable to connect to MongoDB. App startup failed. Error: \n{e}")
        raise RuntimeError(f"MongoDB unavailable at startup: {e}") from e

    # beanie initialization
    await init_beanie(
        database=app.state.mongo_client[settings.MONGO_DB], 
        document_models=[UserDocument, BlobDocument]
    )
    user = await UserDocument.find_one({"email": settings.FIRST_SUPERUSER})
    if not user:
        user = UserDocument(
            email=settings.FIRST_SUPERUSER,
            hashed_password=get_hashed_password(settings.FIRST_SUPERUSER_PASSWORD),
            is_superuser=True,
        )
        await user.create()

    yield

    await app.state.redis_client.close()  
    await app.state.mongo_client.close()

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

## Exception handlers
app.add_exception_handler(AppBaseException, api_exception_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

app.include_router(api_router, prefix=settings.API_V1_STR)
