import Anthropic from '@anthropic-ai/sdk';
import config from '../config/config.js';

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: config.anthropicApiKey,
});

class AIService {
  /**
   * Generate a completion using Claude
   * @param {string} systemPrompt - System instructions
   * @param {string} userPrompt - User message
   * @param {number} maxTokens - Max tokens to generate
   * @returns {Promise<string>} - AI response
   */
  async generateCompletion(systemPrompt, userPrompt, maxTokens = 2000) {
    try {
      const message = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [
          {
            role: 'user',
            content: userPrompt,
          },
        ],
      });

      // Extract text from response
      const response = message.content[0].text;
      return response;
    } catch (error) {
      console.error('Claude API Error:', error.message);
      throw new Error(`AI Service Error: ${error.message}`);
    }
  }

  /**
   * Generate structured JSON response
   * @param {string} systemPrompt - System instructions
   * @param {string} userPrompt - User message
   * @returns {Promise<object>} - Parsed JSON response
   */
  async generateStructuredResponse(systemPrompt, userPrompt) {
    try {
      // Add JSON formatting instruction
      const enhancedSystemPrompt = `${systemPrompt}\n\nIMPORTANT: You must respond ONLY with valid JSON. No markdown, no explanations, just pure JSON.`;

      const response = await this.generateCompletion(
        enhancedSystemPrompt,
        userPrompt,
        2000
      );

      // Clean response (remove markdown code blocks if present)
      let cleanedResponse = response.trim();
      if (cleanedResponse.startsWith('```json')) {
        cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      } else if (cleanedResponse.startsWith('```')) {
        cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
      }

      // Parse JSON
      const parsed = JSON.parse(cleanedResponse);
      return parsed;
    } catch (error) {
      console.error('Structured Response Error:', error.message);
      throw new Error(`Failed to generate structured response: ${error.message}`);
    }
  }

  /**
   * Test API connection
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      await this.generateCompletion(
        'You are a helpful assistant.',
        'Say "Connection successful!" and nothing else.',
        50
      );
      return true;
    } catch (error) {
      console.error('API Connection Test Failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;