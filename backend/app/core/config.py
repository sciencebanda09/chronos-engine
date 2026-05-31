from pydantic_settings import BaseSettings
from typing import List
import os
class Settings(BaseSettings):
    DATABASE_URL: str = "sqlite:///./chronos.db"
    OLLAMA_URL: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "qwen2.5:14b"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]
    APP_ENV: str = "development"
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
settings = Settings()