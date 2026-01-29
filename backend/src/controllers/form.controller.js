import Form from '../models/Form.model.js';

/**
 * @desc    Create new form
 * @route   POST /api/forms
 * @access  Private
 */
export const createForm = async (req, res) => {
  try {
    const { title, description, fields, classificationCriteria, emailSettings } = req.body;

    // Create form
    const form = await Form.create({
      userId: req.user.id,
      title,
      description,
      fields,
      classificationCriteria,
      emailSettings,
    });

    res.status(201).json({
      success: true,
      message: 'Form created successfully',
      form,
    });
  } catch (error) {
    console.error('Create Form Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create form',
      error: error.message,
    });
  }
};

/**
 * @desc    Get all forms for logged-in user
 * @route   GET /api/forms
 * @access  Private
 */
export const getForms = async (req, res) => {
  try {
    const { isActive } = req.query;

    const query = { userId: req.user.id };
    
    // Filter by active status if provided
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }

    const forms = await Form.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: forms.length,
      forms,
    });
  } catch (error) {
    console.error('Get Forms Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get forms',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single form by ID
 * @route   GET /api/forms/:id
 * @access  Private
 */
export const getFormById = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check ownership
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this form',
      });
    }

    res.status(200).json({
      success: true,
      form,
    });
  } catch (error) {
    console.error('Get Form Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get form',
      error: error.message,
    });
  }
};

/**
 * @desc    Get public form (for customers to fill)
 * @route   GET /api/forms/public/:id
 * @access  Public
 */
export const getPublicForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id).select('-userId -emailSettings -__v');

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    if (!form.isActive) {
      return res.status(404).json({
        success: false,
        message: 'This form is no longer accepting responses',
      });
    }

    res.status(200).json({
      success: true,
      form,
    });
  } catch (error) {
    console.error('Get Public Form Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get form',
      error: error.message,
    });
  }
};

/**
 * @desc    Update form
 * @route   PUT /api/forms/:id
 * @access  Private
 */
export const updateForm = async (req, res) => {
  try {
    let form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check ownership
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this form',
      });
    }

    // Update form
    const { title, description, fields, classificationCriteria, emailSettings, isActive } = req.body;

    if (title) form.title = title;
    if (description !== undefined) form.description = description;
    if (fields) form.fields = fields;
    if (classificationCriteria) form.classificationCriteria = classificationCriteria;
    if (emailSettings) form.emailSettings = emailSettings;
    if (isActive !== undefined) form.isActive = isActive;

    await form.save();

    res.status(200).json({
      success: true,
      message: 'Form updated successfully',
      form,
    });
  } catch (error) {
    console.error('Update Form Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update form',
      error: error.message,
    });
  }
};

/**
 * @desc    Delete form
 * @route   DELETE /api/forms/:id
 * @access  Private
 */
export const deleteForm = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check ownership
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this form',
      });
    }

    await form.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Form deleted successfully',
    });
  } catch (error) {
    console.error('Delete Form Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete form',
      error: error.message,
    });
  }
};

/**
 * @desc    Toggle form active status
 * @route   PATCH /api/forms/:id/toggle
 * @access  Private
 */
export const toggleFormStatus = async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);

    if (!form) {
      return res.status(404).json({
        success: false,
        message: 'Form not found',
      });
    }

    // Check ownership
    if (form.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to modify this form',
      });
    }

    form.isActive = !form.isActive;
    await form.save();

    res.status(200).json({
      success: true,
      message: `Form ${form.isActive ? 'activated' : 'deactivated'} successfully`,
      form,
    });
  } catch (error) {
    console.error('Toggle Form Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle form status',
      error: error.message,
    });
  }
};

export default {
  createForm,
  getForms,
  getFormById,
  getPublicForm,
  updateForm,
  deleteForm,
  toggleFormStatus,
};