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
  getInterviewQuestionsById,
  getInterviewQuestionById
} from '../controllers/interviewController';
import { completeInterview, getInterviewProgress, getInterviewSession, submitAnswer, updateInterviewStatus }
  from '../controllers/interviewSessionController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

/** TRACKING */
router.get('/session/:interviewId', getInterviewSession);
router.put('/session/:interviewId/status', updateInterviewStatus);
router.post('/session/candidate-submissions', submitAnswer);
router.put('/session/:interviewId/complete', completeInterview);
router.get('/session/:interviewId/progress/:email', getInterviewProgress);


router.get('/unique-link/:link', getInterviewByUniqueLink);
router.get('/questions/:id', getInterviewQuestionsById);
router.get('/question/:id', getInterviewQuestionById);
router.use(isAuthenticated);
// Interview management routes
router.post('/create', createInterview);
router.get('/:id', getInterviewById);
router.get('/', getAllInterviews);
router.put('/:id', updateInterview);
router.delete('/:id', deleteInterview);
router.post('/generate-link/:id', generateInterviewLink);
router.post('/send-invitation', sendInterviewInvitation);

router.post('/questions', createInterviewQuestion);
router.delete('/questions/:id', removeInterviewQuestion);

export default router;