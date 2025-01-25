import express from 'express';
import {
  startInterview,
  submitInterview,
  getInterviewQuestions,
  trackInterviewProgress,
} from '../controllers/interviewController';

const router = express.Router();

// Candidate interaction routes
router.post('/start', startInterview);
router.post('/submit', submitInterview);
router.get('/questions/:id', getInterviewQuestions);
router.get('/progress/:id', trackInterviewProgress);

export default router;
