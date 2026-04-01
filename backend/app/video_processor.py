"""
Video Processing Module
Handles silence detection and video cutting using FFmpeg.
Optimized for speed using stream copy (no re-encoding).
"""
import os
import re
import subprocess
import tempfile
import uuid
from pathlib import Path
from typing import List, Tuple, Optional
import logging

logger = logging.getLogger(__name__)


class SilenceSegment:
    """Represents a segment of silence in a video."""

    def __init__(self, start: float, end: float):
        self.start = start
        self.end = end

    @property
    def duration(self) -> float:
        return self.end - self.start

    def __repr__(self) -> str:
        return f"SilenceSegment({self.start:.3f}s - {self.end:.3f}s)"


class VideoProcessor:
    """
    Professional video processor for automatic silence removal.
    Uses FFmpeg's silencedetect filter for analysis and
    stream copy for fast processing without re-encoding.
    """

    def __init__(
        self,
        silence_threshold_db: int = -30,
        silence_duration_sec: float = 0.5,
        padding_sec: float = 0.1
    ):
        self.silence_threshold_db = silence_threshold_db
        self.silence_duration_sec = silence_duration_sec
        self.padding_sec = padding_sec

    def get_video_duration(self, video_path: str) -> float:
        """
        Get video duration using ffprobe.

        Args:
            video_path: Path to video file

        Returns:
            Duration in seconds
        """
        try:
            cmd = [
                "ffprobe",
                "-v", "error",
                "-show_entries", "format=duration",
                "-of", "default=noprint_wrappers=1:nokey=1",
                video_path
            ]
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return float(result.stdout.strip())
        except FileNotFoundError:
            logger.error("FFprobe not found! Install FFmpeg: https://ffmpeg.org/download.html")
            raise RuntimeError("FFmpeg not installed. Install from https://ffmpeg.org/download.html")
        except Exception as e:
            logger.error(f"Failed to get video duration: {e}")
            return 0.0

    def detect_silence(self, video_path: str) -> List[SilenceSegment]:
        """
        Detect silence segments in video using FFmpeg silencedetect filter.

        Algorithm:
        1. FFmpeg analyzes audio stream for segments below threshold
        2. Parses output to extract silence_start and silence_end timestamps
        3. Filters segments by minimum duration
        4. Returns list of SilenceSegment objects

        Args:
            video_path: Path to input video

        Returns:
            List of detected silence segments
        """
        logger.info(
            "Starting silence detection",
            video_path=video_path,
            threshold_db=self.silence_threshold_db,
            min_duration=self.silence_duration_sec
        )

        # Build FFmpeg command with silencedetect filter
        cmd = [
            "ffmpeg",
            "-i", video_path,
            "-af", f"silencedetect=noise={self.silence_threshold_db}dB:d={self.silence_duration_sec}",
            "-f", "null",
            "-"
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                stderr=subprocess.STDOUT
            )
            output = result.stdout

            # Parse silence detection output
            silence_segments = self._parse_silence_output(output)

            logger.info(
                "Silence detection complete",
                segments_found=len(silence_segments)
            )

            return silence_segments

        except Exception as e:
            logger.error("Silence detection failed", error=str(e))
            return []

    def _parse_silence_output(self, ffmpeg_output: str) -> List[SilenceSegment]:
        """
        Parse FFmpeg silence detection output.

        FFmpeg outputs lines like:
        [silencedetect @ 0x...] silence_start: 1.234
        [silencedetect @ 0x...] silence_end: 2.567 | silence_duration: 1.333

        Args:
            ffmpeg_output: Raw FFmpeg output

        Returns:
            List of SilenceSegment objects
        """
        silence_segments = []
        silence_start: Optional[float] = None

        # Regex patterns for parsing
        start_pattern = re.compile(r'silence_start:\s*([\d.]+)')
        end_pattern = re.compile(r'silence_end:\s*([\d.]+)')

        for line in ffmpeg_output.split('\n'):
            # Check for silence_start
            start_match = start_pattern.search(line)
            if start_match:
                silence_start = float(start_match.group(1))
                continue

            # Check for silence_end
            end_match = end_pattern.search(line)
            if end_match and silence_start is not None:
                silence_end = float(end_match.group(1))
                segment = SilenceSegment(silence_start, silence_end)

                # Only include if meets duration requirement
                if segment.duration >= self.silence_duration_sec:
                    silence_segments.append(segment)

                silence_start = None

        return silence_segments

    def calculate_keep_segments(
        self,
        silence_segments: List[SilenceSegment],
        video_duration: float
    ) -> List[Tuple[float, float]]:
        """
        Calculate segments to keep (inverse of silence segments).

        Applies padding to silence boundaries to ensure natural cuts.

        Args:
            silence_segments: List of detected silence segments
            video_duration: Total video duration

        Returns:
            List of (start, end) tuples for segments to keep
        """
        if not silence_segments:
            return [(0, video_duration)]

        keep_segments = []
        current_pos = 0.0

        for silence in silence_segments:
            # Calculate segment to keep with padding
            keep_end = max(0, silence.start + self.padding_sec)

            if keep_end > current_pos:
                keep_segments.append((current_pos, keep_end))

            # Move position to after silence (with padding)
            current_pos = min(video_duration, silence.end - self.padding_sec)

        # Add final segment if there's content after last silence
        if current_pos < video_duration:
            keep_segments.append((current_pos, video_duration))

        return keep_segments

    def process_video(
        self,
        input_path: str,
        output_path: str,
        keep_original_codec: bool = True
    ) -> dict:
        """
        Process video by removing silence segments.

        Strategy:
        1. Detect silence segments
        2. Calculate keep segments (with padding)
        3. Create segment list for FFmpeg concat
        4. Use stream copy for fastest processing

        Args:
            input_path: Path to input video
            output_path: Path for output video
            keep_original_codec: Use stream copy (no re-encoding)

        Returns:
            Processing statistics dictionary
        """
        import time
        start_time = time.time()

        logger.info("Starting video processing", input=input_path, output=output_path)

        # Get original duration
        original_duration = self.get_video_duration(input_path)

        # Detect silence
        silence_segments = self.detect_silence(input_path)

        if not silence_segments:
            logger.info("No silence detected, copying file as-is")
            # Just copy the file
            if keep_original_codec:
                cmd = [
                    "ffmpeg",
                    "-y",
                    "-i", input_path,
                    "-c", "copy",
                    output_path
                ]
            else:
                cmd = ["ffmpeg", "-y", "-i", input_path, output_path]

            subprocess.run(cmd, capture_output=True, check=True)

            return {
                "success": True,
                "original_duration_sec": original_duration,
                "processed_duration_sec": original_duration,
                "time_saved_sec": 0,
                "cuts_made": 0,
                "processing_time_sec": time.time() - start_time
            }

        # Calculate keep segments
        keep_segments = self.calculate_keep_segments(silence_segments, original_duration)

        if not keep_segments:
            logger.warning("All video would be removed, keeping original")
            return {
                "success": False,
                "error": "Silence parameters would remove entire video"
            }

        # Create concat file list for FFmpeg
        concat_file = self._create_concat_list(input_path, keep_segments)

        try:
            # Run FFmpeg concat
            cmd = [
                "ffmpeg",
                "-y",
                "-f", "concat",
                "-safe", "0",
                "-i", concat_file,
            ]

            if keep_original_codec:
                cmd.extend(["-c", "copy"])

            cmd.append(output_path)

            logger.info("Running FFmpeg concat", command=" ".join(cmd))

            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True
            )

            if result.returncode != 0:
                logger.error("FFmpeg concat failed", error=result.stderr)
                raise RuntimeError(f"FFmpeg failed: {result.stderr}")

            # Get processed duration
            processed_duration = self.get_video_duration(output_path)
            time_saved = original_duration - processed_duration

            processing_time = time.time() - start_time

            logger.info(
                "Video processing complete",
                original_duration=original_duration,
                processed_duration=processed_duration,
                time_saved=time_saved,
                cuts_made=len(silence_segments),
                processing_time_sec=processing_time
            )

            return {
                "success": True,
                "original_duration_sec": original_duration,
                "processed_duration_sec": processed_duration,
                "time_saved_sec": time_saved,
                "cuts_made": len(silence_segments),
                "processing_time_sec": processing_time
            }

        finally:
            # Cleanup concat file
            if os.path.exists(concat_file):
                os.remove(concat_file)

    def _create_concat_list(
        self,
        input_path: str,
        keep_segments: List[Tuple[float, float]]
    ) -> str:
        """
        Create FFmpeg concat demuxer file.

        Format:
        file '/path/to/video.mp4'
        inpoint 0.000
        outpoint 5.234
        file '/path/to/video.mp4'
        inpoint 10.456
        outpoint 20.789

        Args:
            input_path: Path to input video
            keep_segments: List of (start, end) tuples

        Returns:
            Path to temporary concat file
        """
        # Use absolute path for FFmpeg concat
        abs_path = os.path.abspath(input_path)

        # Escape single quotes in path
        escaped_path = abs_path.replace("'", "'\\''")

        concat_content = []
        for start, end in keep_segments:
            concat_content.append(f"file '{escaped_path}'")
            concat_content.append(f"inpoint {start:.6f}")
            concat_content.append(f"outpoint {end:.6f}")

        # Write to temporary file
        concat_file = os.path.join(tempfile.gettempdir(), f"concat_{uuid.uuid4()}.txt")
        with open(concat_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(concat_content))

        return concat_file


def check_ffmpeg() -> bool:
    """Check if FFmpeg is installed and accessible."""
    try:
        subprocess.run(
            ["ffmpeg", "-version"],
            capture_output=True,
            check=True
        )
        return True
    except (subprocess.CalledProcessError, FileNotFoundError):
        return False
