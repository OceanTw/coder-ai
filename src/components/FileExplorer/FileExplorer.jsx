import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FileExplorer.css';

const FileExplorer = ({ files }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [expandedFolders, setExpandedFolders] = useState(new Set());

  const buildFileTree = (files) => {
    const tree = {};
    
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = tree;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = index === parts.length - 1 ? file : {};
        }
        current = current[part];
      });
    });
    
    return tree;
  };

  const toggleFolder = (folderPath) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderPath)) {
      newExpanded.delete(folderPath);
    } else {
      newExpanded.add(folderPath);
    }
    setExpandedFolders(newExpanded);
  };

  const getFileIcon = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
      js: '📄',
      jsx: '⚛️',
      ts: '📘',
      tsx: '⚛️',
      html: '🌐',
      css: '🎨',
      json: '📋',
      md: '📝',
      py: '🐍',
      java: '☕',
      cpp: '⚙️',
      c: '⚙️',
      go: '🔵',
      rs: '🦀',
      php: '🐘',
      rb: '💎',
      sql: '🗄️',
      sh: '🐚',
      yml: '⚙️',
      yaml: '⚙️',
      xml: '📄',
      png: '🖼️',
      jpg: '🖼️',
      jpeg: '🖼️',
      gif: '🖼️',
      svg: '🎨',
      ico: '🖼️'
    };
    return iconMap[ext] || '📄';
  };

  const renderTree = (tree, path = '') => {
    return Object.entries(tree).map(([name, content]) => {
      const fullPath = path ? `${path}/${name}` : name;
      const isFile = content.path !== undefined;
      
      if (isFile) {
        return (
          <motion.div
            key={fullPath}
            className={`file-item ${selectedFile?.path === content.path ? 'selected' : ''}`}
            onClick={() => setSelectedFile(content)}
            whileHover={{ backgroundColor: 'var(--hover-bg)' }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="file-icon">{getFileIcon(name)}</span>
            <span className="file-name">{name}</span>
          </motion.div>
        );
      } else {
        const isExpanded = expandedFolders.has(fullPath);
        return (
          <div key={fullPath} className="folder-item">
            <motion.div
              className="folder-header"
              onClick={() => toggleFolder(fullPath)}
              whileHover={{ backgroundColor: 'var(--hover-bg)' }}
              whileTap={{ scale: 0.98 }}
            >
              <span className={`folder-arrow ${isExpanded ? 'expanded' : ''}`}>▶</span>
              <span className="folder-icon">📁</span>
              <span className="folder-name">{name}</span>
            </motion.div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  className="folder-content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderTree(content, fullPath)}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      }
    });
  };

  const fileTree = buildFileTree(files || []);

  return (
    <div className="file-explorer">
      <div className="explorer-header">
        <h3 className="explorer-title">📁 Project Files</h3>
        <span className="file-count">{files?.length || 0} files</span>
      </div>
      
      <div className="explorer-content">
        {files && files.length > 0 ? (
          renderTree(fileTree)
        ) : (
          <div className="empty-state">
            <span className="empty-icon">📂</span>
            <p className="empty-text">No files generated yet</p>
          </div>
        )}
      </div>
      
      {selectedFile && (
        <motion.div 
          className="file-preview"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="preview-header">
            <span className="preview-icon">{getFileIcon(selectedFile.path)}</span>
            <span className="preview-title">{selectedFile.path}</span>
          </div>
          <div className="preview-meta">
            <span className="meta-item">
              Language: {selectedFile.language || 'text'}
            </span>
            <span className="meta-item">
              Size: {selectedFile.content?.length || 0} chars
            </span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FileExplorer;