import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const compileProject = async (files, language, outputName) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/compile`, {
      files: files,
      language: language,
      outputName: outputName
    }, {
      timeout: 180000,
      responseType: 'blob'
    });

    return response.data;
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Compilation timeout - the project took too long to compile');
    }
    
    if (error.response) {
      const errorText = await error.response.data.text();
      const errorData = JSON.parse(errorText);
      throw new Error(errorData.error || 'Compilation failed');
    } else if (error.request) {
      throw new Error('Network error during compilation');
    } else {
      throw new Error(error.message || 'Compilation error occurred');
    }
  }
};

export const getSupportedLanguages = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/compile/languages`);
    return response.data.languages;
  } catch (error) {
    console.error('Failed to fetch supported languages:', error);
    return [];
  }
};

export const getCompilationStatus = async (jobId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/compile/status/${jobId}`);
    return response.data;
  } catch (error) {
    console.error('Failed to get compilation status:', error);
    return { status: 'error', message: 'Unable to get status' };
  }
};