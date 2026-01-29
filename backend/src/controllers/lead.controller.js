import Lead from '../models/Lead.model.js';
import Customer from '../models/Customer.model.js';

/**
 * @desc    Get all leads for logged-in user
 * @route   GET /api/leads
 * @access  Private
 */
export const getLeads = async (req, res) => {
  try {
    const { classification, followUpStatus, converted, formId } = req.query;

    const query = { userId: req.user.id };
    
    if (classification) query.classification = classification;
    if (followUpStatus) query.followUpStatus = followUpStatus;
    if (converted !== undefined) query.converted = converted === 'true';
    if (formId) query.formId = formId;

    const leads = await Lead.find(query)
      .populate('customerId', 'name email phone responses')
      .populate('formId', 'title')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('Get Leads Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get leads',
      error: error.message,
    });
  }
};

/**
 * @desc    Get single lead by ID
 * @route   GET /api/leads/:id
 * @access  Private
 */
export const getLeadById = async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id)
      .populate('customerId')
      .populate('formId', 'title fields');

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check ownership
    if (lead.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this lead',
      });
    }

    res.status(200).json({
      success: true,
      lead,
    });
  } catch (error) {
    console.error('Get Lead Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead',
      error: error.message,
    });
  }
};

/**
 * @desc    Get lead statistics
 * @route   GET /api/leads/stats
 * @access  Private
 */
export const getLeadStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get counts by classification
    const stats = await Lead.aggregate([
      { $match: { userId: userId } },
      {
        $group: {
          _id: '$classification',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$confidenceScore' },
          converted: { $sum: { $cond: ['$converted', 1, 0] } },
        },
      },
    ]);

    // Get overall stats
    const total = await Lead.countDocuments({ userId });
    const converted = await Lead.countDocuments({ userId, converted: true });
    const pending = await Lead.countDocuments({ userId, followUpStatus: 'pending' });

    res.status(200).json({
      success: true,
      stats: {
        total,
        converted,
        pending,
        conversionRate: total > 0 ? ((converted / total) * 100).toFixed(2) : 0,
        byClassification: stats,
      },
    });
  } catch (error) {
    console.error('Get Lead Stats Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get lead statistics',
      error: error.message,
    });
  }
};

/**
 * @desc    Update lead classification (manual override)
 * @route   PATCH /api/leads/:id/classification
 * @access  Private
 */
export const updateLeadClassification = async (req, res) => {
  try {
    const { classification, reason } = req.body;

    if (!['hot', 'normal', 'cold'].includes(classification)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid classification',
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check ownership
    if (lead.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead',
      });
    }

    lead.manualClassification = classification;
    lead.manualClassificationReason = reason;
    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Lead classification updated successfully',
      lead,
    });
  } catch (error) {
    console.error('Update Lead Classification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update lead classification',
      error: error.message,
    });
  }
};

/**
 * @desc    Update follow-up status
 * @route   PATCH /api/leads/:id/follow-up
 * @access  Private
 */
export const updateFollowUpStatus = async (req, res) => {
  try {
    const { status, nextFollowUpDate } = req.body;

    const validStatuses = ['pending', 'contacted', 'in-progress', 'converted', 'lost'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid follow-up status',
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check ownership
    if (lead.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this lead',
      });
    }

    lead.followUpStatus = status;
    if (status === 'contacted' || status === 'in-progress') {
      lead.lastContactedAt = new Date();
    }
    if (nextFollowUpDate) {
      lead.nextFollowUpAt = new Date(nextFollowUpDate);
    }

    await lead.save();

    res.status(200).json({
      success: true,
      message: 'Follow-up status updated successfully',
      lead,
    });
  } catch (error) {
    console.error('Update Follow-up Status Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update follow-up status',
      error: error.message,
    });
  }
};

/**
 * @desc    Add note to lead
 * @route   POST /api/leads/:id/notes
 * @access  Private
 */
export const addLeadNote = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Note text is required',
      });
    }

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check ownership
    if (lead.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add notes to this lead',
      });
    }

    await lead.addNote(text);

    res.status(200).json({
      success: true,
      message: 'Note added successfully',
      lead,
    });
  } catch (error) {
    console.error('Add Lead Note Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add note',
      error: error.message,
    });
  }
};

/**
 * @desc    Mark lead as converted
 * @route   PATCH /api/leads/:id/convert
 * @access  Private
 */
export const convertLead = async (req, res) => {
  try {
    const { conversionValue } = req.body;

    const lead = await Lead.findById(req.params.id);

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: 'Lead not found',
      });
    }

    // Check ownership
    if (lead.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to convert this lead',
      });
    }

    await lead.markConverted(conversionValue);

    res.status(200).json({
      success: true,
      message: 'Lead marked as converted successfully',
      lead,
    });
  } catch (error) {
    console.error('Convert Lead Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to convert lead',
      error: error.message,
    });
  }
};

/**
 * @desc    Get leads due for follow-up
 * @route   GET /api/leads/due-follow-up
 * @access  Private
 */
export const getDueFollowUps = async (req, res) => {
  try {
    const leads = await Lead.find({
      userId: req.user.id,
      isActive: true,
      converted: false,
      nextFollowUpAt: { $lte: new Date() },
    })
      .populate('customerId', 'name email phone')
      .sort({ nextFollowUpAt: 1 });

    res.status(200).json({
      success: true,
      count: leads.length,
      leads,
    });
  } catch (error) {
    console.error('Get Due Follow-ups Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get due follow-ups',
      error: error.message,
    });
  }
};

export default {
  getLeads,
  getLeadById,
  getLeadStats,
  updateLeadClassification,
  updateFollowUpStatus,
  addLeadNote,
  convertLead,
  getDueFollowUps,
};