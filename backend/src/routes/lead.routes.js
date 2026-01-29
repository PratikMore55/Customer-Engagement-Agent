import express from 'express';
import {
  getLeads,
  getLeadById,
  getLeadStats,
  updateLeadClassification,
  updateFollowUpStatus,
  addLeadNote,
  convertLead,
  getDueFollowUps,
} from '../controllers/lead.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { validateObjectId } from '../middleware/validation.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Lead management
router.get('/', getLeads);
router.get('/stats', getLeadStats);
router.get('/due-follow-up', getDueFollowUps);
router.get('/:id', validateObjectId('id'), getLeadById);

// Lead updates
router.patch('/:id/classification', validateObjectId('id'), updateLeadClassification);
router.patch('/:id/follow-up', validateObjectId('id'), updateFollowUpStatus);
router.post('/:id/notes', validateObjectId('id'), addLeadNote);
router.patch('/:id/convert', validateObjectId('id'), convertLead);

export default router;