const axios = require('axios');

class ClaudeService {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.baseURL = 'https://api.anthropic.com/v1';
  }

  async generateCode(model, systemPrompt, userPrompt) {
    if (!this.apiKey) {
      throw new Error('Claude API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/messages`, {
        model: model,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });

      const content = response.data.content[0].text;
      
      try {
        return JSON.parse(content);
      } catch (parseError) {
        const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[1]);
        }
        
        throw new Error('Response is not valid JSON format');
      }

    } catch (error) {
      if (error.response) {
        throw new Error(`Claude API error: ${error.response.data.error?.message || error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Claude API timeout');
      } else {
        throw new Error(`Claude service error: ${error.message}`);
      }
    }
  }

  async validateApiKey() {
    if (!this.apiKey) {
      return { valid: false, error: 'API key not configured' };
    }

    try {
      await axios.post(`${this.baseURL}/messages`, {
        model: 'claude-3-haiku-20240307',
        messages: [
          {
            role: 'user',
            content: 'Hello'
          }
        ],
        max_tokens: 10
      }, {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json'
        },
        timeout: 10000
      });

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.response?.data?.error?.message || 'Invalid API key' 
      };
    }
  }
}

module.exports = new ClaudeService();