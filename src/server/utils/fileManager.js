const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');

class FileManager {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.maxFileSize = 50 * 1024 * 1024;
    this.maxFiles = 100;
    this.allowedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.md',
      '.java', '.cpp', '.c', '.cc', '.py', '.go', '.rs', '.php', '.rb',
      '.sql', '.sh', '.bash', '.yml', '.yaml', '.xml', '.txt'
    ];
  }

  async ensureDirectory(dirPath) {
    try {
      await fs.access(dirPath);
    } catch {
      await fs.mkdir(dirPath, { recursive: true });
    }
  }

  validateFiles(files) {
    const errors = [];

    if (!Array.isArray(files)) {
      errors.push('Files must be an array');
      return { valid: false, errors };
    }

    if (files.length === 0) {
      errors.push('At least one file is required');
      return { valid: false, errors };
    }

    if (files.length > this.maxFiles) {
      errors.push(`Too many files. Maximum allowed: ${this.maxFiles}`);
      return { valid: false, errors };
    }

    const seenPaths = new Set();

    files.forEach((file, index) => {
      if (!file.path) {
        errors.push(`File at index ${index} is missing path`);
        return;
      }

      if (!file.content && file.content !== '') {
        errors.push(`File ${file.path} is missing content`);
        return;
      }

      if (seenPaths.has(file.path)) {
        errors.push(`Duplicate file path: ${file.path}`);
        return;
      }
      seenPaths.add(file.path);

      if (file.path.includes('..') || file.path.startsWith('/')) {
        errors.push(`Invalid file path: ${file.path}`);
        return;
      }

      if (file.content.length > this.maxFileSize) {
        errors.push(`File ${file.path} is too large. Maximum size: ${this.maxFileSize / 1024 / 1024}MB`);
        return;
      }

      const ext = path.extname(file.path).toLowerCase();
      if (ext && !this.allowedExtensions.includes(ext)) {
        errors.push(`File extension not allowed: ${ext} in ${file.path}`);
        return;
      }

      if (!/^[a-zA-Z0-9._/-]+$/.test(file.path)) {
        errors.push(`File path contains invalid characters: ${file.path}`);
        return;
      }
    });

    return {
      valid: errors.length === 0,
      errors
    };
  }

  async writeFilesToDirectory(files, targetDir) {
    await this.ensureDirectory(targetDir);

    const validation = this.validateFiles(files);
    if (!validation.valid) {
      throw new Error(`File validation failed: ${validation.errors.join(', ')}`);
    }

    const writtenFiles = [];

    try {
      for (const file of files) {
        const filePath = path.join(targetDir, file.path);
        const fileDir = path.dirname(filePath);

        await this.ensureDirectory(fileDir);
        await fs.writeFile(filePath, file.content, 'utf8');
        
        writtenFiles.push(filePath);
      }

      return writtenFiles;

    } catch (error) {
      await this.cleanupFiles(writtenFiles);
      throw error;
    }
  }

  async cleanupFiles(filePaths) {
    for (const filePath of filePaths) {
      try {
        await fs.unlink(filePath);
      } catch (error) {
        console.warn(`Failed to cleanup file ${filePath}:`, error.message);
      }
    }
  }

  async cleanupDirectory(dirPath) {
    try {
      await fs.rm(dirPath, { recursive: true, force: true });
    } catch (error) {
      console.warn(`Failed to cleanup directory ${dirPath}:`, error.message);
    }
  }

  generateProjectId() {
    return crypto.randomBytes(16).toString('hex');
  }

  sanitizePath(inputPath) {
    return inputPath
      .replace(/[^a-zA-Z0-9._/-]/g, '_')
      .replace(/\.{2,}/g, '.')
      .replace(/\/{2,}/g, '/')
      .replace(/^\/+|\/+$/g, '');
  }

  async getDirectorySize(dirPath) {
    let totalSize = 0;

    try {
      const walk = async (currentDir) => {
        const entries = await fs.readdir(currentDir, { withFileTypes: true });
        
        for (const entry of entries) {
          const fullPath = path.join(currentDir, entry.name);
          
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (entry.isFile()) {
            const stats = await fs.stat(fullPath);
            totalSize += stats.size;
          }
        }
      };

      await walk(dirPath);
    } catch (error) {
      console.warn(`Failed to calculate directory size for ${dirPath}:`, error.message);
    }

    return totalSize;
  }

  async createFileIndex(files) {
    const index = {
      totalFiles: files.length,
      totalSize: files.reduce((sum, file) => sum + file.content.length, 0),
      languages: {},
      structure: {}
    };

    files.forEach(file => {
      const ext = path.extname(file.path).toLowerCase();
      const lang = this.getLanguageFromExtension(ext);
      
      index.languages[lang] = (index.languages[lang] || 0) + 1;

      const parts = file.path.split('/');
      let current = index.structure;
      
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = {
            type: 'file',
            size: file.content.length,
            language: lang
          };
        } else {
          if (!current[part]) {
            current[part] = { type: 'directory', children: {} };
          }
          current = current[part].children;
        }
      });
    });

    return index;
  }

  getLanguageFromExtension(ext) {
    const langMap = {
      '.js': 'javascript',
      '.jsx': 'javascript',
      '.ts': 'typescript',
      '.tsx': 'typescript',
      '.html': 'html',
      '.css': 'css',
      '.json': 'json',
      '.md': 'markdown',
      '.py': 'python',
      '.java': 'java',
      '.cpp': 'cpp',
      '.c': 'c',
      '.cc': 'cpp',
      '.go': 'go',
      '.rs': 'rust',
      '.php': 'php',
      '.rb': 'ruby',
      '.sql': 'sql',
      '.sh': 'bash',
      '.bash': 'bash',
      '.yml': 'yaml',
      '.yaml': 'yaml',
      '.xml': 'xml'
    };

    return langMap[ext] || 'text';
  }

  async scheduleCleanup(dirPath, delayMs = 60000) {
    setTimeout(async () => {
      await this.cleanupDirectory(dirPath);
    }, delayMs);
  }

  isValidFileName(filename) {
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])$/i;
    
    return !invalidChars.test(filename) && 
           !reservedNames.test(filename) && 
           filename.length > 0 && 
           filename.length <= 255;
  }

  async createReadme(projectName, files, language) {
    const languageInstructions = {
      java: `## Running the Application
\`\`\`bash
java -jar ${projectName}.jar
\`\`\``,
      cpp: `## Compilation
\`\`\`bash
g++ *.cpp -o ${projectName}
./${projectName}
\`\`\``,
      python: `## Running the Application
\`\`\`bash
python main.py
\`\`\``,
      go: `## Running the Application
\`\`\`bash
go run main.go
\`\`\``,
      rust: `## Building and Running
\`\`\`bash
cargo build --release
cargo run
\`\`\``,
      javascript: `## Installation and Running
\`\`\`bash
npm install
npm start
\`\`\``,
      web: `## Opening the Application
Open index.html in your web browser or serve with a local web server.`
    };

    const readme = `# ${projectName}

Generated by AI Code Generator

## Project Structure
${this.generateStructureMarkdown(files)}

${languageInstructions[language] || ''}

## Files Generated
- **Total Files:** ${files.length}
- **Languages:** ${Object.keys(this.createLanguageStats(files)).join(', ')}

## Support
This project was automatically generated. Please review and test the code before using in production.
`;

    return readme;
  }

  generateStructureMarkdown(files) {
    const structure = {};
    files.forEach(file => {
      const parts = file.path.split('/');
      let current = structure;
      parts.forEach((part, i) => {
        if (i === parts.length - 1) {
          current[part] = 'file';
        } else {
          current[part] = current[part] || {};
          current = current[part];
        }
      });
    });

    const formatStructure = (obj, indent = '') => {
      return Object.entries(obj)
        .map(([name, content]) => {
          if (content === 'file') {
            return `${indent}- ${name}`;
          } else {
            return `${indent}- ${name}/\n${formatStructure(content, indent + '  ')}`;
          }
        })
        .join('\n');
    };

    return formatStructure(structure);
  }

  createLanguageStats(files) {
    const stats = {};
    files.forEach(file => {
      const ext = path.extname(file.path).toLowerCase();
      const lang = this.getLanguageFromExtension(ext);
      stats[lang] = (stats[lang] || 0) + 1;
    });
    return stats;
  }
}

module.exports = new FileManager();