import aiService from './ai.service.js';
import config from '../config/config.js';

class ClassificationService {
  /**
   * Classify a customer lead based on form responses
   * @param {object} customerData - Customer submission data
   * @param {object} formData - Form configuration
   * @param {object} userData - Business owner data
   * @returns {Promise<object>} - Classification result
   */
  async classifyLead(customerData, formData, userData) {
    try {
      // Build system prompt
      const systemPrompt = this.buildSystemPrompt(userData, formData);

      // Build user prompt with customer data
      const userPrompt = this.buildUserPrompt(customerData, formData);

      // Get AI classification
      const aiResponse = await aiService.generateStructuredResponse(
        systemPrompt,
        userPrompt
      );

      // Validate and normalize response
      const classification = this.normalizeClassification(aiResponse);

      return classification;
    } catch (error) {
      console.error('Classification Error:', error.message);
      throw new Error(`Failed to classify lead: ${error.message}`);
    }
  }

  /**
   * Build system prompt for classification
   * @private
   */
  buildSystemPrompt(userData, formData) {
    const { businessName, businessDescription, industry } = userData;
    const { classificationCriteria } = formData;

    return `You are an expert lead qualification assistant for ${businessName}, a business in the ${industry || 'various'} industry.

Business Context:
${businessDescription || 'No additional context provided'}

Your task is to analyze customer form submissions and classify them as HOT, NORMAL, or COLD leads.

Classification Criteria:

HOT LEADS - High Priority (Score: 0.7-1.0):
${classificationCriteria?.hotLeadIndicators?.length > 0 
  ? classificationCriteria.hotLeadIndicators.map(i => `- ${i}`).join('\n')
  : `- High budget/purchasing power
- Immediate timeline (within 1-4 weeks)
- Decision-making authority
- Clear, urgent pain points
- Strong product/service fit`}

NORMAL LEADS - Medium Priority (Score: 0.3-0.7):
${classificationCriteria?.normalLeadIndicators?.length > 0
  ? classificationCriteria.normalLeadIndicators.map(i => `- ${i}`).join('\n')
  : `- Moderate budget
- Short to medium timeline (1-3 months)
- Some influence in decision
- Defined needs but not urgent
- Good product/service fit`}

COLD LEADS - Low Priority (Score: 0-0.3):
${classificationCriteria?.coldLeadIndicators?.length > 0
  ? classificationCriteria.coldLeadIndicators.map(i => `- ${i}`).join('\n')
  : `- Limited budget or unspecified
- Long timeline (3+ months) or just browsing
- No decision-making power
- Vague or unclear needs
- Weak product/service fit`}

Response Format (JSON only):
{
  "classification": "hot" | "normal" | "cold",
  "confidenceScore": 0.0-1.0,
  "reasoning": "Brief explanation of classification",
  "insights": {
    "budget": "high" | "medium" | "low" | "unknown",
    "timeline": "immediate" | "short-term" | "long-term" | "unknown",
    "decisionMaker": true | false,
    "painPoints": ["pain point 1", "pain point 2"],
    "interests": ["interest 1", "interest 2"],
    "urgency": "immediate" | "short-term" | "long-term" | "unknown"
  },
  "keyFactors": ["factor 1", "factor 2", "factor 3"]
}`;
  }

  /**
   * Build user prompt with customer data
   * @private
   */
  buildUserPrompt(customerData, formData) {
    // Convert responses Map to object
    const responses = customerData.getResponsesObject 
      ? customerData.getResponsesObject()
      : Object.fromEntries(customerData.responses || []);

    // Build formatted response string
    let formattedResponses = 'Customer Form Responses:\n\n';
    
    formData.fields.forEach((field) => {
      const value = responses[field.label] || 'Not provided';
      const weight = field.classificationWeight || 'medium';
      formattedResponses += `${field.label} [Weight: ${weight}]:\n${value}\n\n`;
    });

    return `${formattedResponses}

Please analyze these responses and provide a classification with detailed insights.`;
  }

  /**
   * Normalize and validate AI response
   * @private
   */
  normalizeClassification(aiResponse) {
    // Ensure classification is valid
    const validClassifications = ['hot', 'normal', 'cold'];
    if (!validClassifications.includes(aiResponse.classification)) {
      aiResponse.classification = 'normal';
    }

    // Ensure confidence score is between 0 and 1
    aiResponse.confidenceScore = Math.max(0, Math.min(1, aiResponse.confidenceScore || 0.5));

    // Map confidence to classification if mismatch
    const thresholds = config.leadThresholds;
    if (aiResponse.confidenceScore >= thresholds.hot) {
      aiResponse.classification = 'hot';
    } else if (aiResponse.confidenceScore <= thresholds.cold) {
      aiResponse.classification = 'cold';
    } else {
      aiResponse.classification = 'normal';
    }

    // Ensure insights exist
    if (!aiResponse.insights) {
      aiResponse.insights = {
        budget: 'unknown',
        timeline: 'unknown',
        decisionMaker: false,
        painPoints: [],
        interests: [],
        urgency: 'unknown',
      };
    }

    // Ensure reasoning exists
    if (!aiResponse.reasoning) {
      aiResponse.reasoning = 'Lead classified based on form responses';
    }

    return aiResponse;
  }

  /**
   * Re-classify an existing lead (for manual review)
   * @param {object} leadData - Existing lead data
   * @param {object} customerData - Customer data
   * @param {object} formData - Form data
   * @param {object} userData - User data
   * @returns {Promise<object>} - New classification
   */
  async reclassifyLead(leadData, customerData, formData, userData) {
    return await this.classifyLead(customerData, formData, userData);
  }
}

// Export singleton instance
const classificationService = new ClassificationService();
export default classificationService;