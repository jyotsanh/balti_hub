from pydantic import HttpUrl
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
    BACKEND_CORS_ORIGINS:list[HttpUrl] = [
        "http://localhost:8015",
        "http://localhost:8000"
    ]
    ALLOW_CREDENTIALS:bool = False
    API_LIMIT:int = 5
    API_WINDOW:int = 20

    # Production HOST & PORT
    P_HOST:str = "0.0.0.0"
    P_PORT:int = 8015

    # Development HOST & PORT
    D_HOST:str = "localhost"
    D_PORT:int = 8015


settings = Settings()