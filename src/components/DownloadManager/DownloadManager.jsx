import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { downloadFiles, compileProject } from '../../services/downloadService';
import './DownloadManager.css';

const DownloadManager = ({ files, projectName }) => {
  const [isCompiling, setIsCompiling] = useState(false);
  const [compilationStatus, setCompilationStatus] = useState(null);

  const handleDownloadSource = async () => {
    try {
      await downloadFiles(files, projectName);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleCompileAndDownload = async () => {
    setIsCompiling(true);
    setCompilationStatus(null);
    
    try {
      const result = await compileProject(files, projectName);
      setCompilationStatus({ success: true, message: 'Compilation successful!' });
    } catch (error) {
      setCompilationStatus({ success: false, message: error.message });
    } finally {
      setIsCompiling(false);
    }
  };

  const getProjectLanguage = () => {
    if (!files || files.length === 0) return 'unknown';
    
    const extensions = files.map(file => file.path.split('.').pop().toLowerCase());
    
    if (extensions.includes('java')) return 'java';
    if (extensions.includes('cpp') || extensions.includes('c')) return 'cpp';
    if (extensions.includes('py')) return 'python';
    if (extensions.includes('go')) return 'go';
    if (extensions.includes('rs')) return 'rust';
    if (extensions.includes('js') || extensions.includes('jsx')) return 'javascript';
    if (extensions.includes('ts') || extensions.includes('tsx')) return 'typescript';
    
    return 'web';
  };

  const getCompileInfo = () => {
    const language = getProjectLanguage();
    
    const compileMap = {
      java: { output: '.jar', description: 'Java Archive' },
      cpp: { output: '.exe', description: 'Executable' },
      python: { output: '.exe', description: 'Standalone Executable' },
      go: { output: '.exe', description: 'Go Binary' },
      rust: { output: '.exe', description: 'Rust Binary' },
      javascript: { output: '.zip', description: 'Bundled Web App' },
      typescript: { output: '.zip', description: 'Compiled Web App' },
      web: { output: '.zip', description: 'Web Package' },
      unknown: { output: '.zip', description: 'Source Archive' }
    };
    
    return compileMap[language] || compileMap.unknown;
  };

  const compileInfo = getCompileInfo();
  const projectLanguage = getProjectLanguage();

  return (
    <motion.div 
      className="download-manager"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="download-header">
        <h3 className="download-title">📥 Download Options</h3>
        <div className="project-info">
          <span className="project-language">{projectLanguage}</span>
          <span className="file-count">{files?.length || 0} files</span>
        </div>
      </div>
      
      <div className="download-actions">
        <motion.button
          className="download-btn source-btn"
          onClick={handleDownloadSource}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!files || files.length === 0}
        >
          <span className="btn-icon">📁</span>
          <div className="btn-content">
            <span className="btn-title">Download Source</span>
            <span className="btn-subtitle">Get all source files as ZIP</span>
          </div>
        </motion.button>

        <motion.button
          className="download-btn compile-btn"
          onClick={handleCompileAndDownload}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          disabled={!files || files.length === 0 || isCompiling}
        >
          <span className="btn-icon">
            {isCompiling ? '⚙️' : '🔨'}
          </span>
          <div className="btn-content">
            <span className="btn-title">
              {isCompiling ? 'Compiling...' : `Compile & Download`}
            </span>
            <span className="btn-subtitle">
              {isCompiling ? 'Please wait...' : `Generate ${compileInfo.output} file`}
            </span>
          </div>
          {isCompiling && <div className="compile-spinner"></div>}
        </motion.button>
      </div>

      {compilationStatus && (
        <motion.div 
          className={`compilation-status ${compilationStatus.success ? 'success' : 'error'}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <span className="status-icon">
            {compilationStatus.success ? '✅' : '❌'}
          </span>
          <span className="status-message">{compilationStatus.message}</span>
        </motion.div>
      )}

      <div className="download-info">
        <div className="info-section">
          <h4 className="info-title">📋 What you'll get:</h4>
          <ul className="info-list">
            <li>Complete source code with proper file structure</li>
            <li>README.md with setup and usage instructions</li>
            <li>Build configuration files (if applicable)</li>
            <li>Dependencies and package files</li>
          </ul>
        </div>
        
        <div className="info-section">
          <h4 className="info-title">⚡ Compilation Info:</h4>
          <div className="compile-details">
            <div className="detail-row">
              <span className="detail-label">Language:</span>
              <span className="detail-value">{projectLanguage}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Output:</span>
              <span className="detail-value">{compileInfo.description}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Extension:</span>
              <span className="detail-value">{compileInfo.output}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default DownloadManager;