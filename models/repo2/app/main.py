from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import tempfile
import json
import subprocess
import os
from io import BytesIO
from vosk import Model, KaldiRecognizer
import numpy as np
import soundfile as sf
import wave
# Assuming app.utils contains the optimized functions from the previous exchange
from app.utils import compute_acoustic_score, compute_phoneme_score 

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configuration
MODEL_PATH = "models/vosk-model-small-en-us-0.15"

# Load Model once at startup (Optimization)
try:
    model = Model(MODEL_PATH)
except Exception as e:
    # Handle case where model is not found, crucial for deployment
    print(f"Error loading Vosk model: {e}")
    model = None

@app.post("/analyze/")
async def analyze(audio: UploadFile = File(...), text: str = Form(...)):
    if not model:
        raise HTTPException(status_code=500, detail="Vosk model failed to load.")

    temp_files_to_delete = []
    
    # ----------------------
    # 1. Save uploaded file temporarily (initial read)
    # ----------------------
    # Read the audio file content into memory initially
    audio_content = await audio.read()
    
    # Write to a temp file to ensure 'ffmpeg' can access it, regardless of the input format
    with tempfile.NamedTemporaryFile(delete=False, suffix=f".{audio.filename.split('.')[-1]}") as tmp_input:
        tmp_input.write(audio_content)
        tmp_input_path = tmp_input.name
    temp_files_to_delete.append(tmp_input_path)

    # ----------------------
    # 2. Convert/Standardize to mono 16kHz WAV using ffmpeg
    # (The key is to always standardize to what Vosk and acoustic scoring need)
    # ----------------------
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp_fixed:
        tmp_fixed_path = tmp_fixed.name
    temp_files_to_delete.append(tmp_fixed_path)

    try:
        # Use a more robust ffmpeg command to always convert to 16kHz, mono, 16-bit PCM WAV
        # This handles conversion if the input is not WAV or if it's not 16kHz/mono.
        result = subprocess.run(
            [
                "ffmpeg", "-y", "-i", tmp_input_path, 
                "-ac", "1",           # Mono channel
                "-ar", "16000",        # 16kHz sample rate
                "-f", "wav",          # Ensure output format is WAV
                "-acodec", "pcm_s16le", # PCM 16-bit Little Endian (Vosk default/preferred)
                tmp_fixed_path
            ],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=True # Raise an error if ffmpeg fails
        )
    except subprocess.CalledProcessError:
        # Cleanup files if ffmpeg fails
        for f in temp_files_to_delete:
            if os.path.exists(f):
                os.remove(f)
        raise HTTPException(status_code=400, detail="Audio file conversion failed. Ensure a valid audio file was uploaded.")

    try:
        # ----------------------
        # 3. Acoustic score (using soundfile)
        # ----------------------
        # Read the standardized WAV file for numerical processing
        y, sr = sf.read(tmp_fixed_path, dtype="float32")
        acoustic_score = compute_acoustic_score(y, sr)

        # ----------------------
        # 4. Vosk recognition (using wave module)
        # ----------------------
        wf = wave.open(tmp_fixed_path, "rb")
        
        # Check if sample rate is correct (16000 Hz)
        if wf.getframerate() != 16000:
             # Should not happen if ffmpeg worked correctly, but good defensive check
             raise ValueError("Vosk requires 16000 Hz sample rate. Conversion failed.")

        rec = KaldiRecognizer(model, wf.getframerate())
        predicted_text = ""
        while True:
            # Read a larger chunk of frames (e.g., 32000) for potentially faster processing
            data = wf.readframes(32000) 
            if len(data) == 0:
                break
            if rec.AcceptWaveform(data):
                res = json.loads(rec.Result())
                predicted_text += res.get("text", "") + " "
        
        # Get final result and clean up text
        res = json.loads(rec.FinalResult())
        predicted_text += res.get("text", "")
        predicted_text = predicted_text.strip().lower()

        # ----------------------
        # 5. Compute final score
        # ----------------------
        phoneme_score = compute_phoneme_score(text.lower(), predicted_text)
        final_score = 0.6 * phoneme_score + 0.4 * acoustic_score

        return {
            "predicted_text": predicted_text,
            "phoneme_score": round(float(phoneme_score), 2),
            "acoustic_score": round(float(acoustic_score), 2),
            "final_score": round(float(final_score), 2),
        }
    
    finally:
        # ----------------------
        # 6. Cleanup (Crucial for a deployed service like Render)
        # ----------------------
        for f in temp_files_to_delete:
            if os.path.exists(f):
                os.remove(f)
