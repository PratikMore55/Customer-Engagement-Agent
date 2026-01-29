import Customer from '../models/Customer.model.js';
import Lead from '../models/Lead.model.js';
import Form from '../models/Form.model.js';
import User from '../models/User.model.js';
import classificationService from '../services/classification.service.js';
import emailService from '../services/email.service.js';

/**
 * @desc    Submit form (Customer fills out form)
 * @route   POST /api/customers/submit
 * @access  Public
 */
export const submitForm = async (req, res) => {
  try {
    const { formId, responses } = req.body;

    // Get form
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    if (!form.isActive) {
      return res.status(400).json({
        success: false,
        message: 'This form is no longer accepting responses',
      });
    }

    // Extract common fields from responses
    const email = responses.Email || responses.email || responses['Email Address'];
    const name = responses.Name || responses.name || responses['Full Name'];
    const phone = responses.Phone || responses.phone || responses['Phone Number'];

    // Create customer record
    const customer = await Customer.create({
      formId,
      userId: form.userId,
      responses: new Map(Object.entries(responses)),
      email,
      name,
      phone,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
    });

    // Increment form submission count
    await form.incrementSubmissions();

    // Process in background (don't wait for response)
    processCustomerSubmission(customer._id, form, form.userId).catch(err => {
      console.error('Background Processing Error:', err);
    });

    res.status(201).json({
      success: true,
      message: 'Form submitted successfully! We will get back to you soon.',
      customerId: customer._id,
    });
  } catch (error) {
    console.error('Submit Form Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit form',
      error: error.message,
    });
  }
};

/**
 * Process customer submission (AI classification + email)
 * This runs in background
 */
async function processCustomerSubmission(customerId, form, userId) {
  try {
    console.log(`🤖 Processing customer ${customerId}...`);

    // Get customer data
    const customer = await Customer.findById(customerId);
    const user = await User.findById(userId);

    if (!customer || !user) {
      throw new Error('Customer or User not found');
    }

    // Step 1: AI Classification
    console.log('🎯 Classifying lead...');
    const classification = await classificationService.classifyLead(customer, form, user);

    // Step 2: Create Lead record
    console.log(`📊 Creating lead (${classification.classification})...`);
    const lead = await Lead.create({
      customerId: customer._id,
      userId: user._id,
      formId: form._id,
      classification: classification.classification,
      confidenceScore: classification.confidenceScore,
      reasoning: classification.reasoning,
      insights: classification.insights,
    });

    // Step 3: Generate and send personalized email
    if (customer.email && form.emailSettings?.sendAutoResponse !== false) {
      console.log('📧 Sending personalized email...');
      
      const emailResult = await emailService.sendPersonalizedEmail(
        lead,
        customer,
        form,
        user
      );

      // Update lead with email info
      lead.emailSent = emailResult.success;
      lead.emailSentAt = emailResult.success ? new Date() : undefined;
      lead.emailSubject = emailResult.subject;
      lead.emailBody = emailResult.body;
      await lead.save();

      console.log(`✅ Email ${emailResult.success ? 'sent' : 'failed'}`);
    }

    // Mark customer as processed
    customer.processed = true;
    await customer.save();

    console.log(`✅ Processing complete for customer ${customerId}`);
  } catch (error) {
    console.error('Process Customer Error:', error);
    
    // Mark processing error
    await Customer.findByIdAndUpdate(customerId, {
      processingError: error.message,
    });
  }
}

/**
 * @desc    Get all customers for logged-in user
 * @route   GET /api/customers
 * @access  Private
 */
export const getCustomers = async (req, res) => {
  try {
    const { formId, processed } = req.query;

    const query = { userId: req.user.id };
    
    if (formId) query.formId = formId;
    if (processed !== undefined) query.processed = processed === 'true';

    const customers = await Customer.find(query)
      .populate('formId', 'title')
      .sort({ submittedAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      customers,
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customers',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single customer by ID
 * @route   GET /api/customers/:id
 * @access  Private
 */
export const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('formId', 'title fields');

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Check ownership
    if (customer.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this customer',
      });
    }

    // Get associated lead if exists
    const lead = await Lead.findOne({ customerId: customer._id });

    res.status(200).json({
      success: true,
      customer,
      lead,
    });
  } catch (error) {
    console.error('Get Customer Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get customer',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete customer
 * @route   DELETE /api/customers/:id
 * @access  Private
 */
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found',
      });
    }

    // Check ownership
    if (customer.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this customer',
      });
    }

    // Delete associated lead
    await Lead.deleteOne({ customerId: customer._id });

    // Delete customer
    await customer.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Customer deleted successfully',
    });
  } catch (error) {
    console.error('Delete Customer Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete customer',
      error: error.message,
    });
  }
};

export default {
  submitForm,
  getCustomers,
  getCustomerById,
  deleteCustomer,
};