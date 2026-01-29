import express from 'express';
import {
  submitForm,
  getCustomers,
  getCustomerById,
  deleteCustomer,
} from '../controllers/customer.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import {
  validateCustomerSubmission,
  validateObjectId,
} from '../middleware/validation.middleware.js';

const router = express.Router();

// Public routes
router.post('/submit', validateCustomerSubmission, submitForm);

// Protected routes (require authentication)
router.get('/', protect, getCustomers);
router.get('/:id', protect, validateObjectId('id'), getCustomerById);
router.delete('/:id', protect, validateObjectId('id'), deleteCustomer);

export default router;