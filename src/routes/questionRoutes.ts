import express from 'express';
import questionController from '../controllers/questionController';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// ======================
// Coding Question Routes
// ======================

router.get(
  '/coding/random',
  isAuthenticated,
  questionController.getRandomCodingQuestion
);
router.post(
  '/coding/create',
  isAuthenticated,
  questionController.createCodingQuestion
);


router.get(
  '/coding/all',
  isAuthenticated,
  questionController.getAllCodingQuestion
);


// =========================
// Behavioral Question Routes
// ==========================

router.get(
  '/behavioral/random',
  isAuthenticated,
  questionController.getRandomBehavioralQuestion
);

router.get(
  '/behaviour/all',
  isAuthenticated,
  questionController.getAllBehaviourQuestion
);


router.post(
  '/behavioral/create',
  isAuthenticated,
  questionController.createBehavioralQuestion
);

router.get(
  '/:id',
  questionController.getQuestionById
)
export default router;
