import validator from 'validator';

/**
 * Validate registration data
 */
export const validateRegister = (req, res, next) => {
  const { name, email, password, businessName } = req.body;
  const errors = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push('Name is required');
  } else if (name.length > 50) {
    errors.push('Name cannot exceed 50 characters');
  }

  // Email validation
  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email');
  }

  // Password validation
  if (!password || password.length === 0) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  // Business name validation
  if (!businessName || businessName.trim().length === 0) {
    errors.push('Business name is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate login data
 */
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || email.trim().length === 0) {
    errors.push('Email is required');
  } else if (!validator.isEmail(email)) {
    errors.push('Please provide a valid email');
  }

  if (!password || password.length === 0) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate form creation
 */
export const validateForm = (req, res, next) => {
  const { title, fields } = req.body;
  const errors = [];

  // Title validation
  if (!title || title.trim().length === 0) {
    errors.push('Form title is required');
  } else if (title.length > 100) {
    errors.push('Title cannot exceed 100 characters');
  }

  // Fields validation
  if (!fields || !Array.isArray(fields)) {
    errors.push('Fields must be an array');
  } else if (fields.length === 0) {
    errors.push('Form must have at least one field');
  } else {
    // Validate each field
    fields.forEach((field, index) => {
      if (!field.label || field.label.trim().length === 0) {
        errors.push(`Field ${index + 1}: Label is required`);
      }
      if (!field.fieldType) {
        errors.push(`Field ${index + 1}: Field type is required`);
      }
      if (field.order === undefined || field.order === null) {
        errors.push(`Field ${index + 1}: Order is required`);
      }
    });
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate customer submission
 */
export const validateCustomerSubmission = (req, res, next) => {
  const { formId, responses } = req.body;
  const errors = [];

  if (!formId) {
    errors.push('Form ID is required');
  }

  if (!responses || typeof responses !== 'object') {
    errors.push('Responses must be an object');
  } else if (Object.keys(responses).length === 0) {
    errors.push('At least one response is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  next();
};

/**
 * Validate email address
 */
export const validateEmail = (req, res, next) => {
  const { email } = req.body;

  if (!email || !validator.isEmail(email)) {
    return res.status(400).json({
      success: false,
      message: 'Please provide a valid email address',
    });
  }

  next();
};

/**
 * Validate MongoDB ObjectId
 */
export const validateObjectId = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    
    // Basic MongoDB ObjectId validation (24 hex characters)
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${paramName}`,
      });
    }

    next();
  };
};

/**
 * Sanitize input to prevent XSS
 */
export const sanitizeInput = (req, res, next) => {
  // Sanitize body
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = validator.escape(req.body[key]);
      }
    });
  }

  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = validator.escape(req.query[key]);
      }
    });
  }

  next();
};

export default {
  validateRegister,
  validateLogin,
  validateForm,
  validateCustomerSubmission,
  validateEmail,
  validateObjectId,
  sanitizeInput,
};