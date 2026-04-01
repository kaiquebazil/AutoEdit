"""
FastAPI Application - Video Silence Cutter API
Full-stack video processing backend with CORS support.
"""
import os
import uuid
import logging
from pathlib import Path
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, HTTPException, Query, status
from fastapi.responses import FileResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .models import VideoProcessRequest, VideoProcessResponse, HealthResponse
from .video_processor import VideoProcessor, check_ffmpeg

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)
settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    logger.info(f"Starting Video Silence Cutter API v{settings.API_VERSION}")

    # Ensure upload directory exists
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

    # Check FFmpeg availability
    if not check_ffmpeg():
        logger.error("FFmpeg not found! Video processing will fail.")
    else:
        logger.info("FFmpeg detected and ready")

    yield

    # Cleanup on shutdown
    logger.info("Shutting down API")


# Initialize FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    description=settings.API_DESCRIPTION,
    lifespan=lifespan
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)


@app.get("/", response_model=dict)
async def root():
    """Root endpoint - API information."""
    return {
        "name": settings.API_TITLE,
        "version": settings.API_VERSION,
        "status": "operational",
        "docs": "/docs"
    }


@app.get("/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint for monitoring."""
    ffmpeg_ok = check_ffmpeg()
    if not ffmpeg_ok:
        logger.warning("FFmpeg not found in system!")
    return HealthResponse(
        status="healthy" if ffmpeg_ok else "degraded",
        version=settings.API_VERSION,
        ffmpeg_available=ffmpeg_ok
    )


@app.get("/test-ffmpeg")
async def test_ffmpeg():
    """Test FFmpeg installation and return details."""
    import subprocess
    try:
        result = subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            text=True
        )
        version_line = result.stdout.split('\n')[0] if result.stdout else "Unknown"
        return {
            "installed": True,
            "version": version_line,
            "path": "System PATH"
        }
    except FileNotFoundError:
        return {
            "installed": False,
            "error": "FFmpeg not found. Install from https://ffmpeg.org/download.html",
            "windows_help": "Download, extract to C:\ffmpeg, add C:\ffmpeg\bin to PATH"
        }


@app.post(
    "/process-video",
    response_model=VideoProcessResponse,
    status_code=status.HTTP_200_OK
)
async def process_video(
    file: UploadFile = File(..., description="Video file to process (MP4, MOV, AVI supported)"),
    threshold_db: int = Query(
        default=settings.DEFAULT_SILENCE_THRESHOLD_DB,
        ge=-60,
        le=-10,
        description="Silence detection threshold in dB (e.g., -30)"
    ),
    silence_duration: float = Query(
        default=settings.DEFAULT_SILENCE_DURATION_SEC,
        ge=0.1,
        le=5.0,
        description="Minimum silence duration in seconds"
    ),
    padding: float = Query(
        default=settings.DEFAULT_PADDING_SEC,
        ge=0.0,
        le=1.0,
        description="Padding around cuts in seconds"
    ),
    keep_codec: bool = Query(
        default=True,
        description="Keep original codec (faster) vs re-encode (smaller)"
    )
):
    """
    Upload and process a video file to remove silence.

    This endpoint:
    1. Receives a video file upload
    2. Detects silence using FFmpeg silencedetect
    3. Cuts silence segments with specified padding
    4. Returns the processed video

    ## Parameters
    - **threshold_db**: Silence threshold (-60 to -10 dB). Default: -30
    - **silence_duration**: Minimum silence to cut (0.1 to 5.0 sec). Default: 0.5
    - **padding**: Padding around cuts (0.0 to 1.0 sec). Default: 0.1
    - **keep_codec**: Use stream copy for speed. Default: true

    ## Returns
    Processed video file (binary) with metadata in headers
    """
    import aiofiles

    # Validate file
    if not file.content_type or not file.content_type.startswith("video/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid file type: {file.content_type}. Please upload a video file."
        )

    # Generate unique IDs
    file_id = str(uuid.uuid4())
    input_path = Path(settings.UPLOAD_DIR) / f"{file_id}_input.mp4"
    output_path = Path(settings.UPLOAD_DIR) / f"{file_id}_output.mp4"

    try:
        # Save uploaded file
        logger.info(
            f"Saving upload: {file.filename} ({file.content_type}, "
            f"{getattr(file, 'size', 'unknown')} bytes)"
        )

        content = await file.read()

        # Check file size
        if len(content) > settings.max_upload_size_bytes:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File too large. Max size: {settings.MAX_UPLOAD_SIZE_MB}MB"
            )

        async with aiofiles.open(input_path, 'wb') as f:
            await f.write(content)

        # Process video
        logger.info(
            f"Starting processing: threshold={threshold_db}dB, "
            f"silence_duration={silence_duration}s, padding={padding}s, keep_codec={keep_codec}"
        )

        processor = VideoProcessor(
            silence_threshold_db=threshold_db,
            silence_duration_sec=silence_duration,
            padding_sec=padding
        )

        result = processor.process_video(
            str(input_path),
            str(output_path),
            keep_original_codec=keep_codec
        )

        if not result.get("success"):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result.get("error", "Processing failed")
            )

        # Check output file exists
        if not output_path.exists():
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Output file not generated"
            )

        # Return processed video
        logger.info(
            f"Processing complete: time_saved={result.get('time_saved_sec')}s, "
            f"cuts={result.get('cuts_made')}"
        )

        return FileResponse(
            path=str(output_path),
            media_type="video/mp4",
            filename=f"cut_{file.filename or 'video.mp4'}",
            headers={
                "X-Original-Duration": str(result.get("original_duration_sec", 0)),
                "X-Processed-Duration": str(result.get("processed_duration_sec", 0)),
                "X-Time-Saved": str(result.get("time_saved_sec", 0)),
                "X-Cuts-Made": str(result.get("cuts_made", 0)),
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_msg = str(e)
        stack_trace = traceback.format_exc()
        logger.error(f"Processing error: {error_msg}\n{stack_trace}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {error_msg}"
        )

    finally:
        # Cleanup files
        for path in [input_path, output_path]:
            try:
                if path.exists():
                    path.unlink()
                    logger.debug(f"Cleaned up file: {path}")
            except Exception as e:
                logger.warning(f"Failed to cleanup file {path}: {e}")


@app.get("/process-video/stream")
async def process_video_stream(
    file: UploadFile = File(...),
    threshold_db: int = Query(default=-30),
    silence_duration: float = Query(default=0.5),
    padding: float = Query(default=0.1)
):
    """
    Stream-process a video (for large files).
    Returns the video as a streaming response.
    """
    # Similar to process_video but with streaming support
    # For now, delegate to main processor
    pass


@app.delete("/cleanup")
async def cleanup_uploads():
    """Admin endpoint to clean up old upload files."""
    import glob
    import time

    deleted_count = 0
    current_time = time.time()
    max_age_hours = 24

    pattern = os.path.join(settings.UPLOAD_DIR, "*_input.mp4")
    for file_path in glob.glob(pattern):
        try:
            age_hours = (current_time - os.path.getctime(file_path)) / 3600
            if age_hours > max_age_hours:
                os.remove(file_path)
                deleted_count += 1
        except Exception as e:
            logger.warning(f"Failed to delete file {file_path}: {e}")

    return {"deleted_files": deleted_count}
