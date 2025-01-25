import express from 'express';
import userSubmissionController from '../controllers/userSubmissionController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

router.get(
  '/all/:userId',
  isAuthenticated,
  userSubmissionController.getAllSubmissions
);

// Coding answers
router.post(
  '/coding/:id',
  isAuthenticated,

  userSubmissionController.submitCodingAnswer
);

// Behavioral answers
router.post(
  '/behavioral/:id',
  isAuthenticated,
  userSubmissionController.submitBehavioralAnswer
);

export default router;
