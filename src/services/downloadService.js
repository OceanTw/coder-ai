import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const downloadFiles = async (files, projectName = 'generated-project') => {
  try {
    const zip = new JSZip();
    
    files.forEach(file => {
      zip.file(file.path, file.content);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    saveAs(content, `${projectName}.zip`);
    
    return true;
  } catch (error) {
    console.error('Download failed:', error);
    throw new Error('Failed to create download package');
  }
};

export const compileProject = async (files, projectName = 'generated-project') => {
  try {
    const language = detectProjectLanguage(files);
    
    const response = await axios.post(`${API_BASE_URL}/api/compile`, {
      files: files,
      language: language,
      projectName: projectName
    }, {
      timeout: 300000,
      responseType: 'blob'
    });
    
    const outputExtension = getOutputExtension(language);
    const filename = `${projectName}${outputExtension}`;
    
    saveAs(response.data, filename);
    
    return {
      success: true,
      filename: filename,
      language: language
    };
  } catch (error) {
    if (error.code === 'ECONNABORTED') {
      throw new Error('Compilation timeout - project too complex or server overloaded');
    }
    
    if (error.response && error.response.status === 400) {
      throw new Error('Compilation failed - check your code for errors');
    } else if (error.response && error.response.status === 500) {
      throw new Error('Server error during compilation - please try again');
    } else if (error.request) {
      throw new Error('Network error - unable to reach compilation server');
    } else {
      throw new Error(error.message || 'Unknown compilation error');
    }
  }
};

export const downloadSingleFile = (file, filename) => {
  try {
    const blob = new Blob([file.content], { type: 'text/plain' });
    saveAs(blob, filename || file.path.split('/').pop());
    return true;
  } catch (error) {
    console.error('Single file download failed:', error);
    throw new Error('Failed to download file');
  }
};

const detectProjectLanguage = (files) => {
  if (!files || files.length === 0) return 'unknown';
  
  const extensions = files.map(file => {
    const parts = file.path.split('.');
    return parts.length > 1 ? parts.pop().toLowerCase() : '';
  }).filter(ext => ext);
  
  const extCounts = extensions.reduce((acc, ext) => {
    acc[ext] = (acc[ext] || 0) + 1;
    return acc;
  }, {});
  
  if (extCounts.java) return 'java';
  if (extCounts.cpp || extCounts.c || extCounts.cc) return 'cpp';
  if (extCounts.py) return 'python';
  if (extCounts.go) return 'go';
  if (extCounts.rs) return 'rust';
  if (extCounts.cs) return 'csharp';
  if (extCounts.js || extCounts.jsx) return 'javascript';
  if (extCounts.ts || extCounts.tsx) return 'typescript';
  if (extCounts.html || extCounts.css) return 'web';
  
  return 'web';
};

const getOutputExtension = (language) => {
  const extensionMap = {
    java: '.jar',
    cpp: '.exe',
    c: '.exe',
    python: '.exe',
    go: '.exe',
    rust: '.exe',
    csharp: '.exe',
    javascript: '.zip',
    typescript: '.zip',
    web: '.zip',
    unknown: '.zip'
  };
  
  return extensionMap[language] || '.zip';
};

export const createProjectStructure = (files) => {
  const structure = {};
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = structure;
    
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = file;
      } else {
        if (!current[part]) {
          current[part] = {};
        }
        current = current[part];
      }
    });
  });
  
  return structure;
};