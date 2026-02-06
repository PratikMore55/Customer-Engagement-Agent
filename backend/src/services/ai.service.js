// Mock AI Service - Simulates Claude API responses for free development
// This file should be saved as ai.service.js (NOT ai.service.mock.js)

class MockAIService {
  constructor() {
    console.log('🎭 Mock AI Service initialized (No API key required)');
  }

  /**
   * Simulate AI completion with realistic delay
   */
  async generateCompletion(systemPrompt, userPrompt, maxTokens = 2000) {
    // Simulate API delay
    await this.simulateDelay(800, 1500);

    // Simple text responses based on prompt content
    if (userPrompt.includes('Connection successful')) {
      return 'Connection successful!';
    }

    // Default response
    return 'This is a simulated AI response. The mock AI service is working correctly.';
  }

  /**
   * Generate structured JSON response (mock)
   */
  async generateStructuredResponse(systemPrompt, userPrompt) {
    // Simulate API delay
    await this.simulateDelay(1000, 2000);

    // Check if this is a classification request
    if (systemPrompt.includes('lead qualification') || systemPrompt.includes('classify')) {
      return this.generateMockClassification(userPrompt);
    }

    // Check if this is an email generation request
    if (systemPrompt.includes('email') || systemPrompt.includes('personalized')) {
      return this.generateMockEmail(userPrompt);
    }

    // Default structured response
    return {
      message: 'Mock structured response',
      success: true,
    };
  }

  /**
   * Generate mock lead classification
   */
  generateMockClassification(userPrompt) {
    // Extract some info from the prompt to make it more realistic
    const lowerPrompt = userPrompt.toLowerCase();
    const hasBudgetMention = lowerPrompt.includes('budget');
    const hasUrgentMention = lowerPrompt.includes('urgent') || 
                            lowerPrompt.includes('immediate') ||
                            lowerPrompt.includes('asap');
    const hasTimelineMention = lowerPrompt.includes('timeline') ||
                              lowerPrompt.includes('when');

    // Randomly determine classification with some logic
    let classification = 'normal';
    let confidenceScore = 0.5;
    let budget = 'unknown';
    let timeline = 'unknown';
    let urgency = 'unknown';

    // Determine classification based on keywords
    if (hasUrgentMention && hasBudgetMention) {
      classification = 'hot';
      confidenceScore = Math.random() * 0.2 + 0.8; // 0.8-1.0
      budget = 'high';
      timeline = 'immediate';
      urgency = 'immediate';
    } else if (hasUrgentMention || (hasBudgetMention && hasTimelineMention)) {
      classification = Math.random() > 0.5 ? 'hot' : 'normal';
      confidenceScore = Math.random() * 0.3 + 0.5; // 0.5-0.8
      budget = 'medium';
      timeline = 'short-term';
      urgency = 'short-term';
    } else if (Math.random() > 0.7) {
      classification = 'cold';
      confidenceScore = Math.random() * 0.3; // 0.0-0.3
      budget = 'low';
      timeline = 'long-term';
      urgency = 'long-term';
    } else {
      confidenceScore = Math.random() * 0.4 + 0.3; // 0.3-0.7
      budget = Math.random() > 0.5 ? 'medium' : 'unknown';
      timeline = Math.random() > 0.5 ? 'short-term' : 'unknown';
      urgency = 'short-term';
    }

    return {
      classification,
      confidenceScore: parseFloat(confidenceScore.toFixed(2)),
      reasoning: `Mock AI Analysis: Lead classified as ${classification.toUpperCase()} based on form responses. ${
        classification === 'hot' 
          ? 'Shows strong buying signals with clear timeline and budget.'
          : classification === 'normal'
          ? 'Demonstrates moderate interest with some qualification criteria met.'
          : 'Appears to be in early research phase with limited qualification signals.'
      }`,
      insights: {
        budget,
        timeline,
        decisionMaker: Math.random() > 0.5,
        painPoints: [
          'Looking for solution to current challenges',
          'Wants to improve efficiency',
        ],
        interests: [
          'Product features',
          'Pricing information',
        ],
        urgency,
      },
      keyFactors: [
        'Response completeness',
        'Timeline indication',
        'Budget signals',
      ],
    };
  }

  /**
   * Generate mock email
   */
  generateMockEmail(userPrompt) {
    // Determine email type from prompt
    const isHot = userPrompt.toLowerCase().includes('hot');
    const isCold = userPrompt.toLowerCase().includes('cold');
    
    let subject, body;

    if (isHot) {
      subject = "Let's Schedule Your Demo - Excited to Help!";
      body = `<p>Hi there!</p>

<p>Thank you so much for reaching out! Based on your responses, it sounds like we could be a great fit for your needs.</p>

<p>I'd love to schedule a quick 15-minute call to discuss how we can help you achieve your goals. I have availability this week:</p>

<ul>
  <li>Tomorrow at 2 PM</li>
  <li>Thursday at 10 AM</li>
  <li>Friday at 3 PM</li>
</ul>

<p><strong>Does any of these times work for you?</strong></p>

<p>Looking forward to connecting soon!</p>

<p>Best regards,<br>
Your Business Team</p>`;
    } else if (isCold) {
      subject = "Thanks for Your Interest - Here's What We Offer";
      body = `<p>Hi there!</p>

<p>Thanks for taking the time to fill out our form. We appreciate your interest!</p>

<p>I wanted to share some helpful resources that might be valuable for you:</p>

<ul>
  <li>Our complete guide to getting started</li>
  <li>Customer success stories</li>
  <li>FAQ and support documentation</li>
</ul>

<p>Feel free to explore at your own pace. If you have any questions, I'm here to help!</p>

<p>Best regards,<br>
Your Business Team</p>`;
    } else {
      // Normal lead
      subject = "Thanks for Reaching Out - Let's Connect";
      body = `<p>Hi there!</p>

<p>Thank you for your interest! I reviewed your responses and think we can definitely help.</p>

<p>I'd love to learn more about your specific needs and see how we can provide value. Would you be open to a brief conversation sometime this week?</p>

<p>In the meantime, here are some resources you might find helpful:</p>

<ul>
  <li>Product overview</li>
  <li>Case studies</li>
  <li>Pricing guide</li>
</ul>

<p>Looking forward to hearing from you!</p>

<p>Best regards,<br>
Your Business Team</p>`;
    }

    return { subject, body };
  }

  /**
   * Simulate network delay
   */
  async simulateDelay(min = 500, max = 1500) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
  }

  /**
   * Test connection (always succeeds in mock)
   */
  async testConnection() {
    await this.simulateDelay(300, 600);
    console.log('✅ Mock AI connection test: SUCCESS');
    return true;
  }
}

// Export singleton instance
const aiService = new MockAIService();
export default aiService;