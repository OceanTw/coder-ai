export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const getLanguageFromExtension = (extension) => {
  const languageMap = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    html: 'html',
    css: 'css',
    json: 'json',
    md: 'markdown',
    py: 'python',
    java: 'java',
    cpp: 'cpp',
    c: 'c',
    go: 'go',
    rs: 'rust',
    php: 'php',
    rb: 'ruby',
    sql: 'sql',
    sh: 'bash',
    bash: 'bash',
    yml: 'yaml',
    yaml: 'yaml',
    xml: 'xml'
  };
  
  return languageMap[extension.toLowerCase()] || 'text';
};

export const sanitizeFilename = (filename) => {
  return filename.replace(/[^a-z0-9.-]/gi, '_').toLowerCase();
};

export const validateFileStructure = (files) => {
  const errors = [];
  const paths = new Set();
  
  files.forEach((file, index) => {
    if (!file.path) {
      errors.push(`File at index ${index} is missing path`);
    }
    
    if (!file.content && file.content !== '') {
      errors.push(`File ${file.path} is missing content`);
    }
    
    if (paths.has(file.path)) {
      errors.push(`Duplicate file path: ${file.path}`);
    }
    
    paths.add(file.path);
    
    if (file.path.includes('..')) {
      errors.push(`Invalid path (contains ..): ${file.path}`);
    }
    
    if (file.path.startsWith('/')) {
      errors.push(`Path should be relative: ${file.path}`);
    }
  });
  
  return {
    isValid: errors.length === 0,
    errors: errors
  };
};

export const createFileTree = (files) => {
  const tree = {};
  
  files.forEach(file => {
    const parts = file.path.split('/');
    let current = tree;
    
    parts.forEach((part, index) => {
      if (index === parts.length - 1) {
        current[part] = {
          type: 'file',
          ...file
        };
      } else {
        if (!current[part]) {
          current[part] = {
            type: 'directory',
            children: {}
          };
        }
        current = current[part].children || current[part];
      }
    });
  });
  
  return tree;
};

export const flattenFileTree = (tree, basePath = '') => {
  const files = [];
  
  Object.entries(tree).forEach(([name, node]) => {
    const fullPath = basePath ? `${basePath}/${name}` : name;
    
    if (node.type === 'file') {
      files.push({
        path: fullPath,
        content: node.content,
        language: node.language
      });
    } else if (node.type === 'directory' && node.children) {
      files.push(...flattenFileTree(node.children, fullPath));
    }
  });
  
  return files;
};

export const countFilesByType = (files) => {
  const counts = {};
  
  files.forEach(file => {
    const extension = getFileExtension(file.path);
    const language = getLanguageFromExtension(extension);
    counts[language] = (counts[language] || 0) + 1;
  });
  
  return counts;
};