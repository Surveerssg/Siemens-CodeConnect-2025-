from fastapi import FastAPI, UploadFile, File, HTTPException, Query, Request
from fastapi.responses import FileResponse
from sync import Sync
from sync.common import Audio, Video, GenerationOptions
from sync.core.api_error import ApiError
import os
import uuid
import time
from tqdm import tqdm
from dotenv import load_dotenv
import requests

# Load environment variables
load_dotenv()

app = FastAPI(title="Sync.so Lip-Sync API")

# Get API key from .env
API_KEY = os.getenv("SYNC_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing SYNC_API_KEY in environment variables")

# Initialize Sync client
client = Sync(base_url="https://api.sync.so", api_key=API_KEY).generations

UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

PREDEFINED_VIDEOS = {
    # The FILE_ID is '1zEQnsgkUrFHGZDRzFPmxYXm0qKNREDFI'
    "video1": "https://drive.google.com/uc?export=download&id=1zEQnsgkUrFHGZDRzFPmxYXm0qKNREDFI",
    "video2": "https://drive.google.com/uc?export=download&id=YOUR_VIDEO2_ID"
}

# ---------------------- Helper functions ----------------------

def save_upload(file: UploadFile) -> str:
    """Save uploaded file locally and return path."""
    filename = f"{uuid.uuid4().hex}_{file.filename}"
    path = os.path.join(UPLOAD_FOLDER, filename)
    with open(path, "wb") as f:
        f.write(file.file.read())
    return path

@app.get("/uploads/{filename}")
async def serve_uploaded_file(filename: str):
    """Serve uploaded files via URL (used by Sync.so)."""
    file_path = os.path.join(UPLOAD_FOLDER, filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_path, media_type="audio/wav")

# ---------------------- Main Endpoint ----------------------

@app.post("/generate-lipsync/")
async def generate_lipsync(
    request: Request,
    audio: UploadFile = File(...),
    video_choice: str = Query("video1", description="Choose predefined video: video1 or video2")
):
    if video_choice not in PREDEFINED_VIDEOS:
        raise HTTPException(status_code=400, detail="Invalid video choice")

    video_url = PREDEFINED_VIDEOS[video_choice]

    try:
        # Save uploaded audio locally
        audio_path = save_upload(audio)
        filename = os.path.basename(audio_path)

        # Build accessible URL for Sync.so
        base_url = str(request.base_url).rstrip("/")
        audio_url = f"{base_url}/uploads/{filename}"

        # Start Sync.so generation
        response = client.create(
            input=[Video(url=video_url), Audio(url=audio_url)],
            model="lipsync-2",
            options=GenerationOptions(sync_mode="cut_off")
        )

        job_id = response.id
        status = "PENDING"
        progress_bar = tqdm(total=100, desc="Processing", position=0)

        # Poll until complete
        while status not in ["COMPLETED", "FAILED"]:
            time.sleep(5)
            generation = client.get(job_id)
            status = generation.status
            progress_bar.update(5)
            progress_bar.set_postfix_str(f"Status: {status}")

        progress_bar.close()

        if status == "COMPLETED":
            # Download generated video
            output_file = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4().hex}_lipsync.mp4")
            r = requests.get(generation.output_url, stream=True)
            with open(output_file, "wb") as f:
                for chunk in r.iter_content(chunk_size=8192):
                    f.write(chunk)

            return FileResponse(
                path=output_file,
                filename="lipsync_video.mp4",
                media_type="video/mp4"
            )
        else:
            raise HTTPException(status_code=500, detail="Generation failed")

    except ApiError as e:
        raise HTTPException(status_code=e.status_code, detail=e.body)

    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)
