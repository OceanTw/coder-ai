const axios = require('axios');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
  }

  async generateCode(model, systemPrompt, userPrompt) {
    if (!this.apiKey) {
      throw new Error('Gemini API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseURL}/models/${model}:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Request: ${userPrompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 4000
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const content = response.data.candidates[0].content.parts[0].text;
      
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
        throw new Error(`Gemini API error: ${error.response.data.error?.message || error.response.statusText}`);
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Gemini API timeout');
      } else {
        throw new Error(`Gemini service error: ${error.message}`);
      }
    }
  }

  async validateApiKey() {
    if (!this.apiKey) {
      return { valid: false, error: 'API key not configured' };
    }

    try {
      await axios.post(
        `${this.baseURL}/models/gemini-pro:generateContent?key=${this.apiKey}`,
        {
          contents: [
            {
              parts: [
                {
                  text: 'Hello'
                }
              ]
            }
          ],
          generationConfig: {
            maxOutputTokens: 10
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000
        }
      );

      return { valid: true };
    } catch (error) {
      return { 
        valid: false, 
        error: error.response?.data?.error?.message || 'Invalid API key' 
      };
    }
  }
}

module.exports = new GeminiService();