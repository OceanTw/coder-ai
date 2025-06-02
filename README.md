# Coder.AI

A complete React application that allows users to interact with various AI models (Claude, Gemini, OpenAI) to generate code based on prompts. The generated code can be compiled and downloaded as executable files or source packages.

## Features

- **Multi-AI Support**: Integration with OpenAI, Claude (Anthropic), and Google Gemini
- **Code Generation**: Generate complete applications from natural language prompts
- **Multiple Languages**: Support for Java, C/C++, Python, Go, Rust, JavaScript, TypeScript, and web applications
- **Compilation**: Automatic compilation to executable formats (.jar, .exe, .zip)
- **Download Options**: Download source code or compiled applications
- **Clean UI**: Black and white themed interface with smooth animations
- **File Explorer**: Interactive file tree view of generated projects
- **Syntax Highlighting**: Code preview with language-specific highlighting

## Technology Stack

### Frontend
- React 18 with Hooks
- Framer Motion for animations
- Prism.js for syntax highlighting
- Axios for API communication
- JSZip and FileSaver for downloads

### Backend
- Node.js with Express
- AI service integrations (OpenAI, Claude, Gemini)
- Multi-language compilation support
- File management and temporary storage

## Setup Instructions

### Prerequisites
- Node.js 16+ and npm
- Java Development Kit (JDK) for Java compilation
- GCC/G++ for C/C++ compilation
- Python 3.x with PyInstaller for Python compilation
- Go compiler for Go projects
- Rust and Cargo for Rust projects

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-code-generator
```

2. Install dependencies:
```bash
npm install
```

3. Configure API keys by creating a `.env` file:
```env
OPENAI_API_KEY=your_openai_api_key
CLAUDE_API_KEY=your_claude_api_key
GEMINI_API_KEY=your_gemini_api_key
PORT=3001
REACT_APP_API_URL=http://localhost:3001
```

4. Configure AI models in `config.json`:
```json
{
  "models": [
    {
      "id": "gpt-4",
      "name": "GPT-4",
      "type": "openai",
      "model-name": "gpt-4"
    }
  ],
  "systemPrompt": "Your system prompt here..."
}
```

### Development

Run the development environment:
```bash
npm run dev
```

This starts both the React frontend (port 3000) and Express backend (port 3001).

### Production Build

1. Build the React application:
```bash
npm run build
```

2. Start the production server:
```bash
npm run server
```

## Usage

1. **Select AI Model**: Choose from available AI models (OpenAI, Claude, Gemini)
2. **Enter Prompt**: Describe the application you want to create
3. **Generate Code**: Click "Generate Code" to create your project
4. **Review Output**: Browse generated files in the file explorer
5. **Download**: Choose to download source code or compile to executable

### Example Prompts

- "Create a simple calculator web application with HTML, CSS, and JavaScript"
- "Build a Java console application that manages a library book system"
- "Generate a Python script that analyzes CSV data and creates visualizations"
- "Create a Go web server with REST API endpoints for user management"

## File Structure

```
ai-code-generator/
├── public/                 # Static files
├── src/                    # React frontend source
│   ├── components/         # React components
│   ├── services/          # API communication
│   ├── utils/             # Utility functions
│   ├── styles/            # CSS and animations
│   └── config/            # Configuration files
├── server/                # Express backend
│   ├── routes/            # API routes
│   ├── services/          # AI and compilation services
│   └── utils/             # Server utilities
├── config.json            # AI model configuration
└── package.json           # Dependencies and scripts
```

## API Endpoints

### AI Generation
- `POST /api/ai/generate` - Generate code using AI models
- `GET /api/ai/models` - Get available AI models
- `GET /api/ai/validate` - Validate API keys

### Compilation
- `POST /api/compile` - Compile generated code
- `GET /api/compile/languages` - Get supported languages
- `GET /api/compile/status/:jobId` - Get compilation status

### Downloads
- `POST /api/download/source` - Download source code as ZIP
- `POST /api/download/single` - Download single file

## Supported Languages and Output Formats

| Language   | Extensions      | Output Format | Description |
|------------|----------------|---------------|-------------|
| Java       | .java          | .jar          | Java Archive |
| C/C++      | .c, .cpp, .cc  | .exe          | Executable Binary |
| Python     | .py            | .exe/.zip     | Standalone Executable |
| Go         | .go            | .exe          | Go Binary |
| Rust       | .rs            | .exe          | Rust Binary |
| JavaScript | .js, .jsx      | .zip          | Web Package |
| TypeScript | .ts, .tsx      | .zip          | Compiled Web App |
| Web        | .html, .css    | .zip          | Web Package |

## Configuration

### AI Model Configuration

Edit `config.json` to add or modify AI models:

```json
{
  "models": [
    {
      "id": "unique-model-id",
      "name": "Display Name",
      "type": "openai|claude|gemini",
      "model-name": "actual-model-name"
    }
  ],
  "systemPrompt": "Instructions for the AI model..."
}
```

### Environment Variables

- `OPENAI_API_KEY`: OpenAI API key
- `CLAUDE_API_KEY`: Anthropic Claude API key  
- `GEMINI_API_KEY`: Google Gemini API key
- `PORT`: Server port (default: 3001)
- `REACT_APP_API_URL`: Frontend API URL

## Troubleshooting

### Common Issues

1. **Compilation Failures**: Ensure required compilers are installed and accessible in PATH
2. **API Timeouts**: Large projects may take time to generate; increase timeout values
3. **Missing Dependencies**: Install language-specific tools (JDK, GCC, Python, etc.)
4. **API Key Errors**: Verify API keys are correctly set in environment variables

### Logs

Server logs provide detailed information about compilation and AI generation processes.

## Security Considerations

- API keys are stored server-side only
- File uploads are validated and sanitized
- Temporary files are automatically cleaned up
- Input validation prevents path traversal attacks

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. See LICENSE file for details.

## Support

For issues and questions:
- Create an issue in the repository
- Check the troubleshooting section
- Review API documentation for the AI services

## Roadmap

- [ ] Docker containerization
- [ ] Additional language support
- [ ] Cloud compilation services
- [ ] Project templates
- [ ] Collaborative features
- [ ] Code optimization suggestions