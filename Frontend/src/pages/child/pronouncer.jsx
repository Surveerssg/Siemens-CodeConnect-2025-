import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Volume2, Loader2, Gauge, Pause, Play, RotateCcw, Sparkles, Mic, ArrowLeft } from 'lucide-react';

import viseme0 from "../../images/viseme-id-0.jpg";
import viseme1 from "../../images/viseme-id-1.jpg";
import viseme2 from "../../images/viseme-id-2.jpg";
import viseme3 from "../../images/viseme-id-3.jpg";
import viseme4 from "../../images/viseme-id-4.jpg";
import viseme5 from "../../images/viseme-id-5.jpg";
import viseme6 from "../../images/viseme-id-6.jpg";
import viseme7 from "../../images/viseme-id-7.jpg";
import viseme8 from "../../images/viseme-id-8.jpg";
import viseme9 from "../../images/viseme-id-9.jpg";
import viseme10 from "../../images/viseme-id-10.jpg";
import viseme11 from "../../images/viseme-id-11.jpg";
import viseme12 from "../../images/viseme-id-12.jpg";
import viseme13 from "../../images/viseme-id-13.jpg";
import viseme14 from "../../images/viseme-id-14.jpg";
import viseme15 from "../../images/viseme-id-15.jpg";
import viseme16 from "../../images/viseme-id-16.jpg";
import viseme17 from "../../images/viseme-id-17.jpg";
import viseme18 from "../../images/viseme-id-18.jpg";
import viseme19 from "../../images/viseme-id-19.jpg";
import viseme20 from "../../images/viseme-id-20.jpg";
import viseme21 from "../../images/viseme-id-21.jpg";

const VISEME_IMAGES = {
  0: viseme0,
  1: viseme1,
  2: viseme2,
  3: viseme3,
  4: viseme4,
  5: viseme5,
  6: viseme6,
  7: viseme7,
  8: viseme8,
  9: viseme9,
  10: viseme10,
  11: viseme11,
  12: viseme12,
  13: viseme13,
  14: viseme14,
  15: viseme15,
  16: viseme16,
  17: viseme17,
  18: viseme18,
  19: viseme19,
  20: viseme20,
  21: viseme21,
};

const LipsDisplay = ({ visemeId }) => {
  const [imageError, setImageError] = useState(false);
  const imageSrc = VISEME_IMAGES[visemeId] || VISEME_IMAGES[0];
  
  return (
    <div className="w-full flex items-center justify-center relative">
      <img 
        src={imageSrc}
        alt={`Viseme ${visemeId}`}
        className="max-w-full h-auto drop-shadow-2xl transition-all duration-100 rounded-3xl"
        style={{ maxWidth: 420, display: imageError ? 'none' : 'block' }}
        onError={(e) => {
          setImageError(true);
        }}
        onLoad={() => setImageError(false)}
      />
      {imageError && (
        <div className="text-6xl font-bold text-blue-600 opacity-20">
          V{visemeId}
        </div>
      )}
    </div>
  );
};

