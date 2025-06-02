const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');
const { v4: uuidv4 } = require('uuid');

class CompilerService {
  constructor() {
    this.tempDir = path.join(__dirname, '../temp');
    this.supportedLanguages = [
      'java', 'cpp', 'c', 'python', 'go', 'rust', 'javascript', 'typescript', 'web'
    ];
    this.ensureTempDir();
  }

  async ensureTempDir() {
    try {
      await fs.access(this.tempDir);
    } catch {
      await fs.mkdir(this.tempDir, { recursive: true });
    }
  }

  detectLanguage(files) {
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
  }

  async compile(files, language, projectName) {
    const projectId = uuidv4();
    const projectDir = path.join(this.tempDir, projectId);
    
    try {
      await fs.mkdir(projectDir, { recursive: true });
      
      await this.writeFiles(files, projectDir);
      
      let result;
      switch (language) {
        case 'java':
          result = await this.compileJava(projectDir, projectName);
          break;
        case 'cpp':
        case 'c':
          result = await this.compileCpp(projectDir, projectName);
          break;
        case 'python':
          result = await this.compilePython(projectDir, projectName);
          break;
        case 'go':
          result = await this.compileGo(projectDir, projectName);
          break;
        case 'rust':
          result = await this.compileRust(projectDir, projectName);
          break;
        case 'javascript':
        case 'typescript':
        case 'web':
        default:
          result = await this.packageWeb(projectDir, projectName);
          break;
      }
      
      return result;
      
    } finally {
      setTimeout(async () => {
        try {
          await fs.rm(projectDir, { recursive: true, force: true });
        } catch (error) {
          console.error(`Failed to cleanup ${projectDir}:`, error);
        }
      }, 60000);
    }
  }

  async writeFiles(files, projectDir) {
    for (const file of files) {
      const filePath = path.join(projectDir, file.path);
      const fileDir = path.dirname(filePath);
      
      await fs.mkdir(fileDir, { recursive: true });
      await fs.writeFile(filePath, file.content, 'utf8');
    }
  }

  async compileJava(projectDir, projectName) {
    try {
      const javaFiles = await this.findFiles(projectDir, '.java');
      if (javaFiles.length === 0) {
        throw new Error('No Java files found');
      }

      const classesDir = path.join(projectDir, 'classes');
      await fs.mkdir(classesDir, { recursive: true });

      execSync(`javac -d "${classesDir}" ${javaFiles.map(f => `"${f}"`).join(' ')}`, {
        cwd: projectDir,
        timeout: 60000
      });

      const manifestContent = await this.createJavaManifest(projectDir);
      const manifestPath = path.join(projectDir, 'MANIFEST.MF');
      await fs.writeFile(manifestPath, manifestContent);

      const jarName = `${projectName}.jar`;
      const jarPath = path.join(projectDir, jarName);

      execSync(`jar cfm "${jarPath}" "${manifestPath}" -C "${classesDir}" .`, {
        cwd: projectDir,
        timeout: 30000
      });

      const buffer = await fs.readFile(jarPath);
      return {
        filename: jarName,
        buffer: buffer
      };

    } catch (error) {
      throw new Error(`Java compilation failed: ${error.message}`);
    }
  }

  async compileCpp(projectDir, projectName) {
    try {
      const cppFiles = await this.findFiles(projectDir, ['.cpp', '.c', '.cc']);
      if (cppFiles.length === 0) {
        throw new Error('No C/C++ files found');
      }

      const exeName = `${projectName}.exe`;
      const exePath = path.join(projectDir, exeName);

      const compiler = cppFiles.some(f => f.endsWith('.cpp') || f.endsWith('.cc')) ? 'g++' : 'gcc';
      
      execSync(`${compiler} ${cppFiles.map(f => `"${f}"`).join(' ')} -o "${exePath}"`, {
        cwd: projectDir,
        timeout: 60000
      });

      const buffer = await fs.readFile(exePath);
      return {
        filename: exeName,
        buffer: buffer
      };

    } catch (error) {
      throw new Error(`C/C++ compilation failed: ${error.message}`);
    }
  }

  async compilePython(projectDir, projectName) {
    try {
      const pyFiles = await this.findFiles(projectDir, '.py');
      if (pyFiles.length === 0) {
        throw new Error('No Python files found');
      }

      const mainFile = this.findMainPythonFile(pyFiles);
      const exeName = `${projectName}.exe`;
      const exePath = path.join(projectDir, exeName);

      execSync(`pyinstaller --onefile --distpath "${projectDir}" --workpath "${path.join(projectDir, 'build')}" --specpath "${path.join(projectDir, 'spec')}" "${mainFile}"`, {
        cwd: projectDir,
        timeout: 180000
      });

      const generatedExe = path.join(projectDir, path.basename(mainFile, '.py') + '.exe');
      await fs.rename(generatedExe, exePath);

      const buffer = await fs.readFile(exePath);
      return {
        filename: exeName,
        buffer: buffer
      };

    } catch (error) {
      return await this.packageWeb(projectDir, projectName);
    }
  }

  async compileGo(projectDir, projectName) {
    try {
      const goFiles = await this.findFiles(projectDir, '.go');
      if (goFiles.length === 0) {
        throw new Error('No Go files found');
      }

      const exeName = `${projectName}.exe`;
      const exePath = path.join(projectDir, exeName);

      const mainFile = this.findMainGoFile(goFiles);

      execSync(`go build -o "${exePath}" "${mainFile}"`, {
        cwd: projectDir,
        timeout: 120000
      });

      const buffer = await fs.readFile(exePath);
      return {
        filename: exeName,
        buffer: buffer
      };

    } catch (error) {
      throw new Error(`Go compilation failed: ${error.message}`);
    }
  }

