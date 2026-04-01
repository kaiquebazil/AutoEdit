"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, Field
from typing import Optional


class VideoProcessRequest(BaseModel):
    """Request model for video processing parameters."""

    silence_threshold_db: int = Field(
        default=-30,
        ge=-60,
        le=-10,
        description="Silence threshold in dB (lower = more sensitive)"
    )

    silence_duration_sec: float = Field(
        default=0.5,
        ge=0.1,
        le=5.0,
        description="Minimum silence duration to detect (seconds)"
    )

    padding_sec: float = Field(
        default=0.1,
        ge=0.0,
        le=1.0,
        description="Padding added to cuts (seconds)"
    )

    keep_original_audio: bool = Field(
        default=True,
        description="Preserve original audio codec (no re-encoding)"
    )


class VideoProcessResponse(BaseModel):
    """Response model for video processing status."""

    success: bool
    message: str
    original_duration_sec: Optional[float] = None
    processed_duration_sec: Optional[float] = None
    time_saved_sec: Optional[float] = None
    cuts_made: Optional[int] = None
    download_url: Optional[str] = None


class HealthResponse(BaseModel):
    """Health check response model."""

    status: str
    version: str
    ffmpeg_available: bool
