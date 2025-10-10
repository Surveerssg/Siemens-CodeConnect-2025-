const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Speech SDK (optional dependency). If not installed the route will return an error
let SpeechSDK;
try {
  SpeechSDK = require('microsoft-cognitiveservices-speech-sdk');
} catch (e) {
  SpeechSDK = null;
}

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '..', 'tmp') });

// POST /api/speech/assess
// Accepts multipart/form-data { audio: file, word: string }
router.post('/assess', upload.single('audio'), async (req, res) => {
  if (!SpeechSDK) {
    return res.status(500).json({ success: false, error: 'Speech SDK not installed on server. Please install microsoft-cognitiveservices-speech-sdk.' });
  }

  const audioFile = req.file;
  const word = req.body.word || '';

  if (!audioFile) return res.status(400).json({ success: false, error: 'Audio file is required' });
  if (!word) return res.status(400).json({ success: false, error: 'Reference word is required' });

  const AZURE_KEY = process.env.AZURE_SPEECH_KEY;
  const AZURE_REGION = process.env.AZURE_SPEECH_REGION;

  if (!AZURE_KEY || !AZURE_REGION) {
    // cleanup
    try { fs.unlinkSync(audioFile.path); } catch (e) {}
    return res.status(500).json({ success: false, error: 'Azure Speech credentials not configured (AZURE_SPEECH_KEY/AZURE_SPEECH_REGION)' });
  }

  try {
    // Read file into PushAudioInputStream
    const audioBuffer = fs.readFileSync(audioFile.path);

    const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(AZURE_KEY, AZURE_REGION);
    speechConfig.speechRecognitionLanguage = 'en-US';

    // Configure Pronunciation Assessment
    const paConfig = new SpeechSDK.PronunciationAssessmentConfig(word, SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark, SpeechSDK.PronunciationAssessmentGranularity.Word);
    paConfig.taggedAudio = false;

    // Create audio config from raw audio stream - assume WAV/PCM or webm may fail; better to accept WAV 16k PCM from client
    const pushStream = SpeechSDK.AudioInputStream.createPushStream();
    pushStream.write(audioBuffer.buffer);
    pushStream.close();

    const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(pushStream);
    const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

    // Attach PA to recognizer
    paConfig.applyTo(recognizer);

    recognizer.recognizeOnceAsync(result => {
      try {
        // Pronunciation assessment result is available in result.properties
        const paResultJson = result.properties.getProperty(SpeechSDK.PropertyId.SpeechServiceResponse_JsonResult) || null;
        let score = null;
        if (paResultJson) {
          const parsed = JSON.parse(paResultJson);
          // Attempt to extract overall score
          if (parsed && parsed.NBest && parsed.NBest[0] && parsed.NBest[0].PronunciationAssessment) {
            score = parsed.NBest[0].PronunciationAssessment.PronunciationScore;
          } else if (parsed && parsed.PronunciationAssessment) {
            score = parsed.PronunciationAssessment.PronunciationScore;
          }
        }

        // cleanup file
        try { fs.unlinkSync(audioFile.path); } catch (e) {}

        if (score === null) {
          return res.status(200).json({ success: true, result: { score: 0 }, raw: paResultJson });
        }
        return res.json({ success: true, score });
      } catch (err) {
        try { fs.unlinkSync(audioFile.path); } catch (e) {}
        console.error('Error processing recognition result:', err);
        return res.status(500).json({ success: false, error: 'Failed to parse pronunciation result' });
      } finally {
        try { recognizer.close(); } catch (e) {}
      }
    }, err => {
      try { fs.unlinkSync(audioFile.path); } catch (e) {}
      console.error('Recognition error:', err);
      return res.status(500).json({ success: false, error: 'Recognition failed', details: err && err.message ? err.message : String(err) });
    });
  } catch (error) {
    try { fs.unlinkSync(audioFile.path); } catch (e) {}
    console.error('Speech assess internal error:', error);
    return res.status(500).json({ success: false, error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
