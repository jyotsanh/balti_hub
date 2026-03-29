from pydantic import AnyHttpUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_ignore_empty=True, # ignore empty key
        extra="ignore" # ignores extra key if provided
    )

    # project-setting
    PROJECT_NAME:str="BaltiHub Service"
    API_V1_STR:str = "/api/v1"
    # cors
    BACKEND_CORS_ORIGINS:list[AnyHttpUrl] = [
        "http://localhost:8015",
        "http://localhost:8000"
    ]
    ALLOW_CREDENTIALS:bool = False
    API_LIMIT:int = 20
    API_WINDOW:int = 60

    # Production HOST & PORT
    PROD_HOST:str = "0.0.0.0"
    PROD_PORT:int = 8015

    # Development HOST & PORT
    DEV_HOST:str = "localhost"
    DEV_PORT:int = 8015

    # Redis HOST & PORT
    REDIS_HOST:str = "localhost"
    REDIS_PORT:int = 6379
    REDIS_TTL:int = 60*60*8
    REDIS_PASSWORD: str | None = None
    REDIS_DB: int = 0

settings = Settings()