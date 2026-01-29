import mongoose from 'mongoose';

const fieldSchema = new mongoose.Schema({
  label: {
    type: String,
    required: true,
    trim: true,
  },
  fieldType: {
    type: String,
    required: true,
    enum: ['text', 'email', 'phone', 'number', 'textarea', 'select', 'radio', 'checkbox', 'date'],
  },
  placeholder: {
    type: String,
    trim: true,
  },
  options: [String], // For select, radio, checkbox fields
  required: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    required: true,
  },
  // AI relevance weighting for classification
  classificationWeight: {
    type: String,
    enum: ['high', 'medium', 'low', 'none'],
    default: 'medium',
    description: 'How important is this field for lead classification?',
  },
});

const formSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a form title'],
      trim: true,
      maxLength: [100, 'Title cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxLength: [500, 'Description cannot exceed 500 characters'],
    },
    fields: {
      type: [fieldSchema],
      required: true,
      validate: {
        validator: function (fields) {
          return fields.length > 0;
        },
        message: 'Form must have at least one field',
      },
    },
    // Classification criteria for the AI
    classificationCriteria: {
      hotLeadIndicators: [String], // e.g., ["high budget", "immediate timeline", "decision maker"]
      normalLeadIndicators: [String],
      coldLeadIndicators: [String],
    },
    // Email settings
    emailSettings: {
      sendAutoResponse: {
        type: Boolean,
        default: true,
      },
      hotLeadTemplate: String,
      normalLeadTemplate: String,
      coldLeadTemplate: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    submissionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Index for faster queries
formSchema.index({ userId: 1, isActive: 1 });

// Method to increment submission count
formSchema.methods.incrementSubmissions = async function () {
  this.submissionCount += 1;
  await this.save();
};

const Form = mongoose.model('Form', formSchema);

export default Form;