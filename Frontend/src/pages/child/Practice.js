import React, { useState, useRef, useEffect } from 'react';
import { Mic, StopCircle, Play, Volume2, RefreshCw } from 'lucide-react';

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
  // Ensure we have the correct data format
  let pcmArray;
  if (pcmData instanceof ArrayBuffer) {
    pcmArray = new Int16Array(pcmData);
  } else if (pcmData instanceof Uint8Array) {
    // Convert Uint8Array to Int16Array (assuming little-endian)
    pcmArray = new Int16Array(pcmData.buffer);
  } else {
    throw new Error('Invalid PCM data format');
  }
  
  const length = pcmArray.length * 2; // 2 bytes per sample
  const arrayBuffer = new ArrayBuffer(44 + length); // 44 bytes for WAV header
  const view = new DataView(arrayBuffer);
  
  // Write WAV header
  const writeString = (offset, string) => {
    for (let i = 0; i < string.length; i++) {
      view.setUint8(offset + i, string.charCodeAt(i));
    }
  };
  
  writeString(0, 'RIFF');
  view.setUint32(4, 36 + length, true); // File size - 8
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1 size (16 for PCM)
  view.setUint16(20, 1, true); // Audio format (1 for PCM)
  view.setUint16(22, 1, true); // Number of channels (1 for mono)
  view.setUint32(24, sampleRate, true); // Sample rate
  view.setUint32(28, sampleRate * 2, true); // Byte rate (sample rate * channels * bytes per sample)
  view.setUint16(32, 2, true); // Block align (channels * bytes per sample)
  view.setUint16(34, 16, true); // Bits per sample
  writeString(36, 'data');
  view.setUint32(40, length, true); // Subchunk2 size
  
  // Write PCM data
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
    // Try with minimal parameters first
    const requestBody = {
        text: word.text,
      target_language_code: 'en-IN',
      speaker: 'abhilash',
      model: 'bulbul:v2',
      speech_rate: 0.5
    };
    
    console.log('📤 Sending request with body:', requestBody);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'api-subscription-key': API_KEY,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📡 Sarvam AI Response status:', response.status);
    console.log('📡 Sarvam AI Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Sarvam AI API error response:', errorText);
      console.error('❌ Request body was:', requestBody);
      throw new Error(`Sarvam AI API error: ${response.status} - ${errorText}`);
    }

    const responseData = await response.json();
    console.log('📊 Response data structure:', Object.keys(responseData));
    
    // The API returns base64 encoded audio
    let audioData;
    if (responseData.audio) {
      // If the response contains base64 audio
      audioData = base64ToArrayBuffer(responseData.audio);
    } else if (responseData.audios && responseData.audios.length > 0) {
      // If the response contains an array of audio
      audioData = base64ToArrayBuffer(responseData.audios[0]);
    } else {
      // If the response is raw binary, get it as array buffer
      const arrayBuffer = await response.arrayBuffer();
      audioData = arrayBuffer;
    }
    
    console.log(`📊 Audio data size: ${audioData.byteLength} bytes`);
    
    // Create a proper WAV file from the PCM data
    const wavBlob = createWavFromPCM(audioData, 22050);
    console.log(`✅ Created WAV file: ${wavBlob.size} bytes`);
    
    // Verify the audio can be played
    return new Promise((resolve, reject) => {
      const testAudio = new Audio();
      const testUrl = URL.createObjectURL(wavBlob);
      testAudio.src = testUrl;
      
      testAudio.onloadeddata = () => {
        console.log('🎵 Audio loaded successfully!');
        URL.revokeObjectURL(testUrl);
        resolve(wavBlob);
      };
      
      testAudio.onerror = (e) => {
        console.error('❌ Audio failed to load:', e);
        URL.revokeObjectURL(testUrl);
        // Fallback to Web Speech API
        console.log('🔄 Falling back to Web Speech API...');
        resolve(generateWebSpeechAudio(word));
      };
      
      testAudio.load();
    });
    
  } catch (error) {
    console.error('❌ Sarvam AI API error:', error);
    
    // Try with different parameters as fallback
    try {
      console.log('🔄 Trying alternative parameters...');
      const altRequestBody = {
        text: word.text,
        language: 'en-IN',
        voice: 'abhilash'
      };
      
      console.log('📤 Trying alternative request with body:', altRequestBody);
      
      const altResponse = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'api-subscription-key': API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(altRequestBody)
      });
      
      if (altResponse.ok) {
        console.log('✅ Alternative parameters worked!');
        const altResponseData = await altResponse.json();
        console.log('📊 Alternative response data structure:', Object.keys(altResponseData));
        
        // Process the alternative response the same way
        let audioData;
        if (altResponseData.audio) {
          audioData = base64ToArrayBuffer(altResponseData.audio);
        } else if (altResponseData.audios && altResponseData.audios.length > 0) {
          audioData = base64ToArrayBuffer(altResponseData.audios[0]);
        } else {
          const arrayBuffer = await altResponse.arrayBuffer();
          audioData = arrayBuffer;
        }
        
        const wavBlob = createWavFromPCM(audioData, 22050);
        console.log(`✅ Created WAV file from alternative: ${wavBlob.size} bytes`);
        
        return new Promise((resolve, reject) => {
          const testAudio = new Audio();
          const testUrl = URL.createObjectURL(wavBlob);
          testAudio.src = testUrl;
          
          testAudio.onloadeddata = () => {
            console.log('🎵 Alternative audio loaded successfully!');
            URL.revokeObjectURL(testUrl);
            resolve(wavBlob);
          };
          
          testAudio.onerror = (e) => {
            console.error('❌ Alternative audio failed to load:', e);
            URL.revokeObjectURL(testUrl);
            reject(new Error('Alternative audio failed to load'));
          };
          
          testAudio.load();
        });
      }
    } catch (altError) {
      console.error('❌ Alternative parameters also failed:', altError);
    }
    
    console.log('🔄 Falling back to Web Speech API...');
    return generateWebSpeechAudio(word);
  }
};

