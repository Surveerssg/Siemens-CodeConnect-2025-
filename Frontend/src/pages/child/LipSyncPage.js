import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { FaceMesh as MediaPipeFaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Mic, Square, Upload, Play, Pause, Loader, AlertCircle, Video as VideoIcon } from "lucide-react";
import { ArrowLeft, TrendingUp, Calendar, Award, Trophy, Flame, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Phoneme to viseme mapping
// Phoneme to viseme mapping with realistic ranges
// Based on your actual measurements, here are realistic patterns:
const VISEME_PATTERNS = {
  // Lip Closure (M, B, P)
  'M': { openness: [0, 0.5], width: [5.5, 8.5], name: 'Lip Closure' },
  'B': { openness: [0, 0.5], width: [5.5, 8.5], name: 'Lip Closure' },
  'P': { openness: [0, 0.5], width: [5.5, 8.5], name: 'Lip Closure' },
  
  // Wide Open (A, AH)
  'A': { openness: [3, 12], width: [5, 9], name: 'Wide Open' },
  'AH': { openness: [3, 12], width: [5, 9], name: 'Wide Open' },
  
  // Rounded (O)
  'O': { openness: [1, 6], width: [4.5, 7.5], name: 'Rounded' },
  
  // Rounded Small (OO, U)
  'OO': { openness: [0.2, 2], width: [5, 8], name: 'Rounded Small' },
  'U': { openness: [0.2, 2], width: [5, 8], name: 'Rounded Small' },
  
  // Spread (E)
  'E': { openness: [0.5, 3], width: [6, 9], name: 'Spread' },
  
  // Spread Wide (EE, I)
  'EE': { openness: [0.3, 2], width: [6.5, 10], name: 'Spread Wide' },
  'I': { openness: [0.3, 2], width: [6.5, 10], name: 'Spread Wide' },
  
  // Teeth Lower Lip (F, V)
  'F': { openness: [0.2, 1.5], width: [5.5, 8.5], name: 'Teeth Lower Lip' },
  'V': { openness: [0.2, 1.5], width: [5.5, 8.5], name: 'Teeth Lower Lip' },
  
  // Neutral (T, D, N, L)
  'T': { openness: [0.2, 2], width: [5.5, 8.5], name: 'Neutral' },
  'D': { openness: [0.2, 2], width: [5.5, 8.5], name: 'Neutral' },
  'N': { openness: [0.2, 2], width: [5.5, 8.5], name: 'Neutral' },
  'L': { openness: [0.3, 3], width: [5.5, 8.5], name: 'Neutral' },
  
  // Teeth Close (S, Z)
  'S': { openness: [0.2, 1.5], width: [6, 9], name: 'Teeth Close' },
  'Z': { openness: [0.2, 1.5], width: [6, 9], name: 'Teeth Close' },
  
  // Open (H)
  'H': { openness: [0.5, 4], width: [5.5, 8.5], name: 'Open' },
  
  // Back consonants (K, G)
  'K': { openness: [0.3, 2], width: [5.5, 8.5], name: 'Neutral' },
};

const PRACTICE_WORDS = [
  { word: "HELLO", phonemes: ['H', 'E', 'L', 'O'], timing: [0, 380, 670, 900], duration: 900 },
  { word: "APPLE", phonemes: ['A', 'P', 'L'], timing: [0, 500, 900], duration: 900 },
  { word: "MOON", phonemes: ['M', 'OO', 'N'], timing: [0, 300, 900], duration: 900 },
  { word: "SMILE", phonemes: ['S', 'M', 'I', 'L'], timing: [0, 200, 400, 600], duration: 600 },
  { word: "BOOK", phonemes: ['B', 'OO', 'K'], timing: [0, 200, 500], duration: 500 },
];

const TIPS = [
  "💡 Speak clearly and at a moderate pace",
  "🎯 Make sure your face is well-lit",
  "🔊 Keep background noise to a minimum",
  "😊 Exaggerate lip movements slightly for better results",
  "📱 Hold your device steady during recording",
  "🎤 Speak directly towards the microphone"
];

const LipSyncPage = () => {
  const [activeTab, setActiveTab] = useState("practice");
  
  // Face Mesh States
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [lipData, setLipData] = useState(null);
  const [faceMeshError, setFaceMeshError] = useState(null);
  const [isLoadingFaceMesh, setIsLoadingFaceMesh] = useState(true);
  const [currentWord, setCurrentWord] = useState(PRACTICE_WORDS[0]);
  const [isRecording, setIsRecording] = useState(false);
  const [score, setScore] = useState(null);
  const [currentPhonemeIndex, setCurrentPhonemeIndex] = useState(0);
  const [customWordInput, setCustomWordInput] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
    const navigate = useNavigate();

  // Lip Sync Generation States
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [showWaitingModal, setShowWaitingModal] = useState(false);
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [generationError, setGenerationError] = useState(null);
  const [isPlayingDemo, setIsPlayingDemo] = useState(false);
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordedDataRef = useRef([]);
  const recordingStartTimeRef = useRef(null);
  const isRecordingRef = useRef(false);
  const animationFrameId = useRef(null);
  const demoVideoRef = useRef(null);

  const UPPER_LIP = useMemo(() => [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291], []);
  const LOWER_LIP = useMemo(() => [146, 91, 181, 84, 17, 314, 405, 321, 375, 291], []);
  const OUTER_LIP = useMemo(() => [61, 185, 40, 39, 37, 0, 267, 269, 270, 409, 291, 375, 321, 405, 314, 17, 84, 181, 91, 146], []);
  const INNER_LIP = useMemo(() => [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308, 415, 310, 311, 312, 13, 82, 81, 80, 191], []);

  const breakWordIntoPhonemes = useCallback((word) => {
    const upperWord = word.toUpperCase();
    const phonemes = [];
    const timing = [];
    let currentTime = 0;
    
    for (let i = 0; i < upperWord.length; i++) {
      const char = upperWord[i];
      const nextChar = upperWord[i + 1];
      
      if (nextChar && VISEME_PATTERNS[char + nextChar]) {
        phonemes.push(char + nextChar);
        timing.push(currentTime);
        currentTime += 250;
        i++;
      } else if (VISEME_PATTERNS[char]) {
        phonemes.push(char);
        timing.push(currentTime);
        currentTime += 200;
      } else if (char !== ' ') {
        const mapping = {
          'C': 'S', 'K': 'S', 'Q': 'O', 'W': 'U', 
          'X': 'S', 'Y': 'I', 'G': 'D', 'J': 'D',
          'R': 'L', 'H': 'A'
        };
        const mappedChar = mapping[char] || 'A';
        phonemes.push(mappedChar);
        timing.push(currentTime);
        currentTime += 200;
      }
    }
    
    return { word: upperWord, phonemes, timing, duration: currentTime + 200 };
  }, []);

  const handleCustomWord = useCallback(() => {
    if (customWordInput.trim()) {
      const customWordData = breakWordIntoPhonemes(customWordInput.trim());
      setCurrentWord(customWordData);
      setScore(null);
      recordedDataRef.current = [];
      setCustomWordInput("");
      setShowCustomInput(false);
    }
  }, [customWordInput, breakWordIntoPhonemes]);

  const drawLips = useCallback((ctx, landmarks, canvas) => {
    ctx.strokeStyle = isRecordingRef.current ? "#FF0000" : "#00FF00";
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    OUTER_LIP.forEach((idx, i) => {
      const point = landmarks[idx];
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.closePath();
    ctx.stroke();

    ctx.strokeStyle = "#FFFF00";
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    INNER_LIP.forEach((idx, i) => {
      const point = landmarks[idx];
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    
    ctx.closePath();
    ctx.stroke();
  }, [OUTER_LIP, INNER_LIP]);

  const extractLipMovement = useCallback((landmarks) => {
  const upperLip = landmarks[13];
  const lowerLip = landmarks[14];
  const leftCorner = landmarks[61];
  const rightCorner = landmarks[291];
  
  // Calculate raw values
  const rawOpenness = Math.abs(upperLip.y - lowerLip.y) * 100;
  const rawWidth = Math.abs(rightCorner.x - leftCorner.x) * 100;
  
  // NORMALIZATION: Scale width to match pattern expectations
  // Your width ranges from ~6-8, but patterns expect 1.5-8
  // Let's remap it
  const minExpectedWidth = 1.5;
  const maxExpectedWidth = 10;
  const minObservedWidth = 5.5;  // Your closed lips
  const maxObservedWidth = 10;   // Your wide smile
  
  const normalizedWidth = minExpectedWidth + 
    ((rawWidth - minObservedWidth) / (maxObservedWidth - minObservedWidth)) * 
    (maxExpectedWidth - minExpectedWidth);
  
  return {
    openness: rawOpenness,
    width: Math.max(minExpectedWidth, Math.min(maxExpectedWidth, normalizedWidth)),
    timestamp: Date.now()
  };
}, []);

 const calculatePhonemeScore = useCallback((recordedLipData, phoneme) => {
  if (!recordedLipData || recordedLipData.length === 0) return 0;

  // Remove the movement check here since we check globally in analyzeRecording
  // This was causing confusion with two different thresholds

  const pattern = VISEME_PATTERNS[phoneme];
  if (!pattern) return 50;
  
  let totalScore = 0;
  
  recordedLipData.forEach(data => {
    const opennessScore = data.openness >= pattern.openness[0] && 
                         data.openness <= pattern.openness[1] ? 100 : 
                         Math.max(0, 100 - Math.abs(data.openness - (pattern.openness[0] + pattern.openness[1]) / 2) * 20);
    
    const widthScore = data.width >= pattern.width[0] && 
                      data.width <= pattern.width[1] ? 100 : 
                      Math.max(0, 100 - Math.abs(data.width - (pattern.width[0] + pattern.width[1]) / 2) * 20);
    
    totalScore += (opennessScore + widthScore) / 2;
  });
  
  return recordedLipData.length > 0 ? totalScore / recordedLipData.length : 0;
}, []);

const analyzeRecording = useCallback(() => {
  const dataToAnalyze = recordedDataRef.current;
  const startTime = recordingStartTimeRef.current;

  console.log("=== ANALYSIS START ===");
  console.log("Total frames recorded:", dataToAnalyze.length);
  console.log("Recording duration:", dataToAnalyze.length > 0 ? (dataToAnalyze[dataToAnalyze.length - 1].timestamp - dataToAnalyze[0].timestamp) : 0, "ms");

  if (dataToAnalyze.length === 0) {
    setScore({ overall: 0, phonemes: [], message: "No data recorded ❌" });
    return;
  }

  // ===== CRITICAL: Check for actual speech FIRST =====
  const allOpennessValues = dataToAnalyze.map(d => d.openness || 0);
  const allWidthValues = dataToAnalyze.map(d => d.width || 0);
  
  const opennessRange = Math.max(...allOpennessValues) - Math.min(...allOpennessValues);
  const widthRange = Math.max(...allWidthValues) - Math.min(...allWidthValues);
  
  console.log("Openness - Min:", Math.min(...allOpennessValues).toFixed(2), 
              "Max:", Math.max(...allOpennessValues).toFixed(2),
              "Range:", opennessRange.toFixed(2));
  console.log("Width - Min:", Math.min(...allWidthValues).toFixed(2), 
              "Max:", Math.max(...allWidthValues).toFixed(2),
              "Range:", widthRange.toFixed(2));

  // ===== MOVEMENT THRESHOLD CHECK =====
  const OPENNESS_MOVEMENT_THRESHOLD = 1.5;  // Must move at least 1.5 units vertically
  const WIDTH_MOVEMENT_THRESHOLD = 2.5;     // OR at least 2.5 units horizontally
  
  if (opennessRange < OPENNESS_MOVEMENT_THRESHOLD && widthRange < WIDTH_MOVEMENT_THRESHOLD) {
    console.log("❌ NO SPEECH DETECTED - Movement too small");
    console.log(`   Openness range ${opennessRange.toFixed(2)} < ${OPENNESS_MOVEMENT_THRESHOLD}`);
    console.log(`   Width range ${widthRange.toFixed(2)} < ${WIDTH_MOVEMENT_THRESHOLD}`);
    
    setScore({ 
      overall: 0, 
      phonemes: [], 
      message: "No lip movement detected! Please speak clearly. 🔇" 
    });
    return;
  }

  // If we reach here, speech was detected - continue with phoneme analysis
  console.log("✅ Speech detected - analyzing phonemes...");

  const phonemeScores = [];
  const phonemes = currentWord.phonemes;
  const timing = currentWord.timing;
  
  phonemes.forEach((phoneme, idx) => {
    const phonemeStartTime = timing[idx];
    const phonemeEndTime = timing[idx + 1] || currentWord.duration;
    
    console.log(`\n--- Phoneme ${idx}: "${phoneme}" ---`);
    console.log(`Expected timing: ${phonemeStartTime}ms - ${phonemeEndTime}ms`);
    console.log(`Expected pattern:`, VISEME_PATTERNS[phoneme]);
    
    const phonemeData = dataToAnalyze.filter(d => {
      const relativeTime = d.timestamp - startTime;
      return relativeTime >= phonemeStartTime && relativeTime < phonemeEndTime;
    });
    
    console.log(`Frames captured for this phoneme: ${phonemeData.length}`);
    
    if (phonemeData.length > 0) {
      const phonemeOpenness = phonemeData.map(d => d.openness);
      const phonemeWidth = phonemeData.map(d => d.width);
      console.log(`Actual openness range: ${Math.min(...phonemeOpenness).toFixed(2)} - ${Math.max(...phonemeOpenness).toFixed(2)}`);
      console.log(`Actual width range: ${Math.min(...phonemeWidth).toFixed(2)} - ${Math.max(...phonemeWidth).toFixed(2)}`);
    }
    
    const score = calculatePhonemeScore(phonemeData, phoneme);
    console.log(`Score for ${phoneme}: ${score.toFixed(2)}`);
    
    phonemeScores.push({
      phoneme,
      score: Math.round(score),
      pattern: VISEME_PATTERNS[phoneme]?.name || 'Unknown'
    });
  });
  
  const overallScore = phonemeScores.reduce((sum, p) => sum + p.score, 0) / phonemeScores.length;
  
  console.log("\n=== FINAL RESULTS ===");
  console.log("Overall Score:", overallScore.toFixed(2));
  console.log("=== ANALYSIS END ===\n");
  
  let message = "";
  if (overallScore >= 85) message = "Excellent! 🌟";
  else if (overallScore >= 70) message = "Good job! 👍";
  else if (overallScore >= 50) message = "Keep practicing! 💪";
  else message = "Try again! 📚";
  
  setScore({
    overall: Math.round(overallScore),
    phonemes: phonemeScores,
    message
  });
}, [currentWord, calculatePhonemeScore]);

  const startRecording = useCallback(() => {
    recordedDataRef.current = [];
    recordingStartTimeRef.current = Date.now();
    isRecordingRef.current = true;
    setIsRecording(true);
    setScore(null);
    setCurrentPhonemeIndex(0);
    
    setTimeout(() => {
      if (isRecordingRef.current) {
        stopRecording();
      }
    }, currentWord.duration + 200);
  }, [currentWord.duration]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    setIsRecording(false);
    analyzeRecording();
  }, [analyzeRecording]);

  // Audio Recording Functions
  const pickSupportedAudioMime = () => {
    const candidates = [
      'audio/ogg;codecs=opus',
      'audio/ogg',
      'audio/mp4;codecs=mp4a.40.2',
      'audio/mp4',
      'audio/webm;codecs=opus',
      'audio/webm'
    ];
    for (const type of candidates) {
      if (window.MediaRecorder && MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    return '';
  };

  // Convert an arbitrary audio Blob to WAV using Web Audio API
  const convertToWav = async (inputBlob) => {
    const arrayBuffer = await inputBlob.arrayBuffer();
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);

    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const length = audioBuffer.length;

    // Interleave channels
    const interleaved = new Float32Array(length * numChannels);
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        interleaved[i * numChannels + channel] = channelData[i];
      }
    }

    // PCM16 encoding
    const bytesPerSample = 2;
    const blockAlign = numChannels * bytesPerSample;
    const byteRate = sampleRate * blockAlign;
    const dataSize = interleaved.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    // RIFF header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true);
    writeString(view, 8, 'WAVE');

    // fmt chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true);  // AudioFormat (1 = PCM)
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, byteRate, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, 16, true); // BitsPerSample

    // data chunk
    writeString(view, 36, 'data');
    view.setUint32(40, dataSize, true);

    // Write PCM samples
    let offset = 44;
    for (let i = 0; i < interleaved.length; i++) {
      const s = Math.max(-1, Math.min(1, interleaved[i]));
      view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
      offset += 2;
    }

    return new Blob([view], { type: 'audio/wav' });

    function writeString(dataview, offsetPos, string) {
      for (let i = 0; i < string.length; i++) {
        dataview.setUint8(offsetPos + i, string.charCodeAt(i));
      }
    }
  };

  const startAudioRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const preferredType = pickSupportedAudioMime();
      const mediaRecorder = preferredType ? new MediaRecorder(stream, { mimeType: preferredType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Keep the original recorded type; we'll convert to WAV at upload time if needed
        const recordedType = mediaRecorder.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: recordedType });
        setAudioBlob(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecordingAudio(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      setGenerationError("Could not access microphone");
    }
  };

  const stopAudioRecording = () => {
    if (mediaRecorderRef.current && isRecordingAudio) {
      mediaRecorderRef.current.stop();
      setIsRecordingAudio(false);
    }
  };

  const generateLipSync = async () => {
    if (!audioBlob) {
      setGenerationError("Please record audio first");
      return;
    }

    setIsGenerating(true);
    setShowWaitingModal(true);
    setGenerationError(null);
    setCurrentTipIndex(0);

    const formData = new FormData();
    // Ensure server-supported format. Convert to WAV client-side if needed.
    let uploadBlob = audioBlob;
    const supportedServerTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/ogg', 'audio/m4a', 'audio/aac', 'audio/wma', 'audio/flac', 'audio/mp4'];
    const typeLower = (audioBlob.type || '').toLowerCase();
    const isSupported = supportedServerTypes.some(t => typeLower.includes(t.split('/')[1]) || typeLower === t);
    if (!isSupported) {
      try {
        uploadBlob = await convertToWav(audioBlob);
      } catch (e) {
        console.error('Failed to convert audio to WAV:', e);
      }
    }

    const finalType = uploadBlob.type || 'audio/wav';
    const finalExt = finalType.includes('wav') ? 'wav' : finalType.includes('mp3') || finalType.includes('mpeg') ? 'mp3' : finalType.includes('ogg') ? 'ogg' : finalType.includes('m4a') ? 'm4a' : finalType.includes('aac') ? 'aac' : finalType.includes('wma') ? 'wma' : finalType.includes('flac') ? 'flac' : finalType.includes('mp4') ? 'mp4' : 'wav';
    const audioFile = new File([uploadBlob], `recording.${finalExt}`, { type: finalType });
    formData.append('audio', audioFile);

    try {
      const response = await fetch('https://lipsync-lnjz.onrender.com/generate-lipsync/?video_choice=video1', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        // Try to surface error details from FastAPI (e.g., 422 validation errors)
        let message = 'Generation failed';
        try {
          const err = await response.json();
          if (err?.detail) {
            message = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
          }
        } catch (_) {}
        throw new Error(message);
      }

      const data = await response.json();
      setGeneratedVideoUrl(data.video_url);
      setShowWaitingModal(false);
    } catch (error) {
      console.error("Error generating lip sync:", error);
      setGenerationError(error?.message || "Failed to generate video. Please try again.");
      setShowWaitingModal(false);
    } finally {
      setIsGenerating(false);
    }
  };

  // Rotate tips during generation
  useEffect(() => {
    if (showWaitingModal) {
      const interval = setInterval(() => {
        setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [showWaitingModal]);

  useEffect(() => {
    const updatePhonemeHighlight = () => {
      if (!isRecordingRef.current) return;

      const elapsed = Date.now() - recordingStartTimeRef.current;
      const { timing, phonemes } = currentWord;
      
      const newIndex = timing.findIndex((t, i) => 
        elapsed >= t && (i === timing.length - 1 || elapsed < timing[i + 1])
      );

      if (newIndex !== -1) {
        setCurrentPhonemeIndex(prevIndex => newIndex !== prevIndex ? newIndex : prevIndex);
      }

      animationFrameId.current = requestAnimationFrame(updatePhonemeHighlight);
    };

    if (isRecording) {
      animationFrameId.current = requestAnimationFrame(updatePhonemeHighlight);
    } else {
      cancelAnimationFrame(animationFrameId.current);
    }

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [isRecording, currentWord]);

  useEffect(() => {
    if (activeTab !== "practice") return;

    const initializeFaceMesh = async () => {
      try {
        setIsLoadingFaceMesh(true);
        setFaceMeshError(null);

        const videoElement = videoRef.current;
        const canvasElement = canvasRef.current;
        
        if (!videoElement || !canvasElement) throw new Error("Video or canvas element not found");
        const canvasCtx = canvasElement.getContext("2d");
        if (!canvasCtx) throw new Error("Could not get canvas context");

        const faceMeshModel = new MediaPipeFaceMesh({
          locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMeshModel.setOptions({
          maxNumFaces: 1,
          refineLandmarks: true,
          minDetectionConfidence: 0.7,
          minTrackingConfidence: 0.7,
        });

        faceMeshModel.onResults((results) => {
          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
          
          if (results.image) {
            canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);
          }

          if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
            const landmarks = results.multiFaceLandmarks[0];
            drawLips(canvasCtx, landmarks, canvasElement);
            const lipMovement = extractLipMovement(landmarks);
            setLipData(lipMovement);

            if (isRecordingRef.current) {
              recordedDataRef.current.push(lipMovement);
            }
          }
          canvasCtx.restore();
        });

        const camera = new Camera(videoElement, {
          onFrame: async () => {
            try {
              await faceMeshModel.send({ image: videoElement });
            } catch (err) {
              console.error("Error processing frame:", err);
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        setIsLoadingFaceMesh(false);

        return () => camera.stop();
      } catch (err) {
        console.error("Error initializing face mesh:", err);
        setFaceMeshError(err.message);
        setIsLoadingFaceMesh(false);
      }
    };

    initializeFaceMesh();
  }, [activeTab, drawLips, extractLipMovement]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
                  >
                    <ArrowLeft size={20} />
                    <span>Back to Dashboard</span>
                  </button>
        <h1 className="text-4xl font-bold text-white text-center mb-2">🎯 LipSync Studio</h1>
        <p className="text-gray-300 text-center mb-8">Practice pronunciation & generate AI lip-synced videos</p>
        
        {/* Tab Switcher */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={() => setActiveTab("practice")}
            className={`px-8 py-3 rounded-lg font-bold transition-all ${
              activeTab === "practice"
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            📚 Pronunciation Practice
          </button>
          <button
            onClick={() => setActiveTab("generate")}
            className={`px-8 py-3 rounded-lg font-bold transition-all ${
              activeTab === "generate"
                ? 'bg-purple-600 text-white shadow-lg scale-105'
                : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
            }`}
          >
            🎬 Generate Lip-Sync Video
          </button>
        </div>

        {/* Pronunciation Practice Tab */}
        {activeTab === "practice" && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex flex-col items-center">
              <div className="relative w-[640px] h-[480px]">
                <video
                  ref={videoRef}
                  className="w-full h-full rounded-lg object-cover"
                  width="640"
                  height="480"
                  playsInline
                  muted
                  autoPlay
                />
                <canvas 
                  ref={canvasRef} 
                  width="640" 
                  height="480"
                  className="absolute inset-0 w-full h-full border-4 border-purple-500 rounded-lg shadow-2xl pointer-events-none"
                />
              </div>
              {isRecording && (
                <div className="mt-4 bg-red-600 text-white px-6 py-2 rounded-full font-bold animate-pulse">
                  🔴 RECORDING
                </div>
              )}
              {faceMeshError && (
                <div className="mt-4 bg-red-600 text-white p-4 rounded-lg max-w-md">
                  <p className="font-bold">Error: {faceMeshError}</p>
                </div>
              )}
              {isLoadingFaceMesh && !faceMeshError && (
                <div className="mt-4 bg-blue-600 text-white p-4 rounded-lg">
                  <p>Initializing camera...</p>
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col gap-4">
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
                <h2 className="text-xl font-bold text-white mb-4">Select Word</h2>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {PRACTICE_WORDS.map((w, idx) => (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentWord(w);
                        setScore(null);
                        recordedDataRef.current = [];
                      }}
                      className={`px-4 py-3 rounded-lg font-bold transition-all ${
                        currentWord.word === w.word
                          ? 'bg-purple-600 text-white shadow-lg scale-105'
                          : 'bg-white bg-opacity-20 text-white hover:bg-opacity-30'
                      }`}
                    >
                      {w.word}
                    </button>
                  ))}
                </div>
                
                {showCustomInput ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={customWordInput}
                      onChange={(e) => setCustomWordInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomWord()}
                      placeholder="Enter any word..."
                      className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-20 text-white placeholder-gray-400 border-2 border-white border-opacity-30 focus:border-opacity-60 outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleCustomWord}
                        disabled={!customWordInput.trim()}
                        className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all"
                      >
                        ✓ Use This Word
                      </button>
                      <button
                        onClick={() => {
                          setShowCustomInput(false);
                          setCustomWordInput("");
                        }}
                        className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowCustomInput(true)}
                    className="w-full px-4 py-3 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white rounded-lg font-bold transition-all"
                  >
                    ➕ Add Custom Word
                  </button>
                )}
              </div>

              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-8 rounded-lg text-center">
                <p className="text-gray-300 text-sm mb-2">Pronounce this word:</p>
                <h2 className="text-5xl font-bold text-white mb-4">{currentWord.word}</h2>
                <div className="flex justify-center gap-2 mb-4 flex-wrap">
                  {currentWord.phonemes.map((p, idx) => (
                    <span
                      key={idx}
                      className={`px-3 py-1 rounded text-lg font-mono ${
                        isRecording && idx === currentPhonemeIndex
                          ? 'bg-yellow-400 text-black'
                        : 'bg-white bg-opacity-20 text-white'
                      }`}
                    >
                      {p}
                    </span>
                  ))}
                </div>
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={!lipData || isLoadingFaceMesh}
                  className={`w-full px-8 py-4 rounded-lg font-bold text-lg transition-all ${
                    isRecording
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white disabled:bg-gray-600 disabled:cursor-not-allowed`}
                >
                  {isRecording ? '⏹️ Stop' : '▶️ Start Recording'}
                </button>
              </div>

              {score && (
                <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
                  <h2 className="text-2xl font-bold text-white mb-4">Score: {score.overall}%</h2>
                  <p className="text-3xl mb-4">{score.message}</p>
                  
                  <div className="space-y-2">
                    {score.phonemes.map((p, idx) => (
                      <div key={idx} className="bg-white bg-opacity-10 p-3 rounded">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-white font-bold">{p.phoneme}</span>
                          <span className="text-gray-300 text-sm">{p.pattern}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                p.score >= 80 ? 'bg-green-500' :
                                p.score >= 60 ? 'bg-yellow-500' :
                                'bg-red-500'
                              }`}
                              style={{ width: `${p.score}%` }}
                            />
                          </div>
                          <span className="text-white font-mono">{p.score}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {lipData && !isRecording && (
                <div className="bg-white bg-opacity-10 backdrop-blur-lg p-4 rounded-lg">
                  <p className="text-sm text-gray-300 mb-2">Current Lip Position:</p>
                  <div className="grid grid-cols-2 gap-2 text-white text-sm">
                    <div>Openness: <span className="font-mono">{lipData.openness.toFixed(1)}</span></div>
                    <div>Width: <span className="font-mono">{lipData.width.toFixed(1)}</span></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Generate Lip-Sync Tab */}
        {activeTab === "generate" && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Demo Video Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <VideoIcon className="w-6 h-6" />
                Demo Video
              </h2>
              <p className="text-gray-300 mb-4">See what our AI can do with lip-sync technology</p>
              <video
                ref={demoVideoRef}
                className="w-full rounded-lg shadow-xl"
                controls
                onPlay={() => setIsPlayingDemo(true)}
                onPause={() => setIsPlayingDemo(false)}
                onEnded={() => setIsPlayingDemo(false)}
              >
                <source src="https://private-sync-user-generations-v2.s3.amazonaws.com/generations/f78bda99-c01c-4c20-bbbf-0c147cdb319b/2da8b5e7-8e45-4ca7-afa1-cb6175a526f1_stitcher/result.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Audio Recording Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Mic className="w-6 h-6" />
                Record Your Audio
              </h2>
              <p className="text-gray-300 mb-4">Record audio to generate a lip-synced video</p>
              
              <div className="flex flex-col items-center gap-4">
                {!audioBlob ? (
                  <button
                    onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                    className={`w-full max-w-md px-8 py-4 rounded-lg font-bold text-lg transition-all flex items-center justify-center gap-3 ${
                      isRecordingAudio
                        ? 'bg-red-600 hover:bg-red-700 animate-pulse'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {isRecordingAudio ? (
                      <>
                        <Square className="w-6 h-6" />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic className="w-6 h-6" />
                        Start Recording Audio
                      </>
                    )}
                  </button>
                ) : (
                  <div className="w-full max-w-md space-y-3">
                    <div className="bg-green-600 text-white p-4 rounded-lg text-center">
                      ✓ Audio recorded successfully!
                    </div>
                    <audio controls className="w-full">
                      <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                    </audio>
                    <div className="flex gap-2">
                      <button
                        onClick={generateLipSync}
                        disabled={isGenerating}
                        className="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all flex items-center justify-center gap-2"
                      >
                        {isGenerating ? (
                          <>
                            <Loader className="w-5 h-5 animate-spin" />
                            Generating...
                          </>
                        ) : (
                          <>
                            <Upload className="w-5 h-5" />
                            Generate Video
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => setAudioBlob(null)}
                        disabled={isGenerating}
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-bold transition-all"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                
                {isRecordingAudio && (
                  <div className="text-red-400 text-sm flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    Recording in progress...
                  </div>
                )}
              </div>

              {generationError && (
                <div className="mt-4 bg-red-600 text-white p-4 rounded-lg flex items-center gap-3">
                  <AlertCircle className="w-5 h-5" />
                  <p>{generationError}</p>
                </div>
              )}
            </div>

            {/* Generated Video Section */}
            {generatedVideoUrl && (
              <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <VideoIcon className="w-6 h-6" />
                  Your Generated Video
                </h2>
                <video
                  className="w-full rounded-lg shadow-xl mb-4"
                  controls
                  autoPlay
                >
                  <source src={generatedVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="flex gap-3">
                  <a
                    href={generatedVideoUrl}
                    download="lipsync-video.mp4"
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold text-center transition-all"
                  >
                    Download Video
                  </a>
                  <button
                    onClick={() => {
                      setGeneratedVideoUrl(null);
                      setAudioBlob(null);
                    }}
                    className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold transition-all"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-white bg-opacity-10 backdrop-blur-lg p-6 rounded-lg">
              <h3 className="text-xl font-bold text-white mb-4">💡 Tips for Best Results</h3>
              <ul className="space-y-2 text-gray-300">
                {TIPS.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-purple-400 mt-1">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Waiting Modal */}
        {showWaitingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-800 to-blue-800 rounded-2xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-6">
                <Loader className="w-16 h-16 text-white animate-spin" />
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Generating Your Video...
                  </h2>
                  <p className="text-gray-300">
                    Please wait 2-3 minutes while we process your audio
                  </p>
                </div>

                <div className="w-full bg-white bg-opacity-20 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="text-2xl">💡</div>
                    <div className="text-left">
                      <p className="text-white font-semibold mb-1">Pro Tip:</p>
                      <p className="text-gray-200 text-sm transition-opacity duration-500">
                        {TIPS[currentTipIndex]}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-gray-300 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  <span>Processing</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LipSyncPage;