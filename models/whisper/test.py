import os
import requests

# 1️⃣ Load your AssemblyAI API key from environment
AAI_TOKEN = os.getenv("AAI_TOKEN")
if not AAI_TOKEN:
    raise ValueError("Please set your AAI_TOKEN environment variable.")

headers = {"authorization": AAI_TOKEN}

# 2️⃣ Path to your local audio file
audio_file_path = "fruits.wav"  # replace with your file

# 3️⃣ Upload the audio file
with open(audio_file_path, "rb") as f:
    upload_resp = requests.post(
        "https://api.assemblyai.com/v2/upload",
        headers=headers,
        data=f
    )

if upload_resp.status_code != 200:
    raise Exception(f"Audio upload failed: {upload_resp.status_code}, {upload_resp.text}")

upload_url = upload_resp.json()["upload_url"]
print(f"Audio uploaded successfully: {upload_url}")

# 4️⃣ Request transcription
transcript_resp = requests.post(
    "https://api.assemblyai.com/v2/transcript",
    headers=headers,
    json={"audio_url": upload_url}
)

if transcript_resp.status_code != 200:
    raise Exception(f"Transcription request failed: {transcript_resp.status_code}, {transcript_resp.text}")

transcript_id = transcript_resp.json()["id"]
print(f"Transcript requested successfully. ID: {transcript_id}")

# 5️⃣ Poll for completion
import time
while True:
    check_resp = requests.get(f"https://api.assemblyai.com/v2/transcript/{transcript_id}", headers=headers)
    data = check_resp.json()
    if data["status"] == "completed":
        print("Transcription completed!")
        print("Text:", data["text"])
        break
    elif data["status"] == "failed":
        print("Transcription failed:", data)
        break
    else:
        print("Transcription in progress...")
        time.sleep(3)
