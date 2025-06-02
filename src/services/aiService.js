import axios from 'axios';

// Detect the correct API URL for different environments
const getApiUrl = () => {
  // In production (Vercel), use relative URLs
  if (process.env.NODE_ENV === 'production') {
    return '';
  }
  
  // For development, use environment variable or localhost
  return process.env.REACT_APP_API_URL || 'http://localhost:3001';
};

const API_BASE_URL = getApiUrl();

console.log('API Base URL:', API_BASE_URL || 'relative URLs');

export const generateCode = async (model, prompt) => {
  try {
    console.log('Sending generate request to:', `${API_BASE_URL}/api/ai/generate`);
    console.log('User: OceanTw, Date: 2025-06-02 15:57:14');
    
    const response = await axios.post(`${API_BASE_URL}/api/ai/generate`, {
      model: model,
      prompt: prompt,
      user: 'OceanTw',
      timestamp: '2025-06-02 15:57:14'
    }, {
      timeout: 120000,
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || 'Failed to generate code');
    }
  } catch (error) {
    console.error('Generate code error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - the AI model took too long to respond');
    }
    
    if (error.response) {
      throw new Error(error.response.data.error || 'Server error occurred');
    } else if (error.request) {
      throw new Error('Network error - please check your connection');
    } else {
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
};

export const getAvailableModels = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/ai/models`);
    if (response.data.success) {
      return response.data.models;
    }
    return response.data.models || [];
  } catch (error) {
    console.error('Failed to fetch models:', error);
    // Return fallback models
    return [
      {
        id: "gpt-4o",
        name: "GPT-4o",
        type: "openai",
        "model-name": "gpt-4o"
      },
      {
        id: "claude-sonnet",
        name: "Claude 3.5 Sonnet",
        type: "claude",
        "model-name": "claude-3-5-sonnet-20241022"
      },
      {
        id: "gemini-pro",
        name: "Gemini Pro",
        type: "gemini",
        "model-name": "gemini-pro"
      }
    ];
  }
};

export const validateApiKeys = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/ai/validate`);
    return response.data;
  } catch (error) {
    console.error('Failed to validate API keys:', error);
    return { valid: false, errors: ['Unable to validate API keys'] };
  }
};