import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const generateCode = async (model, prompt) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/ai/generate`, {
      model: model,
      prompt: prompt
    }, {
      timeout: 120000
    });

    if (response.data.success) {
      return response.data.result;
    } else {
      throw new Error(response.data.error || 'Failed to generate code');
    }
  } catch (error) {
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
    return response.data.models;
  } catch (error) {
    console.error('Failed to fetch models:', error);
    return [];
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