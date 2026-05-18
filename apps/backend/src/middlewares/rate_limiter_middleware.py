from typing import override, Callable

from fastapi import Request, status, FastAPI
from fastapi.responses import JSONResponse  # Import this
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger

from apps.backend.src.service import AsyncRedisClient


class RateLimiterMiddleware(BaseHTTPMiddleware):
    def __init__(
        self,
        app: FastAPI,
        limit: int,
        window: int,
    ):
        """
        Fixed-window rate limiter backed by Redis.

        Args:
            app    : The FastAPI application.
            limit  : Maximum requests allowed per *window* seconds.
            window : The time window length in seconds.
        """
        super().__init__(app)
        self.limit = limit
        self.window = window

    @override
    async def dispatch(self, request: Request, call_next: Callable):
        # Lazily resolve the redis client that lifespan stored on app.state.
        redis_client: AsyncRedisClient | None = getattr(
            request.app.state, "redis_client", None
        )

        # If Redis is unavailable, fail open (let the request through).
        if redis_client is None:
            logger.warning("redis connection fails, no rate limit")
            return await call_next(request)

        # Key per client IP.
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate_limit:{client_ip}"

        try:
            count = await redis_client.incr(key)
            if count == 1:
                # First request in this window — arm the expiry.
                await redis_client.expire(key, self.window)

            if count > self.limit:
                return JSONResponse(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    content={"detail": "Rate limit exceeded. Please slow down."},
                    headers={"Retry-After": str(self.window)},
                )
        except Exception:
            # Redis error — fail open so a cache outage doesn't take the API down.
            pass

        return await call_next(request)