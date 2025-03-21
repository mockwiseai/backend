import express from 'express';
import {
  createInterview,
  getInterviewById,
  getAllInterviews,
  updateInterview,
  deleteInterview,
  generateInterviewLink,
  sendInterviewInvitation,
  createInterviewQuestion,
  removeInterviewQuestion,
  getInterviewByUniqueLink,
  getInterviewQuestionsById
} from '../controllers/interviewController';
import { completeInterview, getInterviewProgress, getInterviewSession, submitAnswer, updateInterviewStatus }
  from '../controllers/interviewSessionController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.use(isAuthenticated);
// Interview management routes
router.post('/create', createInterview);
router.get('/:id', getInterviewById);
router.get('/', getAllInterviews);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
router.post('/generate-link/:id', generateInterviewLink);
router.get('/unique-link/:link', getInterviewByUniqueLink);
router.post('/send-invitation', sendInterviewInvitation);

router.post('/questions', createInterviewQuestion);
router.get('/questions/:id', getInterviewQuestionsById);
router.delete('/questions/:id', removeInterviewQuestion);

/** TRACKING */
router.get('/session/:interviewId', getInterviewSession);
router.put('/session/:interviewId/status', updateInterviewStatus);
router.post('/session/candidate-submissions', submitAnswer);
router.put('/session/:interviewId/complete', completeInterview);
router.get('/session/:interviewId/progress/:email', getInterviewProgress);

export default router;