"""
Configuration module for the Video Processing API.
Uses Pydantic Settings for environment variable management.
"""
from pydantic_settings import BaseSettings
from functools import lru_cache
import os


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    # API Configuration
    API_TITLE: str = "Video Silence Cutter API"
    API_VERSION: str = "1.0.0"
    API_DESCRIPTION: str = "Professional API for automatic video silence removal"

    # CORS Settings
    # Comma-separated list of allowed origins
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # File Upload Settings
    MAX_UPLOAD_SIZE_MB: int = 500  # 500MB max upload
    UPLOAD_DIR: str = "/tmp/uploads"

    # Video Processing Defaults
    DEFAULT_SILENCE_THRESHOLD_DB: int = -30
    DEFAULT_SILENCE_DURATION_SEC: float = 0.5
    DEFAULT_PADDING_SEC: float = 0.1

    # Processing Settings
    MAX_WORKERS: int = 2

    @property
    def cors_origins_list(self) -> list[str]:
        """Parse CORS_ORIGINS string into list."""
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",") if origin.strip()]

    @property
    def max_upload_size_bytes(self) -> int:
        """Convert MB to bytes."""
        return self.MAX_UPLOAD_SIZE_MB * 1024 * 1024

    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings() -> Settings:
    """Get cached settings instance."""
    return Settings()


# Ensure upload directory exists
settings = get_settings()
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
