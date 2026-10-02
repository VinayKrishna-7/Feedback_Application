import express from 'express';
import { getDashboard, deleteFeedback } from '../controllers/feedbackController.js';
import { updateForm } from '../controllers/formController.js';

const router = express.Router();

// Get private management dashboard
router.get('/:adminToken', getDashboard);

// Update feedback form title
router.patch('/:adminToken', updateForm);
router.put('/:adminToken', updateForm);

// Delete specific feedback entry
router.delete('/:adminToken/feedback/:feedbackId', deleteFeedback);

export default router;
