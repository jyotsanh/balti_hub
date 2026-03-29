import redis.asyncio as aredis


class AsyncRedisClient:
    """
    Thin async wrapper around redis.asyncio.Redis.

    Pass an already-constructed ``client`` when you want to reuse an
    existing connection (e.g. from app state), or let the wrapper create
    one from ``host``/``port``.
    """

    def __init__(
        self,
        client: aredis.Redis | None = None,
        host: str = "localhost",
        port: int = 6379,
    ):
        self._client: aredis.Redis = client if client is not None else aredis.Redis(
            host=host, port=port
        )


    async def ping(self) -> bool:
        return await self._client.ping()

    async def close(self) -> None:
        await self._client.aclose()


    async def incr(self, key: str) -> int:
        """Atomically increment *key* and return the new value."""
        return await self._client.incr(key)


    async def expire(self, key: str, seconds: int) -> None:
        """Set TTL on *key* only if it has no TTL yet (first request)."""
        await self._client.expire(key, seconds)


    async def ttl(self, key: str) -> int:
        """Return the remaining TTL in seconds (-1 = no TTL, -2 = missing)."""
        return await self._client.ttl(key)


