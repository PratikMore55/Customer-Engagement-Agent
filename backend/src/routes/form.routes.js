import express from 'express';
import {
  createForm,
  getForms,
  getFormById,
  getPublicForm,
  updateForm,
  deleteForm,
  toggleFormStatus,
} from '../controllers/form.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  validateForm,
  validateObjectId,
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.get('/public/:id', validateObjectId('id'), getPublicForm);

// Protected routes (require authentication)
router.post('/', protect, validateForm, createForm);
router.get('/', protect, getForms);
router.get('/:id', protect, validateObjectId('id'), getFormById);
router.put('/:id', protect, validateObjectId('id'), updateForm);
router.delete('/:id', protect, validateObjectId('id'), deleteForm);
router.patch('/:id/toggle', protect, validateObjectId('id'), toggleFormStatus);

export default router;