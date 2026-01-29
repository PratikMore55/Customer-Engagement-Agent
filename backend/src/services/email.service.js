import nodemailer from 'nodemailer';
import aiService from './ai.service.js';
import config from '../config/config.js';

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  /**
   * Initialize email transporter
   * @private
   */
  initializeTransporter() {
    try {
      this.transporter = nodemailer.createTransport({
        host: config.email.host,
        port: config.email.port,
        secure: false, // true for 465, false for other ports
        auth: {
          user: config.email.user,
          pass: config.email.password,
        },
      });

      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Email service initialization failed:', error.message);
    }
  }

  /**
   * Generate personalized email content using AI
   * @param {object} leadData - Lead classification data
   * @param {object} customerData - Customer submission data
   * @param {object} formData - Form data
   * @param {object} userData - Business owner data
   * @returns {Promise<object>} - Email subject and body
   */
  async generatePersonalizedEmail(leadData, customerData, formData, userData) {
    try {
      // Check if custom template exists
      const customTemplate = this.getCustomTemplate(formData, leadData.classification);
      
      if (customTemplate) {
        // Use custom template with variable replacement
        return this.processCustomTemplate(customTemplate, leadData, customerData, userData);
      }

      // Generate AI-powered email
      const systemPrompt = this.buildEmailSystemPrompt(userData, leadData.classification);
      const userPrompt = this.buildEmailUserPrompt(leadData, customerData, formData);

      const emailContent = await aiService.generateStructuredResponse(
        systemPrompt,
        userPrompt
      );

      return {
        subject: emailContent.subject,
        body: emailContent.body,
      };
    } catch (error) {
      console.error('Email Generation Error:', error.message);
      throw new Error(`Failed to generate email: ${error.message}`);
    }
  }

  /**
   * Build system prompt for email generation
   * @private
   */
  buildEmailSystemPrompt(userData, classification) {
    const { businessName, businessDescription } = userData;
    
    const toneGuidelines = {
      hot: 'enthusiastic, direct, action-oriented with a sense of urgency',
      normal: 'friendly, informative, helpful without being pushy',
      cold: 'educational, nurturing, value-focused without pressure',
    };

    return `You are writing a personalized email on behalf of ${businessName}.

Business Context:
${businessDescription || 'Professional service provider'}

Lead Classification: ${classification.toUpperCase()}
Email Tone: ${toneGuidelines[classification]}

Email Guidelines:
- Keep it concise (150-250 words)
- Personalize based on their specific responses
- ${classification === 'hot' ? 'Include clear call-to-action (schedule call, book demo, etc.)' : ''}
- ${classification === 'normal' ? 'Provide helpful information and soft call-to-action' : ''}
- ${classification === 'cold' ? 'Focus on education and building trust, gentle nurture approach' : ''}
- Use a conversational, professional tone
- Address their specific pain points or interests
- Make it feel human, not robotic
- Include relevant next steps

Response Format (JSON only):
{
  "subject": "Email subject line (under 60 chars)",
  "body": "Email body in HTML format with proper formatting"
}`;
  }

  /**
   * Build user prompt for email generation
   * @private
   */
  buildEmailUserPrompt(leadData, customerData, formData) {
    const responses = customerData.getResponsesObject 
      ? customerData.getResponsesObject()
      : Object.fromEntries(customerData.responses || []);

    return `Lead Information:
- Classification: ${leadData.classification.toUpperCase()}
- Confidence Score: ${leadData.confidenceScore}
- Key Insights: ${JSON.stringify(leadData.insights, null, 2)}
- Reasoning: ${leadData.reasoning}

Customer Responses:
${JSON.stringify(responses, null, 2)}

Generate a personalized email for this lead.`;
  }

  /**
   * Get custom email template from form settings
   * @private
   */
  getCustomTemplate(formData, classification) {
    if (!formData.emailSettings) return null;

    const templateField = `${classification}LeadTemplate`;
    return formData.emailSettings[templateField];
  }

  /**
   * Process custom template with variables
   * @private
   */
  processCustomTemplate(template, leadData, customerData, userData) {
    const responses = customerData.getResponsesObject 
      ? customerData.getResponsesObject()
      : Object.fromEntries(customerData.responses || []);

    // Replace variables in template
    let processedBody = template;
    
    // Standard variables
    processedBody = processedBody.replace(/\{\{businessName\}\}/g, userData.businessName || '');
    processedBody = processedBody.replace(/\{\{customerName\}\}/g, customerData.name || 'there');
    processedBody = processedBody.replace(/\{\{classification\}\}/g, leadData.classification);
    
    // Response variables (e.g., {{response:Email}})
    Object.keys(responses).forEach(key => {
      const regex = new RegExp(`\\{\\{response:${key}\\}\\}`, 'g');
      processedBody = processedBody.replace(regex, responses[key] || '');
    });

    return {
      subject: `Thank you for your interest - ${userData.businessName}`,
      body: processedBody,
    };
  }

  /**
   * Send email
   * @param {string} to - Recipient email
   * @param {string} subject - Email subject
   * @param {string} body - Email body (HTML)
   * @returns {Promise<object>} - Send result
   */
  async sendEmail(to, subject, body) {
    try {
      if (!this.transporter) {
        throw new Error('Email transporter not initialized');
      }

      const mailOptions = {
        from: `${config.email.from} <${config.email.user}>`,
        to,
        subject,
        html: body,
      };

      const info = await this.transporter.sendMail(mailOptions);
      
      console.log(`✅ Email sent to ${to}: ${info.messageId}`);
      
      return {
        success: true,
        messageId: info.messageId,
        sentAt: new Date(),
      };
    } catch (error) {
      console.error('Email Send Error:', error.message);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Send personalized email to lead
   * @param {object} leadData - Lead data
   * @param {object} customerData - Customer data
   * @param {object} formData - Form data
   * @param {object} userData - User data
   * @returns {Promise<object>} - Send result with email details
   */
  async sendPersonalizedEmail(leadData, customerData, formData, userData) {
    try {
      // Generate email content
      const emailContent = await this.generatePersonalizedEmail(
        leadData,
        customerData,
        formData,
        userData
      );

      // Send email
      const result = await this.sendEmail(
        customerData.email,
        emailContent.subject,
        emailContent.body
      );

      return {
        ...result,
        subject: emailContent.subject,
        body: emailContent.body,
      };
    } catch (error) {
      console.error('Send Personalized Email Error:', error.message);
      throw error;
    }
  }

  /**
   * Test email configuration
   * @returns {Promise<boolean>}
   */
  async testConnection() {
    try {
      if (!this.transporter) {
        return false;
      }
      await this.transporter.verify();
      console.log('✅ Email connection verified');
      return true;
    } catch (error) {
      console.error('❌ Email connection test failed:', error.message);
      return false;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;