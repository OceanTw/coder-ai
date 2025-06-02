import React from 'react';
import { motion } from 'framer-motion';
import './Header.css';

const Header = () => {
  return (
    <motion.header 
      className="header"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container">
        <div className="header-content">
          <motion.div 
            className="logo"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="logo-icon">⚡</span>
            <span className="logo-text">Coder.AI</span>
          </motion.div>
          
          <nav className="nav">
            <motion.a 
              href="#features" 
              className="nav-link"
              whileHover={{ color: '#ffffff' }}
            >
              Features
            </motion.a>
            <motion.a 
              href="#models" 
              className="nav-link"
              whileHover={{ color: '#ffffff' }}
            >
              Models
            </motion.a>
            <motion.a 
              href="#docs" 
              className="nav-link"
              whileHover={{ color: '#ffffff' }}
            >
              Docs
            </motion.a>
          </nav>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;