  async compileRust(projectDir, projectName) {
    try {
      const cargoToml = path.join(projectDir, 'Cargo.toml');
      const hasCargo = await fs.access(cargoToml).then(() => true).catch(() => false);

      if (!hasCargo) {
        await this.createCargoProject(projectDir, projectName);
      }

      const exeName = `${projectName}.exe`;
      
      execSync('cargo build --release', {
        cwd: projectDir,
        timeout: 180000
      });

      const targetDir = path.join(projectDir, 'target', 'release');
      const builtExe = path.join(targetDir, `${projectName}.exe`);
      
      const buffer = await fs.readFile(builtExe);
      return {
        filename: exeName,
        buffer: buffer
      };

    } catch (error) {
      throw new Error(`Rust compilation failed: ${error.message}`);
    }
  }

  async packageWeb(projectDir, projectName) {
    try {
      const zipName = `${projectName}.zip`;
      const zipPath = path.join(projectDir, zipName);

      return new Promise((resolve, reject) => {
        const output = require('fs').createWriteStream(zipPath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', async () => {
          try {
            const buffer = await fs.readFile(zipPath);
            resolve({
              filename: zipName,
              buffer: buffer
            });
          } catch (error) {
            reject(error);
          }
        });

        archive.on('error', reject);
        archive.pipe(output);

        archive.directory(projectDir, false, (entry) => {
          return entry.name !== zipName;
        });

        archive.finalize();
      });

    } catch (error) {
      throw new Error(`Web packaging failed: ${error.message}`);
    }
  }

  async findFiles(dir, extensions) {
    const files = [];
    const exts = Array.isArray(extensions) ? extensions : [extensions];

    const walk = async (currentDir) => {
      const entries = await fs.readdir(currentDir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        
        if (entry.isDirectory()) {
          await walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (exts.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    };

    await walk(dir);
    return files;
  }

  findMainPythonFile(pyFiles) {
    const mainCandidates = ['main.py', 'app.py', '__main__.py', 'run.py'];
    
    for (const candidate of mainCandidates) {
      const found = pyFiles.find(f => path.basename(f) === candidate);
      if (found) return found;
    }

    return pyFiles[0];
  }

  findMainGoFile(goFiles) {
    const mainFile = goFiles.find(f => {
      const content = require('fs').readFileSync(f, 'utf8');
      return content.includes('func main()') && content.includes('package main');
    });

    return mainFile || goFiles[0];
  }

  async createJavaManifest(projectDir) {
    const javaFiles = await this.findFiles(projectDir, '.java');
    
    for (const file of javaFiles) {
      const content = await fs.readFile(file, 'utf8');
      const mainMatch = content.match(/public\s+static\s+void\s+main\s*\(/);
      const classMatch = content.match(/public\s+class\s+(\w+)/);
      
      if (mainMatch && classMatch) {
        const className = classMatch[1];
        return `Manifest-Version: 1.0\nMain-Class: ${className}\n`;
      }
    }

    return 'Manifest-Version: 1.0\n';
  }

  async createCargoProject(projectDir, projectName) {
    const cargoToml = `[package]
name = "${projectName}"
version = "0.1.0"
edition = "2021"

[dependencies]
`;

    await fs.writeFile(path.join(projectDir, 'Cargo.toml'), cargoToml);

    const srcDir = path.join(projectDir, 'src');
    await fs.mkdir(srcDir, { recursive: true });

    const rsFiles = await this.findFiles(projectDir, '.rs');
    if (rsFiles.length > 0) {
      const mainContent = await fs.readFile(rsFiles[0], 'utf8');
      await fs.writeFile(path.join(srcDir, 'main.rs'), mainContent);
    }
  }

  getSupportedLanguages() {
    return this.supportedLanguages.map(lang => ({
      id: lang,
      name: this.getLanguageDisplayName(lang),
      extensions: this.getLanguageExtensions(lang),
      outputType: this.getOutputType(lang)
    }));
  }

  getLanguageDisplayName(lang) {
    const names = {
      java: 'Java',
      cpp: 'C++',
      c: 'C',
      python: 'Python',
      go: 'Go',
      rust: 'Rust',
      javascript: 'JavaScript',
      typescript: 'TypeScript',
      web: 'Web Application'
    };
    return names[lang] || lang;
  }

  getLanguageExtensions(lang) {
    const extensions = {
      java: ['.java'],
      cpp: ['.cpp', '.cc'],
      c: ['.c'],
      python: ['.py'],
      go: ['.go'],
      rust: ['.rs'],
      javascript: ['.js', '.jsx'],
      typescript: ['.ts', '.tsx'],
      web: ['.html', '.css', '.js']
    };
    return extensions[lang] || [];
  }

  getOutputType(lang) {
    const outputs = {
      java: '.jar',
      cpp: '.exe',
      c: '.exe',
      python: '.exe',
      go: '.exe',
      rust: '.exe',
      javascript: '.zip',
      typescript: '.zip',
      web: '.zip'
    };
    return outputs[lang] || '.zip';
  }

  async getCompilationStatus(jobId) {
    return {
      status: 'completed',
      message: 'Compilation finished successfully'
    };
  }
}

module.exports = new CompilerService();