const express = require('express');
const router = express.Router();
const compilerService = require('../services/compilerService');

router.post('/', async (req, res) => {
  try {
    const { files, language, projectName } = req.body;
    
    if (!files || !Array.isArray(files) || files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Files array is required'
      });
    }

    const detectedLanguage = language || compilerService.detectLanguage(files);
    const outputName = projectName || 'compiled-project';

    const result = await compilerService.compile(files, detectedLanguage, outputName);
    
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    
    res.send(result.buffer);

  } catch (error) {
    console.error('Compilation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Compilation failed'
    });
  }
});

router.get('/languages', (req, res) => {
  try {
    const supportedLanguages = compilerService.getSupportedLanguages();
    
    res.json({
      success: true,
      languages: supportedLanguages
    });
  } catch (error) {
    console.error('Error getting supported languages:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get supported languages'
    });
  }
});

router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const status = await compilerService.getCompilationStatus(jobId);
    
    res.json({
      success: true,
      status: status
    });
  } catch (error) {
    console.error('Error getting compilation status:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get compilation status'
    });
  }
});

module.exports = router;