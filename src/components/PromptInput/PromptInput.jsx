import React, { useState } from 'react';
import { motion } from 'framer-motion';
import './PromptInput';

const PromptInput = ({ prompt, onPromptChange, onGenerate, isLoading, disabled }) => {
  const [isFocused, setIsFocused] = useState(false);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      onGenerate();
    }
  };

  return (
    <div className="prompt-input">
      <h3 className="input-title">Describe Your Project</h3>
      
      <div className={`textarea-container ${isFocused ? 'focused' : ''} ${disabled ? 'disabled' : ''}`}>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Describe the application you want to create. Be specific about features, functionality, and preferred programming language..."
          disabled={disabled}
          rows={8}
        />
        
        <div className="textarea-footer">
          <span className="helper-text">
            Press Ctrl+Enter to generate
          </span>
          <span className="char-count">
            {prompt.length} characters
          </span>
        </div>
      </div>

      <motion.button
        className={`generate-btn ${disabled || !prompt.trim() ? 'disabled' : ''}`}
        onClick={onGenerate}
        disabled={disabled || !prompt.trim() || isLoading}
        whileHover={!disabled && prompt.trim() ? { scale: 1.02 } : {}}
        whileTap={!disabled && prompt.trim() ? { scale: 0.98 } : {}}
      >
        {isLoading ? (
          <span className="loading-content">
            <span className="spinner"></span>
            Generating...
          </span>
        ) : (
          <span className="button-content">
            <span className="button-icon">✨</span>
            Generate Code
          </span>
        )}
      </motion.button>

      <div className="tips">
        <h4 className="tips-title">💡 Tips for better results:</h4>
        <ul className="tips-list">
          <li>Specify the programming language or framework</li>
          <li>Describe the main features and functionality</li>
          <li>Mention any specific libraries or dependencies</li>
          <li>Include UI/UX requirements if applicable</li>
        </ul>
      </div>
    </div>
  );
};

export default PromptInput;