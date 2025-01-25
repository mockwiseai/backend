import express from 'express';
import {
  createInterview,
  getInterviewById,
  getAllInterviews,
  updateInterview,
  deleteInterview,
  generateInterviewLink,
  sendInterviewInvitation,
} from '../controllers/interviewController';

const router = express.Router();

// Interview management routes
router.post('/create', createInterview);
router.get('/:id', getInterviewById);
router.get('/', getAllInterviews);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
router.post('/generate-link/:id', generateInterviewLink);
router.post('/send-invitation', sendInterviewInvitation);

export default router;