import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header/Header';
import ModelSelector from './components/ModelSelector/ModelSelector';
import PromptInput from './components/PromptInput/PromptInput';
import CodeOutput from './components/CodeOutput/CodeOutput';
import FileExplorer from './components/FileExplorer/FileExplorer';
import LoadingSpinner from './components/LoadingSpinner/LoadingSpinner';
import DownloadManager from './components/DownloadManager/DownloadManager';
import { generateCode } from './services/aiService';
import './styles/App.css';

function App() {
  const [selectedModel, setSelectedModel] = useState(null);
  const [prompt, setPrompt] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async () => {
    if (!selectedModel || !prompt.trim()) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateCode(selectedModel, prompt);
      setGeneratedCode(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="App">
      <Header />
      
      <motion.main 
        className="main-content"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="container">
          <div className="input-section">
            <ModelSelector 
              selectedModel={selectedModel}
              onModelSelect={setSelectedModel}
            />
            
            <PromptInput 
              prompt={prompt}
              onPromptChange={setPrompt}
              onGenerate={handleGenerate}
              isLoading={isLoading}
              disabled={!selectedModel}
            />
          </div>

          {error && (
            <motion.div 
              className="error-message"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              {error}
            </motion.div>
          )}

          {isLoading && <LoadingSpinner />}

          {generatedCode && (
            <motion.div 
              className="output-section"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="output-grid">
                <FileExplorer files={generatedCode.files} />
                <CodeOutput code={generatedCode} />
              </div>
              
              <DownloadManager 
                files={generatedCode.files}
                projectName={generatedCode.description || 'generated-project'}
              />
            </motion.div>
          )}
        </div>
      </motion.main>
    </div>
  );
}

export default App;