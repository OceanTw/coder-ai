const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

const openaiService = require('../services/openaiService');
const claudeService = require('../services/claudeService');
const geminiService = require('../services/geminiService');

router.post('/generate', async (req, res) => {
  try {
    const { model, prompt } = req.body;
    
    if (!model || !prompt) {
      return res.status(400).json({
        success: false,
        error: 'Model and prompt are required'
      });
    }

    const configPath = path.join(__dirname, '../../config.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    const systemPrompt = config.systemPrompt;

    let result;
    
    switch (model.type) {
      case 'openai':
        result = await openaiService.generateCode(model['model-name'], systemPrompt, prompt);
        break;
      case 'claude':
        result = await claudeService.generateCode(model['model-name'], systemPrompt, prompt);
        break;
      case 'gemini':
        result = await geminiService.generateCode(model['model-name'], systemPrompt, prompt);
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Unsupported model type'
        });
    }

    res.json({
      success: true,
      result: result
    });

  } catch (error) {
    console.error('AI generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate code'
    });
  }
});

router.get('/models', async (req, res) => {
  try {
    const configPath = path.join(__dirname, '../../config.json');
    const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
    
    res.json({
      success: true,
      models: config.models
    });
  } catch (error) {
    console.error('Error loading models:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to load models'
    });
  }
});

router.get('/validate', async (req, res) => {
  try {
    const results = {
      openai: await openaiService.validateApiKey(),
      claude: await claudeService.validateApiKey(),
      gemini: await geminiService.validateApiKey()
    };

    const allValid = Object.values(results).every(r => r.valid);
    const errors = Object.entries(results)
      .filter(([_, result]) => !result.valid)
      .map(([service, result]) => `${service}: ${result.error}`);

    res.json({
      success: true,
      valid: allValid,
      results: results,
      errors: errors
    });
  } catch (error) {
    console.error('Validation error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to validate API keys'
    });
  }
});

module.exports = router;