export default function PronunciationTool() {
  const navigate = useNavigate();
  const [text, setText] = useState('Hello, how are you today?');
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentVisemeId, setCurrentVisemeId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [debugInfo, setDebugInfo] = useState('');
  const [speed, setSpeed] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [words, setWords] = useState([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(-1);

  const audioRef = useRef(null);
  const visemesRef = useRef([]);
  const rafRef = useRef(null);
  const isPlayingRef = useRef(false);
  const audioUrlRef = useRef(null);

  const API_URL = 'https://siemens-codeconnect-2025.onrender.com/api';

  const speedOptions = [
    { value: 1.0, label: 'Normal', icon: '▶️', ssmlRate: 'medium', gradient: 'from-blue-400 to-blue-600' },
    { value: 0.75, label: 'Slow', icon: '⏯️', ssmlRate: 'slow', gradient: 'from-orange-400 to-orange-600' },
    { value: 0.5, label: 'Slower', icon: '🐌', ssmlRate: 'x-slow', gradient: 'from-purple-400 to-purple-600' },
  ];

  useEffect(() => {
    Object.values(VISEME_IMAGES).forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  const animateLoop = () => {
    if (!isPlayingRef.current || !audioRef.current || visemesRef.current.length === 0) {
      return;
    }

    const tMs = audioRef.current.currentTime * 1000;
    setCurrentTime(tMs);

    let active = visemesRef.current[0];
    for (let i = visemesRef.current.length - 1; i >= 0; i--) {
      if (tMs >= visemesRef.current[i].audioOffset) {
        active = visemesRef.current[i];
        break;
      }
    }

    if (active) {
      setCurrentVisemeId(active.visemeId);
      setDebugInfo(`Viseme ${active.visemeId} @ ${Math.round(tMs)}ms`);
    }

    if (words.length > 0) {
      let wordIdx = -1;
      for (let i = words.length - 1; i >= 0; i--) {
        if (tMs >= words[i].audioOffset) {
          wordIdx = i;
          break;
        }
      }
      setCurrentWordIndex(wordIdx);
    }

    rafRef.current = requestAnimationFrame(animateLoop);
  };

  const synthesizeSpeech = async () => {
    if (!text.trim()) {
      setError('Please enter some text');
      return;
    }

    setLoading(true);
    setError('');
    setDebugInfo('🎤 Getting ready to speak...');
    visemesRef.current = [];
    setCurrentVisemeId(0);
    setDuration(0);
    setCurrentTime(0);
    setWords([]);
    setCurrentWordIndex(-1);
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);

    if (audioUrlRef.current) {
      URL.revokeObjectURL(audioUrlRef.current);
      audioUrlRef.current = null;
    }

    try {
      const selectedSpeed = speedOptions.find(opt => opt.value === speed);
      const ssmlRate = selectedSpeed?.ssmlRate || 'medium';

      const resp = await fetch(`${API_URL}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, rate: ssmlRate })
      });

      if (!resp.ok) {
        const err = await resp.json();
        throw new Error(err.error || 'Synthesis failed');
      }

      const data = await resp.json();

      if (!data.visemes || data.visemes.length === 0) {
        setDebugInfo('⚠️ No visemes received');
        visemesRef.current = [];
      } else {
        visemesRef.current = data.visemes;
        setDebugInfo(`✅ Loaded ${visemesRef.current.length} visemes`);
      }

      if (data.words && data.words.length > 0) {
        setWords(data.words);
        setDebugInfo(prev => prev + ` | ${data.words.length} words`);
      }

      if (!data.audio) {
        throw new Error('No audio returned');
      }

      const audioBlob = new Blob(
        [Uint8Array.from(atob(data.audio), c => c.charCodeAt(0))],
        { type: 'audio/mp3' }
      );
      const audioUrl = URL.createObjectURL(audioBlob);
      audioUrlRef.current = audioUrl;

      if (audioRef.current) {
        audioRef.current.src = audioUrl;
        audioRef.current.playbackRate = 1.0;
        await audioRef.current.load();

        audioRef.current.onloadedmetadata = () => {
          setDuration(audioRef.current.duration * 1000);
          setDebugInfo(`✅ Ready to play! ${Math.round(audioRef.current.duration)}s`);
        };

        try {
          await audioRef.current.play();
          isPlayingRef.current = true;
          setIsPlaying(true);
          setIsPaused(false);

          if (visemesRef.current.length > 0) {
            const first = visemesRef.current[0];
            setCurrentVisemeId(first.visemeId);
          }

          animateLoop();
        } catch (playErr) {
          console.error('Play error', playErr);
          setError('Playback failed: ' + playErr.message);
          isPlayingRef.current = false;
          setIsPlaying(false);
        }
      }
    } catch (err) {
      console.error('Synthesis error', err);
      setError(err.message || 'Synthesis error');
      setDebugInfo('❌ ' + (err.message || 'Synthesis error'));
    } finally {
      setLoading(false);
    }
  };

  const togglePause = () => {
    if (!audioRef.current || !isPlaying) return;

    if (isPaused) {
      audioRef.current.play();
      isPlayingRef.current = true;
      setIsPaused(false);
      animateLoop();
    } else {
      audioRef.current.pause();
      isPlayingRef.current = false;
      setIsPaused(true);
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    }
  };

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVisemeId(0);
    setCurrentTime(0);
    setCurrentWordIndex(-1);
    setDebugInfo('Stopped');
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  const handleAudioEnd = () => {
    isPlayingRef.current = false;
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentVisemeId(0);
    setCurrentTime(0);
    setCurrentWordIndex(-1);
    setDebugInfo('✅ Finished!');
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 font-[Arial,sans-serif] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="grid grid-cols-3 items-center gap-4">
            <div className="justify-self-start">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-white text-gray-700 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 border border-gray-200"
              >
                <ArrowLeft size={20} />
                <span>Back to Dashboard</span>
              </button>
            </div>

            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-3">
                Pronunciation Practice
                <Sparkles className="text-yellow-500 w-8 h-8 sm:w-10 sm:h-10" />
              </h1>
              <p className="text-base sm:text-lg text-blue-600 font-medium">
                Watch the lips move and practice speaking!
              </p>
            </div>

            <div className="justify-self-end" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
          {/* Main Display Area */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Lips Display Card */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100">
              <div className="relative w-full h-64 sm:h-80 lg:h-96 flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-2xl sm:rounded-3xl overflow-hidden">
                <LipsDisplay visemeId={currentVisemeId} />
                
                {/* Floating viseme indicator */}
                <div className="absolute top-4 right-4 bg-white px-4 py-2 rounded-xl shadow-lg border border-gray-200">
                  <div className="text-sm font-semibold text-gray-600">Viseme</div>
                  <div className="text-2xl font-bold text-blue-600">{currentVisemeId}</div>
                </div>
              </div>
            </div>

            {/* Word Display */}
            {isPlaying && words.length > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <Mic className="text-purple-600 w-5 h-5" />
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Currently Speaking:
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2 sm:gap-3 justify-center min-h-[3rem]">
                  {words.map((word, idx) => (
                    <span
                      key={idx}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl text-base sm:text-lg font-semibold transition-all duration-200 ${
                        idx === currentWordIndex
                          ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-110 shadow-lg'
                          : idx < currentWordIndex
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                      }`}
                    >
                      {word.text}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Playback Controls */}
            {isPlaying && (
              <div className="flex gap-3 sm:gap-4 justify-center">
                <button
                  onClick={togglePause}
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {isPaused ? (
                    <>
                      <Play size={20} /> Resume
                    </>
                  ) : (
                    <>
                      <Pause size={20} /> Pause
                    </>
                  )}
                </button>
                <button
                  onClick={stopPlayback}
                  className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <RotateCcw size={20} /> Stop
                </button>
              </div>
            )}

            {/* Timeline */}
            {isPlaying && duration > 0 && (
              <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md p-6 sm:p-8 border border-gray-100">
                <div className="flex items-center gap-2 mb-4">
                  <div className="text-2xl">📊</div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-800">
                    Progress Timeline
                  </h3>
                </div>
                <div className="relative h-16 sm:h-20 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border-2 border-gray-200 overflow-hidden">
                  {visemesRef.current.map((viseme, idx) => {
                    const position = (viseme.audioOffset / (duration || 1)) * 100;
                    const isActive =
                      currentTime >= viseme.audioOffset &&
                      (idx === visemesRef.current.length - 1 ||
                        currentTime < visemesRef.current[idx + 1].audioOffset);
                    return (
                      <div
                        key={idx}
                        className={`absolute top-0 bottom-0 border-l-2 transition-all ${
                          isActive
                            ? 'border-blue-600 bg-blue-200 z-10'
                            : 'border-gray-300'
                        }`}
                        style={{ left: `${position}%`, width: '2px' }}
                        title={`Viseme ${viseme.visemeId} @ ${viseme.audioOffset}ms`}
                      >
                        <div
                          className={`text-xs font-bold mt-1 ml-1 ${
                            isActive ? 'text-blue-700' : 'text-gray-400'
                          }`}
                        >
                          {viseme.visemeId}
                        </div>
                      </div>
                    );
                  })}

                  {/* Current time indicator */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-pink-500 z-20 shadow-lg"
                    style={{ left: `${(currentTime / (duration || 1)) * 100}%` }}
                  >
                    <div className="w-4 h-4 bg-red-500 rounded-full -ml-1.5 -mt-1 shadow-lg border-2 border-white"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs sm:text-sm text-gray-600 mt-3 font-semibold">
                  <span>0ms</span>
                  <span className="text-blue-600">
                    {currentTime.toFixed(0)}ms / {duration.toFixed(0)}ms
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="space-y-4 sm:space-y-6">
            {/* Speed Control */}
            <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <Gauge className="text-orange-600 w-5 h-5" />
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Speed</h3>
              </div>

              <div className="space-y-3">
                {speedOptions.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setSpeed(opt.value)}
                    disabled={isPlaying || loading}
                    className={`w-full px-4 py-3 sm:py-4 rounded-xl sm:rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 ${
                      speed === opt.value
                        ? `bg-gradient-to-r ${opt.gradient} text-white shadow-lg scale-105`
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-200'
                    } ${
                      isPlaying || loading
                        ? 'opacity-50 cursor-not-allowed'
                        : 'cursor-pointer hover:scale-105'
                    }`}
                  >
                    <span className="text-lg mr-2">{opt.icon}</span>
                    {opt.label}
                    <span className="float-right opacity-75 font-normal">{opt.value}x</span>
                  </button>
                ))}
              </div>

              <div className="mt-4 text-xs sm:text-sm text-gray-600 bg-blue-50 p-3 sm:p-4 rounded-xl border border-blue-100">
                <div className="font-semibold text-blue-800 mb-1">💡 Tip:</div>
                Speed is set before generating. Pick your speed, then click "Generate & Speak"!
              </div>
            </div>

            
          </div>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-md hover:shadow-xl transition-all duration-300 p-6 sm:p-8 border border-gray-100">
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="text-2xl">✍️</div>
              <label className="text-lg sm:text-xl font-bold text-gray-800">
                What do you want to practice?
              </label>
            </div>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              className="w-full p-4 sm:p-5 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:border-blue-500 focus:outline-none resize-none text-base sm:text-lg font-medium"
              rows={4}
              disabled={isPlaying || loading}
              placeholder="Type something fun to practice speaking..."
            />

            {debugInfo && (
              <div className="text-sm bg-blue-50 text-blue-700 p-3 sm:p-4 rounded-xl border border-blue-200 font-semibold">
                {debugInfo}
              </div>
            )}
            {error && (
              <div className="text-sm bg-red-50 text-red-700 p-3 sm:p-4 rounded-xl border border-red-200 font-semibold">
                {error}
              </div>
            )}

            <button
              onClick={synthesizeSpeech}
              disabled={loading || isPlaying || !text.trim()}
              className={`w-full p-4 sm:p-5 rounded-xl sm:rounded-2xl font-bold text-base sm:text-lg transition-all duration-200 flex items-center justify-center gap-3 ${
                loading || isPlaying || !text.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600 text-white hover:shadow-2xl hover:scale-105'
              }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Creating your practice...
                </>
              ) : isPlaying ? (
                <>
                  <Volume2 size={24} className="animate-pulse" />
                  Playing now!
                </>
              ) : (
                <>
                  <Volume2 size={24} />
                  Generate & Speak
                  <Sparkles size={20} />
                </>
              )}
            </button>
          </div>
        </div>

        <audio
          ref={audioRef}
          onEnded={handleAudioEnd}
          onError={e => {
            setError('Audio playback error');
            isPlayingRef.current = false;
            setIsPlaying(false);
            setIsPaused(false);
          }}
        />
      </div>
    </div>
  );
}
