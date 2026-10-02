import express from 'express';
import { createForm, getPublicForm } from '../controllers/formController.js';
import { submitFeedback } from '../controllers/feedbackController.js';
import { feedbackSubmissionLimiter, formCreationLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Form creation
router.post('/', formCreationLimiter, createForm);

// Public form details
router.get('/:publicToken', getPublicForm);

// Submit feedback to public form
router.post('/:publicToken/feedback', feedbackSubmissionLimiter, submitFeedback);

export default router;
