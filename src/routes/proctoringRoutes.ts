import express from 'express';
import {
  logProctoringEvent,
  getProctoringLogsByInterview,
  getProctoringLogsByCandidate,
  analyzeProctoringData,
} from '../controllers/proctoringController';

const router = express.Router();

// Proctoring and anti-cheating routes
router.post('/log-event', logProctoringEvent);
router.get('/logs/interview/:interviewId', getProctoringLogsByInterview);
router.get('/logs/candidate/:email', getProctoringLogsByCandidate);
router.get('/analyze/:interviewId', analyzeProctoringData);

export default router;
