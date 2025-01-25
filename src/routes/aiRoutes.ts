import express from 'express';
import {
  evaluateInterview,
  getCandidateReport,
  generatePerformanceInsights,
} from '../controllers/aiController';

const router = express.Router();

// AI evaluation routes
router.post('/evaluate/:submissionId', evaluateInterview);
router.get('/report/:submissionId', getCandidateReport);
router.get('/insights/:interviewId', generatePerformanceInsights);

export default router;