const axios = require('axios');

class OpenAIService {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async generateCode(model, systemPrompt, userPrompt) {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not configured');
    }

    try {
      const response = await axios.post(`${this.baseURL}/chat/completions`, {
        model: model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4000
      }, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 120000
      });

      const content = response.data.choices[0].message.content;
      
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
        throw new Error(`OpenAI API error: ${error.response.data.error?.message || error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('OpenAI API timeout');
      } else {
        throw new Error(`OpenAI service error: ${error.message}`);
      }
    }
  }

  async validateApiKey() {
    if (!this.apiKey) {
      return { valid: false, error: 'API key not configured' };
    }

    try {
      await axios.get(`${this.baseURL}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
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

module.exports = new OpenAIService();