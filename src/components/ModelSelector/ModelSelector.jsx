import React, { useState, useEffect } from 'react';
import './ModelSelector.css';

const ModelSelector = ({ selectedModel, onModelSelect }) => {
  const [models, setModels] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetch('/config.json')
      .then(res => res.json())
      .then(data => setModels(data.models))
      .catch(err => {
        console.error('Failed to load models:', err);
        setModels([
          {
            id: "gpt-4",
            name: "GPT-4",
            type: "openai",
            "model-name": "gpt-4"
          },
          {
            id: "claude-sonnet",
            name: "Claude Sonnet",
            type: "claude",
            "model-name": "claude-3-5-sonnet-20241022"
          },
          {
            id: "gemini-pro",
            name: "Gemini Pro",
            type: "gemini",
            "model-name": "gemini-pro"
          }
        ]);
      });
  }, []);

  const handleModelSelect = (model) => {
    onModelSelect(model);
    setIsOpen(false);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.dropdown-container');
      if (dropdown && !dropdown.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="model-selector">
      <h3 className="selector-title">Select AI Model</h3>
      
      <div className="dropdown-container">
        <button
          className={`dropdown-trigger ${isOpen ? 'open' : ''}`}
          onClick={toggleDropdown}
          type="button"
        >
          <span className="selected-model">
            {selectedModel ? selectedModel.name : 'Choose a model...'}
          </span>
          <span className={`dropdown-arrow ${isOpen ? 'rotated' : ''}`}>▼</span>
        </button>

        {isOpen && (
          <div className="dropdown-menu">
            {models.map((model) => (
              <button
                key={model.id}
                className={`dropdown-item ${selectedModel?.id === model.id ? 'selected' : ''}`}
                onClick={() => handleModelSelect(model)}
                type="button"
              >
                <div className="model-info">
                  <span className="model-name">{model.name}</span>
                  <span className="model-type">{model.type}</span>
                </div>
                {selectedModel?.id === model.id && (
                  <span className="check-icon">✓</span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedModel && (
        <div className="selected-model-info">
          <div className="model-details">
            <span className="detail-label">Model:</span>
            <span className="detail-value">{selectedModel['model-name']}</span>
          </div>
          <div className="model-details">
            <span className="detail-label">Provider:</span>
            <span className="detail-value">{selectedModel.type}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelSelector;