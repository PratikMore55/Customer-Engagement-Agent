import mongoose from 'mongoose';

const leadSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      unique: true, // One lead per customer
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    formId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Form',
      required: true,
      index: true,
    },
    // AI Classification
    classification: {
      type: String,
      enum: ['hot', 'normal', 'cold'],
      required: true,
      index: true,
    },
    confidenceScore: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    reasoning: {
      type: String,
      required: true,
    },
    // Key insights extracted by AI
    insights: {
      budget: String,
      timeline: String,
      decisionMaker: Boolean,
      painPoints: [String],
      interests: [String],
      urgency: {
        type: String,
        enum: ['immediate', 'short-term', 'long-term', 'unknown'],
      },
    },
    // Email engagement
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: Date,
    emailSubject: String,
    emailBody: String,
    emailOpened: {
      type: Boolean,
      default: false,
    },
    emailClicked: {
      type: Boolean,
      default: false,
    },
    // Follow-up tracking
    followUpStatus: {
      type: String,
      enum: ['pending', 'contacted', 'in-progress', 'converted', 'lost'],
      default: 'pending',
    },
    lastContactedAt: Date,
    nextFollowUpAt: Date,
    // Owner notes
    notes: [
      {
        text: String,
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    // Manual override
    manualClassification: {
      type: String,
      enum: ['hot', 'normal', 'cold'],
    },
    manualClassificationReason: String,
    // Status
    isActive: {
      type: Boolean,
      default: true,
    },
    converted: {
      type: Boolean,
      default: false,
    },
    convertedAt: Date,
    conversionValue: Number,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
leadSchema.index({ userId: 1, classification: 1, followUpStatus: 1 });
leadSchema.index({ userId: 1, converted: 1 });
leadSchema.index({ nextFollowUpAt: 1, isActive: 1 });

// Virtual to get effective classification (manual override takes precedence)
leadSchema.virtual('effectiveClassification').get(function () {
  return this.manualClassification || this.classification;
});

// Method to add a note
leadSchema.methods.addNote = async function (noteText) {
  this.notes.push({ text: noteText });
  await this.save();
};

// Method to mark as converted
leadSchema.methods.markConverted = async function (value) {
  this.converted = true;
  this.convertedAt = new Date();
  this.conversionValue = value;
  this.followUpStatus = 'converted';
  await this.save();
};

// Method to update follow-up
leadSchema.methods.scheduleFollowUp = async function (date) {
  this.nextFollowUpAt = date;
  await this.save();
};

// Static method to get leads needing follow-up
leadSchema.statics.getDueForFollowUp = function (userId) {
  return this.find({
    userId,
    isActive: true,
    converted: false,
    nextFollowUpAt: { $lte: new Date() },
  }).populate('customerId');
};

// Static method to get statistics
leadSchema.statics.getStats = async function (userId) {
  const stats = await this.aggregate([
    { $match: { userId: mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: '$classification',
        count: { $sum: 1 },
        avgConfidence: { $avg: '$confidenceScore' },
        converted: {
          $sum: { $cond: ['$converted', 1, 0] },
        },
      },
    },
  ]);

  return stats;
};

const Lead = mongoose.model('Lead', leadSchema);

export default Lead;