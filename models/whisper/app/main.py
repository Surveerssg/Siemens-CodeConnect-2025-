from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
import tempfile, wave, json
from vosk import Model, KaldiRecognizer
from pydub import AudioSegment
import numpy as np
from app.utils import compute_acoustic_score, compute_phoneme_score

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------
# Load Vosk model once at startup
# -------------------------
MODEL_PATH = "models/vosk-model-small-en-us-0.15"
model = Model(MODEL_PATH)

@app.post("/analyze/")
async def analyze(audio: UploadFile = File(...), text: str = Form(...)):
    # Save uploaded audio temporarily
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    tmp.write(await audio.read())
    tmp.close()

    # Convert audio to mono 16kHz WAV using pydub
    audio_segment = AudioSegment.from_file(tmp.name)
    audio_segment = audio_segment.set_channels(1).set_frame_rate(16000)
    tmp_fixed = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
    audio_segment.export(tmp_fixed.name, format="wav")

    # Open with wave for Vosk
    wf = wave.open(tmp_fixed.name, "rb")
    rec = KaldiRecognizer(model, wf.getframerate())
    predicted_text = ""
    while True:
        data = wf.readframes(4000)
        if len(data) == 0:
            break
        if rec.AcceptWaveform(data):
            res = json.loads(rec.Result())
            predicted_text += res.get("text", "") + " "
    # Final partial
    res = json.loads(rec.FinalResult())
    predicted_text += res.get("text", "")
    predicted_text = predicted_text.strip().lower()

    # Convert to NumPy array for acoustic scoring
    y = np.array(audio_segment.get_array_of_samples(), dtype=np.float32)
    sr = 16000

    # Compute scores
    acoustic_score = compute_acoustic_score(y, sr)
    phoneme_score = compute_phoneme_score(text.lower(), predicted_text)
    final_score = (0.6 * phoneme_score) + (0.4 * acoustic_score)

    return {
        "predicted_text": predicted_text,
        "phoneme_score": round(float(phoneme_score), 2),
        "acoustic_score": round(float(acoustic_score), 2),
        "final_score": round(float(final_score), 2),
    }