// Fallback: Generate audio using Web Speech API
const generateWebSpeechAudio = (word) => {
  return new Promise((resolve) => {
    // Create an off-screen audio element
    const utterance = new SpeechSynthesisUtterance(word.text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;
    
    // Try to find an Indian English voice
    const voices = speechSynthesis.getVoices();
    const indianVoice = voices.find(voice => 
      voice.lang.includes('en-IN') || 
      voice.name.toLowerCase().includes('indian')
    );
    
    if (indianVoice) {
      utterance.voice = indianVoice;
    }
    
    // Create a simple audio blob for fallback
    // Note: We can't actually record Web Speech API output directly
    // This is a placeholder that triggers the speech synthesis
    const audioData = new Uint8Array(44100); // 1 second of silence at 44.1kHz
    const wavBlob = createWavFromPCM(audioData.buffer, 44100);
    
    // Play the utterance
    speechSynthesis.speak(utterance);
    
    // Return the blob (even though it's silent, the speech will play)
    resolve(wavBlob);
  });
};

// Create WAV file from raw audio data
const createWavFromRawData = async (rawData, sampleRate = 22050) => {
  const length = rawData.byteLength + 44;
  const arrayBuffer = new ArrayBuffer(length);
  const view = new DataView(arrayBuffer);
  let pos = 0;
  
  const setUint16 = (data) => {
    view.setUint16(pos, data, true);
    pos += 2;
  };
  const setUint32 = (data) => {
    view.setUint32(pos, data, true);
    pos += 4;
  };
  
  // RIFF identifier
  setUint32(0x46464952);
  // file length minus RIFF identifier length (8 bytes)
  setUint32(length - 8);
  // RIFF type
  setUint32(0x45564157);
  // format chunk identifier
  setUint32(0x20746d66);
  // format chunk length
  setUint32(16);
  // sample format (raw)
  setUint16(1);
  // channel count
  setUint16(1);
  // sample rate
  setUint32(sampleRate);
  // byte rate (sample rate * block align)
  setUint32(sampleRate * 2);
  // block align (channel count * bytes per sample)
  setUint16(2);
  // bits per sample
  setUint16(16);
  // data chunk identifier
  setUint32(0x61746164);
  // data chunk length
  setUint32(rawData.byteLength);
  
  // Copy raw data
  const rawView = new Uint8Array(rawData);
  const wavView = new Uint8Array(arrayBuffer, pos);
  wavView.set(rawView);
  
  return new Blob([arrayBuffer], { type: 'audio/wav' });
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

    // Clear canvas
    ctx.fillStyle = '#F9FAFB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const drawWaveform = async (blob, color, opacity = 1) => {
      if (!blob) return null;
      
      try {
        console.log(`🎨 Drawing waveform for ${color === '#9333EA' ? 'Sarvam AI' : 'User'} audio (${blob.size} bytes)`);
        
        const arrayBuffer = await blob.arrayBuffer();
        let audioBuffer;
        
        try {
          audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
          console.log(`✅ Audio decoded successfully - Duration: ${audioBuffer.duration.toFixed(2)}s, Sample Rate: ${audioBuffer.sampleRate}Hz`);
        } catch (decodeError) {
          console.error('❌ Error decoding audio data:', decodeError);
          return null;
        }
        
        const data = audioBuffer.getChannelData(0);
        console.log(`📊 Audio data length: ${data.length} samples`);
        
        // Downsample for visualization
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
        
        // Normalize
        const max = Math.max(...filteredData);
        const normalized = filteredData.map(n => max > 0 ? n / max : 0);
        
        console.log(`📈 Waveform data - Max: ${max.toFixed(4)}, Samples: ${normalized.length}`);
        
        // Draw waveform
        ctx.strokeStyle = color;
        ctx.globalAlpha = opacity;
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const sliceWidth = canvas.width / normalized.length;
        const halfHeight = canvas.height / 2;
        
        // Draw top half
        for (let i = 0; i < normalized.length; i++) {
          const x = i * sliceWidth;
          const v = normalized[i];
          const y1 = halfHeight - (v * halfHeight * 0.8);
          
          if (i === 0) {
            ctx.moveTo(x, halfHeight);
          }
          
          ctx.lineTo(x, y1);
        }
        
        // Draw bottom half
        for (let i = normalized.length - 1; i >= 0; i--) {
          const x = i * sliceWidth;
          const v = normalized[i];
          const y2 = halfHeight + (v * halfHeight * 0.8);
          ctx.lineTo(x, y2);
        }
        
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        console.log(`✅ Waveform drawn successfully for ${color === '#9333EA' ? 'Sarvam AI' : 'User'} audio`);
        return normalized;
      } catch (error) {
        console.error('❌ Error drawing waveform:', error);
        return null;
      }
    };

    const calculateSimilarity = (waveform1, waveform2) => {
      if (!waveform1 || !waveform2 || waveform1.length === 0 || waveform2.length === 0) {
        console.log('⚠️ Cannot calculate similarity - missing or empty waveforms');
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
      const clampedSimilarity = Math.max(0, Math.min(100, similarity));
      
      console.log(`🔍 Similarity calculation - Correlation: ${correlation.toFixed(4)}, Similarity: ${clampedSimilarity.toFixed(1)}%`);
      return clampedSimilarity;
    };

    const drawBoth = async () => {
      console.log('🎨 Starting waveform generation...');
      
      // Draw reference waveform (Sarvam AI)
      let refWaveform = null;
      if (referenceBlob) {
        console.log('📊 Drawing Sarvam AI reference waveform...');
        refWaveform = await drawWaveform(referenceBlob, '#9333EA', 0.6);
      } else {
        console.log('⚠️ No reference audio blob available');
      }
      
      // Draw user waveform
      let userWaveform = null;
      if (userBlob) {
        console.log('📊 Drawing user recording waveform...');
        userWaveform = await drawWaveform(userBlob, '#2563EB', 0.8);
      } else {
        console.log('⚠️ No user audio blob available');
      }
      
      // Calculate similarity if both waveforms exist
      if (refWaveform && userWaveform) {
        console.log('🔍 Calculating similarity between waveforms...');
        const sim = calculateSimilarity(refWaveform, userWaveform);
        setSimilarity(sim);
        console.log(`📈 Final similarity score: ${sim.toFixed(1)}%`);
      } else {
        console.log('⚠️ Cannot calculate similarity - missing waveforms');
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

export default function Practice() {
  const [recording, setRecording] = useState(false);
  const [userAudioBlob, setUserAudioBlob] = useState(null);
  const [referenceAudioBlob, setReferenceAudioBlob] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [isGeneratingReference, setIsGeneratingReference] = useState(false);
  const [apiStatus, setApiStatus] = useState('');

  const mediaRecorder = useRef(null);
  const audioChunks = useRef([]);

  const handleGenerateReferenceAudio = async (word) => {
    setSelectedWord(word);
    setUserAudioBlob(null);
    setIsGeneratingReference(true);
    setApiStatus('Generating audio with Sarvam AI...');

    try {
      const audioBlob = await generateSarvamAudio(word);
      setReferenceAudioBlob(audioBlob);
      setApiStatus('Audio generated successfully!');
      
      // Play the audio
      const audio = new Audio();
      audio.src = URL.createObjectURL(audioBlob);
      
      audio.onplay = () => {
        console.log(`▶️ Playing: "${word.text}"`);
      };
      
      audio.onended = () => {
        URL.revokeObjectURL(audio.src);
        setApiStatus('');
      };
      
      audio.onerror = (e) => {
        console.error(`❌ Error playing audio for "${word.text}":`, e);
        setApiStatus('Error playing audio');
        // Fallback to Web Speech API
        const utterance = new SpeechSynthesisUtterance(word.text);
        utterance.rate = 0.9;
        speechSynthesis.speak(utterance);
      };
      
      await audio.play();
      
    } catch (error) {
      console.error('❌ Error generating reference audio:', error);
      setApiStatus(`Error: ${error.message}`);
      // Use Web Speech API as fallback
      const utterance = new SpeechSynthesisUtterance(word.text);
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    } finally {
      setIsGeneratingReference(false);
      setTimeout(() => setApiStatus(''), 3000);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Volume2 size={48} className="text-indigo-600" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Pronunciation Practice
            </h1>
          </div>
          <p className="text-gray-600 text-lg">
            Select a word to hear the AI reference voice, record yourself, and see the waveform comparison!
          </p>
          {apiStatus && (
            <div className="mt-4 text-sm text-indigo-600 bg-indigo-50 px-4 py-2 rounded-full inline-block">
              {apiStatus}
            </div>
          )}
        </div>

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
      </div>
    </div>
  );
}