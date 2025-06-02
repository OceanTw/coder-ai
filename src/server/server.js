const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const aiRoutes = require('./routes/ai');

const app = express();

// Enhanced CORS configuration for Vercel
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    /https:\/\/.*\.vercel\.app$/,
    /https:\/\/.*\.app\.github\.dev$/,
    /https:\/\/.*\.preview\.app\.github\.dev$/
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Add request logging for debugging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/ai', aiRoutes);

// Serve config.json
app.get('/config.json', (req, res) => {
  res.json({
    models: [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        type: "openai",
        "model-name": "gpt-4o"
      },
      {
        id: "gpt-4-turbo",
        name: "GPT-4 Turbo",
        type: "openai",
        "model-name": "gpt-4-turbo-preview"
      },
      {
        id: "claude-sonnet",
        name: "Claude 3.5 Sonnet",
        type: "claude",
        "model-name": "claude-3-5-sonnet-20241022"
      },
      {
        id: "claude-haiku",
        name: "Claude 3 Haiku",
        type: "claude",
        "model-name": "claude-3-haiku-20240307"
      },
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        type: "gemini",
        "model-name": "gemini-pro"
      },
      {
        id: "gemini-pro-vision",
        name: "Gemini Pro Vision",
        type: "gemini",
        "model-name": "gemini-pro-vision"
      }
    ],
    systemPrompt: "You are an expert code generator. Generate complete, functional code based on user prompts. Return your response in the following JSON format: { \"files\": [{ \"path\": \"relative/file/path\", \"content\": \"file content\", \"language\": \"programming language\" }], \"description\": \"brief description of the generated code\", \"mainFile\": \"path to main executable file\", \"buildInstructions\": \"compilation/build instructions\" }. Ensure all code is production-ready, well-structured, and follows best practices. Include a comprehensive README.md file with setup instructions. Current user: OceanTw, Current date: 2025-06-02 15:57:14 UTC."
  });
});

// Health check endpoint with Vercel info
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    user: 'OceanTw',
    environment: {
      platform: 'vercel',
      nodeEnv: process.env.NODE_ENV || 'development',
      vercelEnv: process.env.VERCEL_ENV || 'development',
      vercelUrl: process.env.VERCEL_URL || 'localhost'
    },
    services: {
      ai: 'running',
      models: 'loaded'
    },
    currentDate: '2025-06-02 15:57:14'
  });
});

// Catch-all error handler
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Handle 404s
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// For Vercel, we export the app instead of listening
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3001;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`👤 User: OceanTw`);
    console.log(`📅 Date: 2025-06-02 15:57:14`);
  });
}

module.exports = app;