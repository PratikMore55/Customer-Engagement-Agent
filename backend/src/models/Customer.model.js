import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema(
  {
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    // Dynamic form responses
    responses: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Extract common fields for easy access
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    name: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    // Submission metadata
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    // Processing status
    processed: {
      type: Boolean,
      default: false,
    },
    processingError: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
customerSchema.index({ userId: 1, formId: 1, submittedAt: -1 });
customerSchema.index({ email: 1 });

// Method to get response value by field name
customerSchema.methods.getResponse = function (fieldName) {
  return this.responses.get(fieldName);
};

// Method to get all responses as plain object
customerSchema.methods.getResponsesObject = function () {
  const obj = {};
  this.responses.forEach((value, key) => {
    obj[key] = value;
  });
  return obj;
};

const Customer = mongoose.model('Customer', customerSchema);

export default Customer;