from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from sync import Sync
from sync.common import Audio, Video, GenerationOptions
from sync.core.api_error import ApiError
import os, uuid, time, requests, cloudinary, cloudinary.uploader
from tqdm import tqdm
from dotenv import load_dotenv
from starlette.status import HTTP_202_ACCEPTED # Not used in this version, but kept for context
from fastapi.middleware.cors import CORSMiddleware

# ------------------- Load Environment -------------------
load_dotenv()

app = FastAPI(title="Sync.so Lip-Sync API")

# --- CORS Middleware (ALLOWS FRONTEND TO CONNECT) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Sync API Key
API_KEY = os.getenv("SYNC_API_KEY")
if not API_KEY:
    raise RuntimeError("Missing SYNC_API_KEY in environment variables")

# Initialize Sync client
client = Sync(base_url="https://api.sync.so", api_key=API_KEY).generations

# Cloudinary Setup
CLOUDINARY_URL = os.getenv("CLOUDINARY_URL")
if not CLOUDINARY_URL:
    raise RuntimeError("Missing CLOUDINARY_URL in environment variables")

cloudinary.config(cloudinary_url=CLOUDINARY_URL)

# Local folder (for temp save)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Predefined videos
PREDEFINED_VIDEOS = {
    "video1": "https://drive.google.com/uc?export=download&id=1zEQnsgkUrFHGZDRzFPmxYXm0qKNREDFI"
}

# ------------------- Main Endpoint -------------------
@app.post("/generate-lipsync/")
async def generate_lipsync(
    audio: UploadFile = File(...),
    video_choice: str = Query("video1", description="Choose predefined video")
):
    if video_choice not in PREDEFINED_VIDEOS:
        raise HTTPException(status_code=400, detail="Invalid video choice")

    video_url = PREDEFINED_VIDEOS[video_choice]
    audio_path = os.path.join(UPLOAD_FOLDER, f"{uuid.uuid4().hex}_{audio.filename}")
    
    # Initialize variables for cleanup
    audio_file_saved = False 

    try:
        # Save audio locally
        with open(audio_path, "wb") as f:
            f.write(await audio.read())
        audio_file_saved = True # Mark that the file exists for cleanup

        # Upload audio to Cloudinary (get public URL)
        upload_result = cloudinary.uploader.upload(audio_path, resource_type="video")
        public_audio_url = upload_result["secure_url"]

        print(f"🎵 Uploaded audio to Cloudinary: {public_audio_url}")

        # Start Sync.so generation
        response = client.create(
            input=[Video(url=video_url), Audio(url=public_audio_url)],
            model="lipsync-2",
            options=GenerationOptions(sync_mode="cut_off")
        )

        job_id = response.id
        status = "PENDING"
        progress_bar = tqdm(total=100, desc="Processing", position=0)
        progress_increment = 5  # Simple time-based increment

        # Polling Loop (Synchronous)
        while status not in ["COMPLETED", "FAILED", "REJECTED"]:
            time.sleep(5)
            generation = client.get(job_id)
            status = generation.status
            
            # ------------------- FIX FOR AttributeError: 'Generation' object has no attribute 'progress' -------------------
            if status == "PROCESSING" and progress_bar.n < 90:
                progress_bar.update(progress_increment)
            elif status in ["COMPLETED", "FAILED", "REJECTED"]:
                # Ensure the bar is complete when the job is done
                progress_bar.n = 100 
                
            progress_bar.set_postfix_str(f"Status: {status}")

        progress_bar.close()

        if status == "COMPLETED":
            return JSONResponse(
                content={
                    "message": "Lipsync generation completed successfully.",
                    "video_url": generation.output_url
                }
            )
        else:
            # Handle FAILED or REJECTED status
            error_detail = generation.error_message if generation.error_message else "Generation failed without a specific message."
            raise HTTPException(status_code=500, detail=f"Generation failed. Status: {status}. Detail: {error_detail}")

    except ApiError as e:
        # Sync.so API errors (e.g., 400 Bad Request)
        raise HTTPException(status_code=e.status_code, detail=e.body)
    
    except Exception as e:
        # General unexpected errors (e.g., network, file system, or a misattributed variable)
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An unexpected server error occurred: {e}")

    finally:
        # Clean up the locally saved audio file only if it was actually saved
        if audio_file_saved and os.path.exists(audio_path):
            os.remove(audio_path)
