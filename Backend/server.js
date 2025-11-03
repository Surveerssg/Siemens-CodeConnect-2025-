const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const sdk = require('microsoft-cognitiveservices-speech-sdk');

require('dotenv').config();

const { initializeFirebase } = require('./config/firebase');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const userRoutes = require('./routes/users');
const progressRoutes = require('./routes/progress');
const gameRoutes = require('./routes/games');
const goalRoutes = require('./routes/goals');
const parentGoalsRoutes = require('./routes/parentGoals');
const parentChildrenRoutes = require('./routes/parentChildren');
const therapistChildrenRoutes = require('./routes/therapistChildren');
const practiceRoutes = require('./routes/practice');
// Initialize Express app
const app = express();

// Initialize Firebase
initializeFirebase();

// Security middleware
app.use(helmet());

// CORS configuration
// CORS configuration (global access)
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow requests like Postman / mobile apps
    return callback(null, true); // allow all origins
  },
  credentials: true, // allow cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Apply CORS globally
app.use(cors(corsOptions));

// Use the same options for preflight requests
app.options('*', cors(corsOptions));
app.use(cors())
app.use(express.json());


// Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     error: 'Too many requests from this IP, please try again later.'
//   },
//   // Skip rate limiting during local development to avoid interrupting dev flows
//   skip: () => (process.env.NODE_ENV || 'development') !== 'production'
// });
// app.use(limiter);

// Compression middleware
app.use(compression());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
const SPEECH_KEY = process.env.AZURE_SPEECH_KEY;
const SPEECH_REGION = process.env.AZURE_SPEECH_REGION;

app.post('/api/synthesize', async (req, res) => {
  const { text, rate = 'medium' } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(SPEECH_KEY, SPEECH_REGION);
    
    // Set the voice
    speechConfig.speechSynthesisVoiceName = 'en-US-JennyNeural';
    
    // Use MP3 format for better compatibility
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, null);

    const visemes = [];
    const words = [];

    // Subscribe to viseme events
    synthesizer.visemeReceived = (s, e) => {
      visemes.push({
        audioOffset: e.audioOffset / 10000, // Convert to milliseconds
        visemeId: e.visemeId
      });
    };

    // Subscribe to word boundary events
    synthesizer.wordBoundary = (s, e) => {
      words.push({
        text: e.text,
        audioOffset: e.audioOffset / 10000, // Convert to milliseconds
        duration: e.duration / 10000
      });
    };

    // Create SSML with prosody rate
    // SSML rate values: x-slow, slow, medium, fast, x-fast, or percentage like "50%"
    const ssml = `
      <speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
        <voice name="en-US-JennyNeural">
          <prosody rate="${rate}">
            ${text}
          </prosody>
        </voice>
      </speak>
    `;

    // Synthesize speech
    const result = await new Promise((resolve, reject) => {
      synthesizer.speakSsmlAsync(
        ssml,
        result => {
          if (result.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(result);
          } else {
            reject(new Error(`Speech synthesis failed: ${result.errorDetails}`));
          }
          synthesizer.close();
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });

    // Convert audio to base64
    const audioData = result.audioData;
    const audioBase64 = Buffer.from(audioData).toString('base64');

    // Sort visemes and words by time
    visemes.sort((a, b) => a.audioOffset - b.audioOffset);
    words.sort((a, b) => a.audioOffset - b.audioOffset);

    res.json({
      audio: audioBase64,
      visemes: visemes,
      words: words,
      duration: result.audioDuration / 10000 // in milliseconds
    });

  } catch (error) {
    console.error('Synthesis error:', error);
    res.status(500).json({ error: error.message || 'Speech synthesis failed' });
  }
});

app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'SpeakUp Backend API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API routes
app.use('/api/users', userRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/games', gameRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/parent/goals', parentGoalsRoutes);
app.use('/api/parent/children', parentChildrenRoutes);
app.use('/api/therapist/children', therapistChildrenRoutes);
app.use('/api/practice', practiceRoutes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to SpeakUp Backend API',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      users: '/api/users',
      progress: '/api/progress',
      games: '/api/games',
      goals: '/api/goals'
    }
  });
});

// 404 handler
app.use(notFound);

// Error handling middleware
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`🚀 SpeakUp Backend API running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Process terminated');
  });
});

module.exports = app;
