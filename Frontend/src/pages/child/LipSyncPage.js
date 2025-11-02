import React, { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { FaceMesh as MediaPipeFaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { Mic, Square, Upload, Play, Pause, Loader, AlertCircle, Video as VideoIcon, ArrowLeft, Sparkles, Trophy, Flame } from "lucide-react";
import { useNavigate } from 'react-router-dom';

// Phoneme to viseme mapping
const VISEME_PATTERNS = {
  'M': { openness: [0, 0.5], width: [3, 5], name: 'Lip Closure' },
  'B': { openness: [0, 0.5], width: [3, 5], name: 'Lip Closure' },
  'P': { openness: [0, 0.5], width: [3, 5], name: 'Lip Closure' },
  'A': { openness: [4, 8], width: [4, 7], name: 'Wide Open' },
  'AH': { openness: [4, 8], width: [4, 7], name: 'Wide Open' },
  'O': { openness: [2, 5], width: [2, 4], name: 'Rounded' },
  'OO': { openness: [1, 3], width: [2, 3.5], name: 'Rounded Small' },
  'U': { openness: [1, 3], width: [2, 3.5], name: 'Rounded Small' },
  'E': { openness: [1.5, 3.5], width: [5, 7], name: 'Spread' },
  'EE': { openness: [1, 2.5], width: [5, 7], name: 'Spread Wide' },
  'I': { openness: [1, 2.5], width: [5, 7], name: 'Spread Wide' },
  'F': { openness: [0.5, 1.5], width: [4, 6], name: 'Teeth Lower Lip' },
  'V': { openness: [0.5, 1.5], width: [4, 6], name: 'Teeth Lower Lip' },
  'T': { openness: [0.5, 2], width: [4, 6], name: 'Neutral' },
  'D': { openness: [0.5, 2], width: [4, 6], name: 'Neutral' },
  'N': { openness: [0.5, 2], width: [4, 6], name: 'Neutral' },
  'L': { openness: [1, 3], width: [4, 6], name: 'Neutral' },
  'S': { openness: [0.5, 1.5], width: [4, 6], name: 'Teeth Close' },
  'Z': { openness: [0.5, 1.5], width: [4, 6], name: 'Teeth Close' },
};

const PRACTICE_WORDS = [
  { word: "HELLO", phonemes: ['H', 'E', 'L', 'O'], timing: [0, 200, 400, 600], duration: 800 },
  { word: "APPLE", phonemes: ['A', 'P', 'L'], timing: [0, 300, 500], duration: 700 },
  { word: "MOON", phonemes: ['M', 'OO', 'N'], timing: [0, 200, 500], duration: 700 },
  { word: "SMILE", phonemes: ['S', 'M', 'I', 'L'], timing: [0, 200, 400, 600], duration: 800 },
  { word: "BOOK", phonemes: ['B', 'OO', 'K'], timing: [0, 200, 500], duration: 700 },
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
    
    return {
      openness: Math.abs(upperLip.y - lowerLip.y) * 100,
      width: Math.abs(rightCorner.x - leftCorner.x) * 100,
      timestamp: Date.now()
    };
  }, []);

  const calculatePhonemeScore = useCallback((recordedLipData, phoneme) => {
    if (!recordedLipData || recordedLipData.length === 0) return 0;
    
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

    if (dataToAnalyze.length === 0) {
      setScore({ overall: 0, phonemes: [], message: "No data recorded" });
      return;
    }

    const phonemeScores = [];
    const phonemes = currentWord.phonemes;
    const timing = currentWord.timing;
    
    phonemes.forEach((phoneme, idx) => {
      const phonemeStartTime = timing[idx];
      const phonemeEndTime = timing[idx + 1] || currentWord.duration;
      
      const phonemeData = dataToAnalyze.filter(d => {
        const relativeTime = d.timestamp - startTime;
        return relativeTime >= phonemeStartTime && relativeTime < phonemeEndTime;
      });
      
      const score = calculatePhonemeScore(phonemeData, phoneme);
      phonemeScores.push({
        phoneme,
        score: Math.round(score),
        pattern: VISEME_PATTERNS[phoneme]?.name || 'Unknown'
      });
    });
    
    const overallScore = phonemeScores.reduce((sum, p) => sum + p.score, 0) / phonemeScores.length;
    
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif] transition-colors duration-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold flex items-center gap-3">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">LipSync Studio</span>
              <span className="text-4xl sm:text-5xl transform-gpu motion-safe:animate-bounce">🎯</span>
            </h1>
            <p className="text-lg sm:text-xl text-blue-600 font-medium">
              Practice pronunciation & generate AI lip-synced videos
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200 ring-1 ring-white/30 backdrop-blur-sm"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-4 sm:mb-6 flex items-center gap-3">
            Choose Your Activity
            <Sparkles className="text-yellow-500 w-7 h-7 sm:w-8 sm:h-8" />
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div
              onClick={() => setActiveTab("practice")}
              className={`group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-transform duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-blue-200 border border-gray-100 ${
                activeTab === "practice" ? 'ring-2 ring-blue-400 scale-105' : ''
              }`}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-tr from-blue-100 to-sky-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <Mic className="text-blue-600 w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center">
                Pronunciation Practice
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center line-clamp-2">
                Practice speaking with real-time feedback
              </p>
              <button className={`w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold text-xs sm:text-sm hover:scale-105 transition-transform duration-200`}>
                <Play size={14} className="sm:w-4 sm:h-4" />
                {activeTab === "practice" ? "Active" : "Start"}
              </button>
            </div>

            <div
              onClick={() => setActiveTab("generate")}
              className={`group bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-md hover:shadow-xl transition-transform duration-300 cursor-pointer hover:-translate-y-2 hover:shadow-pink-200 border border-gray-100 ${
                activeTab === "generate" ? 'ring-2 ring-pink-400 scale-105' : ''
              }`}
            >
              <div className={`w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 bg-gradient-to-tr from-pink-100 to-rose-50 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                <VideoIcon className="text-pink-600 w-7 h-7 sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-sm sm:text-base lg:text-lg font-bold text-gray-800 mb-1 sm:mb-2 text-center">
                Generate Lip-Sync
              </h3>
              <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 text-center line-clamp-2">
                Create AI-powered lip-synced videos
              </p>
              <button className={`w-full flex items-center justify-center gap-2 py-2 sm:py-2.5 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl font-semibold text-xs sm:text-sm hover:scale-105 transition-transform duration-200`}>
                <Play size={14} className="sm:w-4 sm:h-4" />
                {activeTab === "generate" ? "Active" : "Start"}
              </button>
            </div>
          </div>
        </div>

        {/* Pronunciation Practice Tab */}
        {activeTab === "practice" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Camera Section */}
              <div className="relative bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 overflow-hidden">
                <div className="absolute -top-6 left-4 w-36 h-36 bg-gradient-to-tr from-indigo-50 to-blue-50 rounded-full opacity-40 blur-3xl pointer-events-none"></div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <VideoIcon className="w-6 h-6" />
                  Camera View
                </h3>
                <div className="relative w-full aspect-video max-w-2xl mx-auto">
                  <video
                    ref={videoRef}
                    className="w-full h-full rounded-lg object-cover"
                    playsInline
                    muted
                    autoPlay
                  />
                  <canvas 
                    ref={canvasRef} 
                    className="absolute inset-0 w-full h-full rounded-lg shadow-2xl pointer-events-none border-2 border-transparent"
                  />
                </div>
                {isRecording && (
                  <div className="mt-4 inline-flex items-center gap-3 bg-gradient-to-r from-red-500 to-rose-600 text-white px-5 py-2 rounded-full font-bold animate-pulse">
                    <div className="w-3 h-3 rounded-full bg-white/80 animate-pulse shadow-sm" />
                    <span>RECORDING</span>
                  </div>
                )}
                {faceMeshError && (
                  <div className="mt-4 bg-red-600 text-white p-4 rounded-lg">
                    <p className="font-bold">Error: {faceMeshError}</p>
                  </div>
                )}
                {isLoadingFaceMesh && !faceMeshError && (
                  <div className="mt-4 bg-blue-600 text-white p-4 rounded-lg text-center">
                    <p>Initializing camera...</p>
                  </div>
                )}
              </div>

              {/* Word Selection & Controls */}
              <div className="space-y-6">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Trophy className="w-6 h-6" />
                    Select Word
                  </h3>
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    {PRACTICE_WORDS.map((w, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setCurrentWord(w);
                          setScore(null);
                          recordedDataRef.current = [];
                        }}
                        className={`px-4 py-3 rounded-xl font-bold transition-transform duration-200 transform-gpu flex items-center justify-center ${
                          currentWord.word === w.word
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg scale-105'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                        className="w-full px-4 py-3 rounded-xl bg-gray-50 text-gray-800 placeholder-gray-400 border-2 border-gray-200 focus:border-blue-400 outline-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={handleCustomWord}
                          disabled={!customWordInput.trim()}
                          className="flex-1 px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-all"
                        >
                          ✓ Use This Word
                        </button>
                        <button
                          onClick={() => {
                            setShowCustomInput(false);
                            setCustomWordInput("");
                          }}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white rounded-xl font-bold transition-all"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowCustomInput(true)}
                      className="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-bold transition-all"
                    >
                      ➕ Add Custom Word
                    </button>
                  )}
                </div>

                {/* Current Word & Recording */}
                <div className="bg-gradient-to-br from-indigo-600 to-sky-600 rounded-2xl sm:rounded-3xl p-6 shadow-2xl hover:shadow-2xl transition-all duration-300 text-white">
                  <p className="text-indigo-100 text-sm mb-2">Pronounce this word:</p>
                  <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-center bg-clip-text text-transparent bg-gradient-to-r from-white/90 to-white/60">{currentWord.word}</h2>
                  <div className="flex justify-center gap-2 mb-4 flex-wrap">
                    {currentWord.phonemes.map((p, idx) => (
                      <span
                        key={idx}
                        className={`px-3 py-1 rounded text-lg font-mono transform-gpu transition-all ${
                          isRecording && idx === currentPhonemeIndex
                            ? 'scale-110 bg-yellow-400 text-black shadow-lg'
                          : 'bg-white bg-opacity-10 text-white'
                        }`}
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={!lipData || isLoadingFaceMesh}
                    className={`w-full px-8 py-4 rounded-xl font-bold text-lg transition-transform duration-300 transform-gpu ${
                      isRecording
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700'
                        : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700'
                    } text-white disabled:bg-gray-400 disabled:cursor-not-allowed shadow-2xl`}
                  >
                    {isRecording ? '⏹️ Stop Recording' : '▶️ Start Recording'}
                    {isRecording && <span className="ml-3 inline-block w-3 h-3 rounded-full bg-white/80 animate-pulse" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Score Display */}
            {score && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Flame className="w-6 h-6" />
                    Your Score: {score.overall}%
                  </h3>
                  <div className="text-lg font-semibold text-gray-700">{score.message}</div>
                </div>
                
                <div className="grid grid-cols-1 gap-3">
                  {score.phonemes.map((p, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-gray-800 font-bold text-lg">{p.phoneme}</span>
                        <span className="text-gray-600 text-sm">{p.pattern}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.score >= 80 ? 'bg-green-500' :
                              p.score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            } transition-all duration-700`}
                            style={{ width: `${p.score}%` }}
                          />
                        </div>
                        <span className="text-gray-800 font-mono font-bold w-12">{p.score}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lip Data Display */}
            {lipData && !isRecording && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg transition-all duration-300 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Current Lip Position</h3>
                <div className="grid grid-cols-2 gap-4 text-gray-800">
                  <div className="bg-gradient-to-tr from-indigo-50 to-blue-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm text-gray-600 mb-1">Openness</p>
                    <p className="text-2xl font-bold text-blue-600">{lipData.openness.toFixed(1)}</p>
                  </div>
                  <div className="bg-gradient-to-tr from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm text-gray-600 mb-1">Width</p>
                    <p className="text-2xl font-bold text-green-600">{lipData.width.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Generate Lip-Sync Tab */}
        {activeTab === "generate" && (
          <div className="space-y-6">
            {/* Demo Video Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <VideoIcon className="w-6 h-6" />
                Demo Video
              </h2>
              <p className="text-gray-600 mb-4">See what our AI can do with lip-sync technology</p>
              <iframe
                ref={demoVideoRef}
                className="w-full rounded-xl shadow-lg"
                style={{ aspectRatio: '16/9', minHeight: '400px' }}
                src="https://drive.google.com/file/d/1-04ji6bsYImPwLL0MgYMe88K3JgA6d_L/preview"
                allow="autoplay"
                allowFullScreen
              />
            </div>

            {/* Audio Recording Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Mic className="w-6 h-6" />
                Record Your Audio
              </h2>
              <p className="text-gray-600 mb-4">Record audio to generate a lip-synced video</p>
              
              <div className="flex flex-col items-center gap-4">
                {!audioBlob ? (
                  <button
                    onClick={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                    className={`w-full max-w-md px-8 py-4 rounded-xl font-bold text-lg transition-transform duration-300 transform-gpu flex items-center justify-center gap-3 ${
                      isRecordingAudio
                        ? 'bg-gradient-to-r from-red-500 to-rose-600 animate-pulse shadow-2xl'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 shadow-2xl'
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
                  <div className="w-full max-w-md space-y-4">
                    <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-xl text-center shadow-2xl">
                      ✓ Audio recorded successfully!
                    </div>
                    <audio controls className="w-full rounded-xl shadow-inner">
                      <source src={URL.createObjectURL(audioBlob)} type="audio/wav" />
                    </audio>
                    <div className="flex gap-3">
                      <button
                        onClick={generateLipSync}
                        disabled={isGenerating}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-transform duration-200 transform-gpu flex items-center justify-center gap-2 shadow-2xl hover:shadow-xl"
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
                        className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-xl font-bold transition-transform duration-200 transform-gpu shadow-2xl"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                )}
                
                {isRecordingAudio && (
                  <div className="text-red-500 text-sm flex items-center gap-2 font-semibold">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    Recording in progress...
                  </div>
                )}
              </div>

              {generationError && (
                <div className="mt-4 bg-red-500 text-white p-4 rounded-xl flex items-center gap-3 shadow-lg">
                  <AlertCircle className="w-5 h-5" />
                  <p>{generationError}</p>
                </div>
              )}
            </div>

            {/* Generated Video Section */}
            {generatedVideoUrl && (
              <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-2xl transition-all duration-300 border border-gray-100">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <VideoIcon className="w-6 h-6" />
                    Your Generated Video
                  </h2>
                  <div>
                    <a href={generatedVideoUrl} download="lipsync-video.mp4" className="px-4 py-2 bg-emerald-500 text-white rounded-lg shadow-md">Download</a>
                  </div>
                </div>
                <video
                  className="w-full rounded-xl shadow-lg mb-4"
                  controls
                  autoPlay
                >
                  <source src={generatedVideoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setGeneratedVideoUrl(null);
                      setAudioBlob(null);
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-xl font-bold transition-transform duration-200 transform-gpu shadow-2xl"
                  >
                    Create Another
                  </button>
                </div>
              </div>
            )}

            {/* Tips Section */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-yellow-500" />
                Tips for Best Results
              </h3>
              <ul className="space-y-3 text-gray-600">
                {TIPS.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
                    <span className="text-purple-500 mt-1 text-lg">•</span>
                    <span className="font-medium">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* Waiting Modal */}
        {showWaitingModal && (
          <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl sm:rounded-3xl p-8 max-w-md w-full shadow-2xl">
              <div className="flex flex-col items-center text-center space-y-6">
                <Loader className="w-16 h-16 text-white animate-spin" />
                
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">
                    Generating Your Video...
                  </h2>
                  <p className="text-gray-200">
                    Please wait 2-3 minutes while we process your audio
                  </p>
                </div>

                <div className="w-full bg-white bg-opacity-20 rounded-xl p-4 backdrop-blur-sm">
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

                <div className="flex items-center gap-2 text-gray-200 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
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