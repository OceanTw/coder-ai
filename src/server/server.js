const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const aiRoutes = require('./routes/ai');
const compileRoutes = require('./routes/compile');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/ai', aiRoutes);
app.use('/api/compile', compileRoutes);
app.use('/api/download', downloadRoutes);

app.use(express.static(path.join(__dirname, '../build')));

app.get('/config.json', (req, res) => {
  const configPath = path.join(__dirname, '../config.json');
  res.sendFile(configPath);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Frontend: http://localhost:${PORT}`);
  console.log(`API: http://localhost:${PORT}/api`);
});

server.timeout = 300000;

process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});