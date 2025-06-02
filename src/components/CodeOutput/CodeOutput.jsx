import React, { useState, useEffect } from 'react';
import Prism from 'prismjs';

// Import the dark theme
import 'prismjs/themes/prism-dark.css';

import 'prismjs/components/prism-markup'; 
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-java';
import 'prismjs/components/prism-c';
import 'prismjs/components/prism-cpp';
import 'prismjs/components/prism-go';
import 'prismjs/components/prism-rust';
import 'prismjs/components/prism-php';
import 'prismjs/components/prism-ruby';
import 'prismjs/components/prism-sql';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-yaml';

import './CodeOutput.css';

const CodeOutput = ({ code }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (code?.files && code.files.length > 0) {
      setSelectedFile(code.files[0]);
    }
  }, [code]);

  useEffect(() => {
    // Highlight code after component updates
    const timer = setTimeout(() => {
      Prism.highlightAll();
    }, 100);

    return () => clearTimeout(timer);
  }, [selectedFile]);

  const getLanguageClass = (language) => {
    const langMap = {
      javascript: 'language-javascript',
      js: 'language-javascript',
      typescript: 'language-typescript',
      ts: 'language-typescript',
      jsx: 'language-jsx',
      tsx: 'language-jsx',
      html: 'language-markup', // Prism uses 'markup' for HTML
      css: 'language-css',
      json: 'language-json',
      python: 'language-python',
      py: 'language-python',
      java: 'language-java',
      cpp: 'language-cpp',
      'c++': 'language-cpp',
      c: 'language-c',
      go: 'language-go',
      rust: 'language-rust',
      rs: 'language-rust',
      php: 'language-php',
      ruby: 'language-ruby',
      rb: 'language-ruby',
      sql: 'language-sql',
      bash: 'language-bash',
      shell: 'language-bash',
      sh: 'language-bash',
      markdown: 'language-markdown',
      md: 'language-markdown',
      yaml: 'language-yaml',
      yml: 'language-yaml',
      xml: 'language-markup'
    };
    return langMap[language?.toLowerCase()] || 'language-text';
  };

  const copyToClipboard = async () => {
    if (!selectedFile) return;
    
    try {
      await navigator.clipboard.writeText(selectedFile.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = selectedFile.content;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackErr) {
        console.error('Fallback copy failed:', fallbackErr);
      }
      document.body.removeChild(textArea);
    }
  };

  const getLineNumbers = (content) => {
    return content.split('\n').length;
  };

  const detectLanguageFromPath = (path) => {
    const ext = path.split('.').pop()?.toLowerCase();
    const extMap = {
      js: 'javascript',
      jsx: 'jsx',
      ts: 'typescript',
      tsx: 'tsx',
      html: 'html',
      css: 'css',
      json: 'json',
      py: 'python',
      java: 'java',
      cpp: 'cpp',
      cc: 'cpp',
      c: 'c',
      go: 'go',
      rs: 'rust',
      php: 'php',
      rb: 'ruby',
      sql: 'sql',
      sh: 'bash',
      bash: 'bash',
      md: 'markdown',
      yml: 'yaml',
      yaml: 'yaml',
      xml: 'xml'
    };
    return extMap[ext] || 'text';
  };

  if (!code || !code.files || code.files.length === 0) {
    return (
      <div className="code-output">
        <div className="empty-output">
          <span className="empty-icon">💻</span>
          <p className="empty-text">Generated code will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="code-output">
      <div className="output-header">
        <div className="file-tabs">
          {code.files.slice(0, 5).map((file, index) => {
            const detectedLang = file.language || detectLanguageFromPath(file.path);
            return (
              <button
                key={file.path}
                className={`file-tab ${selectedFile?.path === file.path ? 'active' : ''}`}
                onClick={() => setSelectedFile(file)}
              >
                <span className="tab-name">{file.path.split('/').pop()}</span>
                {detectedLang && detectedLang !== 'text' && (
                  <span className="tab-language">{detectedLang}</span>
                )}
              </button>
            );
          })}
          {code.files.length > 5 && (
            <span className="more-files">+{code.files.length - 5} more</span>
          )}
        </div>
        
        <div className="output-actions">
          <button
            className="action-btn copy-btn"
            onClick={copyToClipboard}
          >
            {copied ? '✓ Copied' : '📋 Copy'}
          </button>
        </div>
      </div>

      {selectedFile && (
        <div className="code-container">
          <div className="code-header">
            <div className="file-info">
              <span className="file-path">{selectedFile.path}</span>
              <span className="file-stats">
                {getLineNumbers(selectedFile.content)} lines • {selectedFile.content.length} chars
              </span>
            </div>
          </div>
          
          <div className="code-content">
            <pre className="line-numbers">
              {selectedFile.content.split('\n').map((_, index) => (
                <span key={index} className="line-number">
                  {index + 1}
                </span>
              ))}
            </pre>
            
            <div className="code-wrapper">
              <pre className="code-block">
                <code className={getLanguageClass(selectedFile.language || detectLanguageFromPath(selectedFile.path))}>
                  {selectedFile.content}
                </code>
              </pre>
            </div>
          </div>
        </div>
      )}

      {code.description && (
        <div className="project-description">
          <h4 className="description-title">📋 Project Description</h4>
          <p className="description-text">{code.description}</p>
        </div>
      )}

      {code.buildInstructions && (
        <div className="build-instructions">
          <h4 className="instructions-title">🔨 Build Instructions</h4>
          <pre className="instructions-code">{code.buildInstructions}</pre>
        </div>
      )}
    </div>
  );
};

export default CodeOutput;