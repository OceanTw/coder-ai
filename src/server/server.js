const express = require('express');
const cors = require('cors');
const path = require('path');

// Import routes
const aiRoutes = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'https://*.app.github.dev'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/ai', aiRoutes);

// Serve config.json
app.get('/config.json', (req, res) => {
  res.json({
    models: [
      {
        id: "gpt-4",
        name: "GPT-4",
        type: "openai",
        "model-name": "gpt-4"
      },
      {
        id: "claude-sonnet",
        name: "Claude Sonnet",
        type: "claude",
        "model-name": "claude-3-5-sonnet-20241022"
      },
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        type: "gemini",
        "model-name": "gemini-pro"
      }
    ],
    systemPrompt: "You are an expert code generator. Generate complete, functional code based on user prompts. Return your response in the following JSON format: { \"files\": [{ \"path\": \"relative/file/path\", \"content\": \"file content\", \"language\": \"programming language\" }], \"description\": \"brief description of the generated code\", \"mainFile\": \"path to main executable file\", \"buildInstructions\": \"compilation/build instructions\" }. Ensure all code is production-ready, well-structured, and follows best practices. Include a comprehensive README.md file."
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    user: 'OceanTw',
    services: {
      ai: 'running',
      models: 'loaded'
    }
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    timestamp: new Date().toISOString()
  });
});

// Start server
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📱 Frontend: http://localhost:3000`);
  console.log(`🔌 API: http://localhost:${PORT}/api`);
  console.log(`💚 Health check: http://localhost:${PORT}/health`);
  console.log(`👤 User: OceanTw`);
  console.log(`⏰ Started at: ${new Date().toISOString()}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('🛑 SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('✅ Server closed.');
    process.exit(0);
  });
});