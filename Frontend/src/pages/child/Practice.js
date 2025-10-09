import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, StopCircle, Play, Volume2, RefreshCw, Star } from 'lucide-react';
import api from '../../services/api';

// Convert base64 to array buffer
const base64ToArrayBuffer = (base64) => {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
};

// Create proper WAV file from PCM data
const createWavFromPCM = (pcmData, sampleRate = 22050) => {
  let pcmArray;
  if (pcmData instanceof ArrayBuffer) {
    pcmArray = new Int16Array(pcmData);
  } else if (pcmData instanceof Uint8Array) {
    pcmArray = new Int16Array(pcmData.buffer);
  } else {
    throw new Error('Invalid PCM data format');
  }
  
  const length = pcmArray.length * 2;
  const arrayBuffer = new ArrayBuffer(44 + length);
  const view = new DataView(arrayBuffer);
  
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, length, true);
  
  const dataOffset = 44;
  for (let i = 0; i < pcmArray.length; i++) {
    view.setInt16(dataOffset + i * 2, pcmArray[i], true);
  }
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
};

// Generate audio using Sarvam AI API
const generateSarvamAudio = async (word) => {
  const API_KEY = 'sk_o8wnrwb8_UYtlFgncl4Bt76bqkcDOarvH';
  const API_URL = 'https://api.sarvam.ai/text-to-speech';
  
  console.log(`🎤 Generating Sarvam AI audio for: "${word.text}"`);
  
  try {
    const requestBody = {
      text: word.text,
      target_language_code: 'en-IN',
      speaker: 'abhilash',
      model: 'bulbul:v2',
      speech_rate: 0.5
    };
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Sarvam AI API error: ${response.status}`);
    }

    const responseData = await response.json();
    
    let audioData;
    if (responseData.audio) {
      audioData = base64ToArrayBuffer(responseData.audio);
    } else if (responseData.audios && responseData.audios.length > 0) {
      audioData = base64ToArrayBuffer(responseData.audios[0]);
    } else {
      const arrayBuffer = await response.arrayBuffer();
      audioData = arrayBuffer;
    }
    
    const wavBlob = createWavFromPCM(audioData, 22050);
    
    return new Promise((resolve, reject) => {
      const testAudio = new Audio();
      const testUrl = URL.createObjectURL(wavBlob);
      testAudio.src = testUrl;
      
      testAudio.onloadeddata = () => {
        URL.revokeObjectURL(testUrl);
        resolve(wavBlob);
      };
      
      testAudio.onerror = (e) => {
        URL.revokeObjectURL(testUrl);
        resolve(generateWebSpeechAudio(word));
      };
      
      testAudio.load();
    });
    
  } catch (error) {
    console.error('❌ Sarvam AI API error:', error);
    return generateWebSpeechAudio(word);
  }
};

// Fallback: Generate audio using Web Speech API
const generateWebSpeechAudio = (word) => {
  return new Promise((resolve) => {
    const utterance = new SpeechSynthesisUtterance(word.text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    const voices = speechSynthesis.getVoices();
    const indianVoice = voices.find(voice => 
      voice.lang.includes('en-IN') || 
      voice.name.toLowerCase().includes('indian')
    );
    
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    
    const audioData = new Uint8Array(44100);
    const wavBlob = createWavFromPCM(audioData.buffer, 44100);
    
    speechSynthesis.speak(utterance);
    resolve(wavBlob);
  });
};

const words = [
  { id: 'apple', text: 'Apple', color: 'text-red-500', borderColor: 'border-red-500', bgColor: 'bg-red-50' },
  { id: 'banana', text: 'Banana', color: 'text-yellow-500', borderColor: 'border-yellow-500', bgColor: 'bg-yellow-50' },
  { id: 'orange', text: 'Orange', color: 'text-orange-500', borderColor: 'border-orange-500', bgColor: 'bg-orange-50' },
  { id: 'mango', text: 'Mango', color: 'text-green-500', borderColor: 'border-green-500', bgColor: 'bg-green-50' },
  { id: 'grape', text: 'Grape', color: 'text-purple-500', borderColor: 'border-purple-500', bgColor: 'bg-purple-50' },
  { id: 'watermelon', text: 'Watermelon', color: 'text-pink-500', borderColor: 'border-pink-500', bgColor: 'bg-pink-50' }
];

// Component for overlapping waveform visualization
function OverlappingWaveform({ referenceBlob, userBlob }) {
  const canvasRef = useRef(null);
  const [similarity, setSimilarity] = useState(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawWaveform = async (blob, color, opacity = 1) => {
      if (!blob) return null;
      
      try {
        const arrayBuffer = await blob.arrayBuffer();
        let audioBuffer;
        
        try {
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        } catch (decodeError) {
          console.error('❌ Error decoding audio data:', decodeError);
          return null;
        }
        
        const data = audioBuffer.getChannelData(0);
        
        const samples = canvas.width;
        const blockSize = Math.floor(data.length / samples);
        const filteredData = [];
        
        for (let i = 0; i < samples; i++) {
          const blockStart = blockSize * i;
          let sum = 0;
          let count = 0;
          for (let j = 0; j < blockSize && blockStart + j < data.length; j++) {
            sum += Math.abs(data[blockStart + j]);
            count++;
          }
          filteredData.push(count > 0 ? sum / count : 0);
        }
        
        const max = Math.max(...filteredData);
        const normalized = filteredData.map(n => max > 0 ? n / max : 0);
        
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const sliceWidth = canvas.width / normalized.length;
        const halfHeight = canvas.height / 2;
        
        for (let i = 0; i < normalized.length; i++) {
          const x = i * sliceWidth;
          const v = normalized[i];
          const y1 = halfHeight - (v * halfHeight * 0.8);
          
          if (i === 0) {
            ctx.moveTo(x, halfHeight);
          }
          
          ctx.lineTo(x, y1);
        }
        
        for (let i = normalized.length - 1; i >= 0; i--) {
          const x = i * sliceWidth;
          const v = normalized[i];
          const y2 = halfHeight + (v * halfHeight * 0.8);
          ctx.lineTo(x, y2);
        }
        
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        return normalized;
      } catch (error) {
        console.error('❌ Error drawing waveform:', error);
        return null;
      }
    };

    const calculateSimilarity = (waveform1, waveform2) => {
      if (!waveform1 || !waveform2 || waveform1.length === 0 || waveform2.length === 0) {
        return 0;
      }
      
      const minLength = Math.min(waveform1.length, waveform2.length);
      let correlation = 0;
      let norm1 = 0;
      let norm2 = 0;
      
      for (let i = 0; i < minLength; i++) {
        correlation += waveform1[i] * waveform2[i];
        norm1 += waveform1[i] * waveform1[i];
        norm2 += waveform2[i] * waveform2[i];
      }
      
      const denominator = Math.sqrt(norm1) * Math.sqrt(norm2);
      const similarity = denominator > 0 ? (correlation / denominator) * 100 : 0;
      return Math.max(0, Math.min(100, similarity));
    };

    const drawBoth = async () => {
      let refWaveform = null;
      if (referenceBlob) {
        refWaveform = await drawWaveform(referenceBlob, '#9333EA', 0.6);
      }
      
      let userWaveform = null;
      if (userBlob) {
        userWaveform = await drawWaveform(userBlob, '#2563EB', 0.8);
      }
      
      if (refWaveform && userWaveform) {
        const sim = calculateSimilarity(refWaveform, userWaveform);
        setSimilarity(sim);
      } else {
        setSimilarity(null);
      }
    };

    drawBoth();

    return () => {
      audioContext.close();
    };
  }, [referenceBlob, userBlob]);

  return (
    <div>
      <canvas 
        ref={canvasRef} 
        width={800} 
        height={200} 
        className="w-full h-48 rounded-lg"
      />
      {similarity !== null && (
        <div className="text-center mt-6">
          <div className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            {similarity.toFixed(1)}%
          </div>
          <div className="text-lg text-gray-600 mt-2">
            {similarity >= 80 ? 'Excellent match!' : 
             similarity >= 60 ? 'Good! Keep practicing' : 
             'Try to match the reference more closely'}
          </div>
        </div>
      )}
    </div>
  );
}

// Loading Modal Component
function LoadingModal({ tips, currentTip }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mb-6"></div>
          <h3 className="text-2xl font-bold text-gray-800 mb-4">
            Analyzing Your Pronunciation...
          </h3>
          <div className="text-lg text-gray-600 mb-6 min-h-[60px] flex items-center justify-center">
            {tips[currentTip]}
          </div>
          <p className="text-sm text-gray-500">
            This may take a few moments
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Practice() {
  const navigate = useNavigate();
  const [recording, setRecording] = useState(false);
  const [userAudioBlob, setUserAudioBlob] = useState(null);
  const [referenceAudioBlob, setReferenceAudioBlob] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isGeneratingReference, setIsGeneratingReference] = useState(false);
  const [apiStatus, setApiStatus] = useState('');
  
  // Pronunciation scoring states
  const [scoringMode, setScoringMode] = useState(false);
  const [scoringRecording, setScoringRecording] = useState(false);
  const [scoringAudioBlob, setScoringAudioBlob] = useState(null);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [currentTip, setCurrentTip] = useState(0);
  const [scoringResult, setScoringResult] = useState(null);
  const [assignedItems, setAssignedItems] = useState([]);
  const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
  const [refreshingAssignments, setRefreshingAssignments] = useState(false);

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);
  const scoringMediaRecorder = useRef(null);
  const scoringAudioChunks = useRef([]);
  
  const [sampleText, setSampleText] = useState("I am eating apple");
  const [submissionMessage, setSubmissionMessage] = useState('');
  
  const pronunciationTips = [
    "💡 Tip: Speak clearly and at a moderate pace",
    "🎯 Tip: Position yourself close to the microphone",
    "🔊 Tip: Pronounce each word distinctly",
    "😊 Tip: Relax and speak naturally",
    "📢 Tip: Maintain consistent volume throughout",
    "✨ Tip: Practice the sentence before recording"
  ];

  const handleGenerateReferenceAudio = async (word) => {
    setSelectedWord(word);
    setUserAudioBlob(null);
    setIsGeneratingReference(true);
    setApiStatus('Generating audio with Sarvam AI...');

    try {
      const audioBlob = await generateSarvamAudio(word);
      setReferenceAudioBlob(audioBlob);
      setApiStatus('Audio generated successfully!');
      
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);
      
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        setApiStatus('');
      };
      
      audio.onerror = (e) => {
        console.error(`❌ Error playing audio for "${word.text}":`, e);
        setApiStatus('Error playing audio');
        const utterance = new SpeechSynthesisUtterance(word.text);
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('❌ Error generating reference audio:', error);
      setApiStatus(`Error: ${error.message}`);
      const utterance = new SpeechSynthesisUtterance(word.text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    } finally {
      setIsGeneratingReference(false);
      setTimeout(() => setApiStatus(''), 3000);
    }
  };

  // Load assigned items for the logged-in child on mount
  useEffect(() => {
    let mounted = true;
    const loadAssigned = async () => {
      try {
        const res = await api.practice.listAssigned();
        if (mounted) setAssignedItems(res.data || []);
      } catch (e) {
        console.warn('Failed to load assigned practice items:', e);
      }
    };
    loadAssigned();
    return () => { mounted = false; };
  }, []);

  const handleSelectAssignment = (assignment) => {
    if (!assignment) {
      setSelectedAssignmentId(null);
      setSelectedWord(null);
      setSampleText("I am eating apple");
      return;
    }

    // For words: mark completed on the backend without creating an attempt document
    if (assignment.type === 'word') {
      (async () => {
        try {
          setRefreshingAssignments(true);
          await api.practice.markComplete(assignment.id);
          const refreshed = await api.practice.listAssigned();
          setAssignedItems(refreshed.data || []);
        } catch (e) {
          console.warn('Failed to mark word complete:', e);
        } finally {
          setRefreshingAssignments(false);
        }
      })();
    }

    setSelectedAssignmentId(assignment.id);
    if (assignment.type === 'word') {
      const w = { id: assignment.id, text: assignment.text };
      setSelectedWord(w);
      handleGenerateReferenceAudio(w);
    } else {
      // for sentence: don't auto-create attempts on select; just set the sample text
      setSelectedWord(null);
      if (assignment.text && assignment.text.trim().length > 0) {
        setSampleText(assignment.text);
      }
    }
  };

  const handleRecord = async () => {
    if (!recording) {
      try {
        setRecording(true);
        setUserAudioBlob(null);
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        let options = { mimeType: 'audio/webm;codecs=opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'audio/webm' };
        }
        
        mediaRecorder.current = new MediaRecorder(stream, options);
        audioChunks.current = [];

        mediaRecorder.current.ondataavailable = e => {
          if (e.data.size > 0) {
            audioChunks.current.push(e.data);
          }
        };

        mediaRecorder.current.onstop = () => {
          const blob = new Blob(audioChunks.current, { type: options.mimeType });
          setUserAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop());
        };

        mediaRecorder.current.start();
      } catch (error) {
        console.error('Error starting recording:', error);
        setRecording(false);
        alert('Unable to access microphone. Please check your permissions.');
      }
    } else {
      setRecording(false);
      if (mediaRecorder.current && mediaRecorder.current.state === 'recording') {
        mediaRecorder.current.stop();
      }
    }
  };

  const playAudio = (blob) => {
    if (!blob) return;
    
    try {
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      
      audio.onended = () => {
        URL.revokeObjectURL(url);
      };
      
      audio.onerror = (e) => {
        console.error('Audio playback error:', e);
        if (blob === referenceAudioBlob && selectedWord) {
          const utterance = new SpeechSynthesisUtterance(selectedWord.text);
          utterance.rate = 0.9;
          speechSynthesis.speak(utterance);
        }
      };
      
      audio.play().catch(err => {
        console.error('Play failed:', err);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  const reset = () => {
    setUserAudioBlob(null);
    setReferenceAudioBlob(null);
    setSelectedWord(null);
    setRecording(false);
    setApiStatus('');
    setScoringRecording(false);
    setScoringAudioBlob(null);
    setScoringResult(null);
    setShowLoadingModal(false);
    setSampleText("I am eating apple");
  };
  
  const handleScoringRecord = async () => {
    if (!scoringRecording) {
      try {
        setScoringRecording(true);
        setScoringAudioBlob(null);
        setScoringResult(null);
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        let options = { mimeType: 'audio/webm;codecs=opus' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          options = { mimeType: 'audio/webm' };
        }
        
        scoringMediaRecorder.current = new MediaRecorder(stream, options);
        scoringAudioChunks.current = [];

        scoringMediaRecorder.current.ondataavailable = e => {
          if (e.data.size > 0) {
            scoringAudioChunks.current.push(e.data);
          }
        };

        scoringMediaRecorder.current.onstop = async () => {
          const blob = new Blob(scoringAudioChunks.current, { type: options.mimeType });
          setScoringAudioBlob(blob);
          stream.getTracks().forEach(track => track.stop());
          
          await sendToScoringAPI(blob);
        };

        scoringMediaRecorder.current.start();
      } catch (error) {
        console.error('Error starting scoring recording:', error);
        setScoringRecording(false);
        alert('Unable to access microphone. Please check your permissions.');
      }
    } else {
      setScoringRecording(false);
      if (scoringMediaRecorder.current && scoringMediaRecorder.current.state === 'recording') {
        scoringMediaRecorder.current.stop();
      }
    }
  };
  
  const sendToScoringAPI = async (audioBlob) => {
    setShowLoadingModal(true);
    setCurrentTip(0);
    
    const tipInterval = setInterval(() => {
      setCurrentTip(prev => (prev + 1) % pronunciationTips.length);
    }, 3000);
    
    try {
  const formData = new FormData();
  formData.append('audio', audioBlob, 'recording.webm');
  // send the dynamic sample text (either selected assignment sentence or default)
  formData.append('text', sampleText);
      
      const response = await fetch('https://pronunciation-score-final.onrender.com/analyze/', {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const result = await response.json();
      setScoringResult(result);
      try {
        if (selectedAssignmentId) {
          await api.practice.submitAttempt(selectedAssignmentId, { score: result.final_score, predicted_text: result.predicted_text });
          setRefreshingAssignments(true);
          const refreshed = await api.practice.listAssigned();
          setAssignedItems(refreshed.data || []);
          setRefreshingAssignments(false);
          setSubmissionMessage('Attempt saved for the selected assignment');
          setTimeout(() => setSubmissionMessage(''), 4000);
        } else {
          // fallback to exact text match
          const assignedRes = await api.practice.listAssigned();
          const match = (assignedRes.data || []).find(a => a.type === 'sentence' && a.text && a.text.trim().toLowerCase() === sampleText.trim().toLowerCase());
          if (match) await api.practice.submitAttempt(match.id, { score: result.final_score, predicted_text: result.predicted_text });
          if (match) {
            setRefreshingAssignments(true);
            const refreshed2 = await api.practice.listAssigned();
            setAssignedItems(refreshed2.data || []);
            setRefreshingAssignments(false);
            setSubmissionMessage('Attempt saved for your assignment');
            setTimeout(() => setSubmissionMessage(''), 4000);
          }
        }
      } catch (e) {
        console.warn('Failed to submit practice attempt to backend:', e);
      }
      
    } catch (error) {
      console.error('Error calling pronunciation API:', error);
      setScoringResult({ 
        error: true, 
        message: 'Failed to analyze pronunciation. Please try again.' 
      });
    } finally {
      clearInterval(tipInterval);
      setShowLoadingModal(false);
    }
  };
  
  const getScoringFeedback = (score) => {
    if (score >= 90) return { emoji: '🌟', text: 'Excellent!', color: 'text-green-600', bgColor: 'bg-green-50' };
    if (score >= 75) return { emoji: '😊', text: 'Great Job!', color: 'text-blue-600', bgColor: 'bg-blue-50' };
    if (score >= 60) return { emoji: '👍', text: 'Good Effort!', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
    if (score >= 40) return { emoji: '💪', text: 'Keep Practicing!', color: 'text-orange-600', bgColor: 'bg-orange-50' };
    return { emoji: '📚', text: 'Try Again!', color: 'text-red-600', bgColor: 'bg-red-50' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      {showLoadingModal && <LoadingModal tips={pronunciationTips} currentTip={currentTip} />}
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-start justify-between mb-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="text-sm text-indigo-600 bg-indigo-50 px-3 py-2 rounded-lg border border-indigo-100 hover:bg-indigo-100"
            >
              ← Back to Dashboard
            </button>
          </div>
          <div className="flex items-center justify-center gap-3 mb-4">
            <Volume2 size={48} className="text-indigo-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Pronunciation Practice
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Choose a practice mode: Word pronunciation or sentence scoring!
          </p>
          {apiStatus && (
            <div className="mt-4 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full inline-block">
              {apiStatus}
            </div>
          )}
          {submissionMessage && (
            <div className="mt-4 text-sm text-green-700 bg-green-50 px-4 py-2 rounded-full inline-block">
              {submissionMessage}
            </div>
          )}
        </div>

        {/* Mode Selection */}
        {/* Assigned Items */}
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Your Assigned Practice</h2>
          {assignedItems.length === 0 ? (
            <p className="text-gray-600">No assigned words or sentences yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assignedItems.map(ai => (
                <div key={ai.id} className={`p-3 rounded-lg border ${selectedAssignmentId === ai.id ? 'border-indigo-500 bg-indigo-50' : 'border-gray-200'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-gray-800">{ai.type === 'sentence' ? 'Sentence' : 'Word'}</div>
                      <div className="text-sm text-gray-700">{ai.text}</div>
                      {ai.latestScore !== null && ai.latestScore !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">Latest score: {ai.latestScore}%</div>
                      )}
                    </div>
                    <div>
                      <button
                        onClick={() => handleSelectAssignment(selectedAssignmentId === ai.id ? null : ai)}
                        className={`px-3 py-1 rounded-full text-sm ${selectedAssignmentId === ai.id ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-800'}`}
                        disabled={refreshingAssignments}
                      >
                        {refreshingAssignments ? 'Refreshing...' : (selectedAssignmentId === ai.id ? 'Selected' : 'Select')}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
            Select Practice Mode
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => { setScoringMode(false); reset(); }}
              className={`p-8 rounded-xl border-4 transition-all duration-300 ${
                !scoringMode 
                  ? 'border-indigo-500 bg-indigo-50 shadow-lg scale-105' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-5xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Word Practice</h3>
              <p className="text-gray-600">Compare your pronunciation with AI reference</p>
            </button>
            
            <button
              onClick={() => { setScoringMode(true); reset(); }}
              className={`p-8 rounded-xl border-4 transition-all duration-300 ${
                scoringMode 
                  ? 'border-purple-500 bg-purple-50 shadow-lg scale-105' 
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="text-5xl mb-4">⭐</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Sentence Scoring</h3>
              <p className="text-gray-600">Get scored on your pronunciation accuracy</p>
            </button>
          </div>
        </div>

        {/* Scoring Mode */}
        {scoringMode && (
          <>
            {/* Sample Text Display */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Read This Sentence
              </h2>
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-8 border-2 border-purple-200">
                <p className="text-4xl font-bold text-center text-gray-800">
                  "{sampleText}"
                </p>
              </div>
            </div>

            {/* Recording Section */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </span>
                Record Your Voice
              </h2>
              
              <div className="flex flex-col items-center gap-6">
                <button
                  onClick={handleScoringRecord}
                  disabled={showLoadingModal}
                  className={`
                    relative px-8 py-4 rounded-full font-semibold text-lg
                    border-none cursor-pointer transition-all duration-300
                    flex items-center gap-3 outline-none
                    hover:scale-105 active:scale-95 disabled:opacity-50
                    ${scoringRecording 
                      ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                      : 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    }
                  `}
                >
                  {scoringRecording ? (
                    <>
                      <StopCircle size={24} />
                      Stop Recording
                    </>
                  ) : (
                    <>
                      <Mic size={24} />
                      Start Recording
                    </>
                  )}
                </button>

                {scoringRecording && (
                  <p className="text-red-500 text-sm animate-pulse">
                    Recording... Say "{sampleText}"
                  </p>
                )}

                {scoringAudioBlob && !scoringRecording && (
                  <button
                    onClick={() => playAudio(scoringAudioBlob)}
                    className="px-5 py-2 rounded-full border-none cursor-pointer transition-all duration-300 flex items-center gap-2 font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                  >
                    <Play size={16} />
                    Play Your Recording
                  </button>
                )}
              </div>
            </div>

            {/* Results Section */}
            {scoringResult && !scoringResult.error && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Your Results
                </h2>

                {/* Final Score */}
                <div className={`${getScoringFeedback(scoringResult.final_score).bgColor} rounded-xl p-8 mb-6 border-2 border-gray-200`}>
                  <div className="text-center">
                    <div className="text-8xl mb-4">{getScoringFeedback(scoringResult.final_score).emoji}</div>
                    <div className={`text-3xl font-bold mb-2 ${getScoringFeedback(scoringResult.final_score).color}`}>
                      {getScoringFeedback(scoringResult.final_score).text}
                    </div>
                    <div className="text-6xl font-bold text-gray-800 mb-2">
                      {scoringResult.final_score.toFixed(1)}%
                    </div>
                    <div className="text-lg text-gray-600">Overall Score</div>
                  </div>
                </div>

                {/* Detailed Scores */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-xl p-6 border-2 border-blue-200 text-center">
                    <div className="text-4xl mb-2">🎯</div>
                    <div className="text-3xl font-bold text-blue-600 mb-1">
                      {scoringResult.phoneme_score.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Phoneme Score</div>
                    <div className="text-xs text-gray-500 mt-1">Word accuracy</div>
                  </div>

                  <div className="bg-green-50 rounded-xl p-6 border-2 border-green-200 text-center">
                    <div className="text-4xl mb-2">🔊</div>
                    <div className="text-3xl font-bold text-green-600 mb-1">
                      {scoringResult.acoustic_score.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Acoustic Score</div>
                    <div className="text-xs text-gray-500 mt-1">Sound quality</div>
                  </div>

                  <div className="bg-purple-50 rounded-xl p-6 border-2 border-purple-200 text-center">
                    <div className="text-4xl mb-2">⭐</div>
                    <div className="text-3xl font-bold text-purple-600 mb-1">
                      {scoringResult.final_score.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">Final Score</div>
                    <div className="text-xs text-gray-500 mt-1">Combined rating</div>
                  </div>
                </div>

                {/* Predicted Text */}
                <div className="bg-gray-50 rounded-xl p-6 border-2 border-gray-200">
                  <div className="text-sm font-semibold text-gray-700 mb-2">What we heard:</div>
                  <div className="text-xl text-gray-800 font-medium">
                    "{scoringResult.predicted_text}"
                  </div>
                </div>

                {/* Try Again Button */}
                <div className="flex gap-3 justify-center mt-6">
                  <button 
                    onClick={() => {
                      setScoringResult(null);
                      setScoringAudioBlob(null);
                    }}
                    className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full border-none cursor-pointer transition-all duration-300 flex items-center gap-2 text-base hover:bg-purple-700 hover:scale-105"
                  >
                    <RefreshCw size={18} />
                    Try Again
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {scoringResult && scoringResult.error && (
              <div className="bg-red-50 rounded-2xl shadow-xl p-8 border-2 border-red-200">
                <div className="text-center">
                  <div className="text-6xl mb-4">❌</div>
                  <h3 className="text-xl font-bold text-red-600 mb-2">Oops!</h3>
                  <p className="text-gray-600 mb-4">{scoringResult.message}</p>
                  <button 
                    onClick={() => {
                      setScoringResult(null);
                      setScoringAudioBlob(null);
                    }}
                    className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full border-none cursor-pointer transition-all duration-300 flex items-center gap-2 text-base hover:bg-red-700 hover:scale-105 mx-auto"
                  >
                    <RefreshCw size={18} />
                    Try Again
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Word Practice Mode */}
        {!scoringMode && (
          <>
            {/* Word Selection */}
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
              <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </span>
                Choose a Word
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {words.map(word => (
                  <button
                    key={word.id}
                    onClick={() => handleGenerateReferenceAudio(word)}
                    disabled={isGeneratingReference}
                    className={`
                      relative p-6 rounded-xl border-4 bg-white cursor-pointer
                      transition-all duration-300 outline-none
                      hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
                      ${selectedWord?.id === word.id 
                        ? `${word.borderColor} ${word.bgColor} shadow-lg` 
                        : 'border-gray-200 hover:border-gray-300'
                      }
                    `}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-3xl font-bold text-gray-800">{word.text}</div>
                        <div className="text-sm text-gray-500 mt-1">
                          {isGeneratingReference && selectedWord?.id === word.id ? 
                            'Generating audio...' : 
                            'Click to play'}
                        </div>
                      </div>
                      <Volume2 size={32} className={word.color} />
                    </div>
                    {selectedWord?.id === word.id && !isGeneratingReference && (
                      <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Recording Section */}
            {selectedWord && (
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    2
                  </span>
                  Record Your Pronunciation
                </h2>
                
                <div className="flex flex-col items-center gap-6">
                  <button
                    onClick={handleRecord}
                    disabled={isGeneratingReference}
                    className={`
                      relative px-8 py-4 rounded-full font-semibold text-lg
                      border-none cursor-pointer transition-all duration-300
                      flex items-center gap-3 outline-none
                      hover:scale-105 active:scale-95 disabled:opacity-50
                      ${recording 
                        ? 'bg-red-500 text-white shadow-lg shadow-red-500/50' 
                        : 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                      }
                    `}
                  >
                    {recording ? (
                      <>
                        <StopCircle size={24} />
                        Stop Recording
                      </>
                    ) : (
                      <>
                        <Mic size={24} />
                        Start Recording
                      </>
                    )}
                  </button>

                  {recording && (
                    <p className="text-red-500 text-sm animate-pulse">
                      Recording... Say "{selectedWord.text}"
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Waveform Comparison */}
            {(referenceAudioBlob || userAudioBlob) && (
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
                  <span className="bg-indigo-100 text-indigo-600 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                    3
                  </span>
                  Waveform Comparison
                </h2>
                
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200">
                  <div className="relative w-full h-48 bg-gray-50 rounded-lg overflow-hidden">
                    <OverlappingWaveform 
                      referenceBlob={referenceAudioBlob} 
                      userBlob={userAudioBlob} 
                    />
                  </div>
                  
                  <div className="flex gap-6 mt-4 justify-center flex-wrap">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <div className="w-3 h-3 bg-purple-600 rounded-full"></div>
                      <span>AI Reference ({selectedWord?.text})</span>
                    </div>
                    {userAudioBlob && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span>Your Recording</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-5 justify-center">
                    {referenceAudioBlob && (
                      <button
                        onClick={() => playAudio(referenceAudioBlob)}
                        className="px-5 py-2 rounded-full border-none cursor-pointer transition-all duration-300 flex items-center gap-2 font-medium text-sm bg-purple-600 text-white hover:bg-purple-700 hover:scale-105"
                      >
                        <Play size={16} />
                        Play Reference
                      </button>
                    )}
                    {userAudioBlob && (
                      <button
                        onClick={() => playAudio(userAudioBlob)}
                        className="px-5 py-2 rounded-full border-none cursor-pointer transition-all duration-300 flex items-center gap-2 font-medium text-sm bg-blue-600 text-white hover:bg-blue-700 hover:scale-105"
                      >
                        <Play size={16} />
                        Play Recording
                      </button>
                    )}
                  </div>
                </div>

                <div className="flex gap-3 justify-center mt-6">
                  <button 
                    onClick={reset} 
                    className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-full border-none cursor-pointer transition-all duration-300 flex items-center gap-2 text-base hover:bg-gray-300 hover:scale-105"
                  >
                    <RefreshCw size={18} />
                    Try Another Word
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}