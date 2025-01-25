import express, { Router } from 'express';
import userController from '../controllers/userController';
import { isAuthenticated } from '../middleware/auth';

const router: Router = express.Router();

router.get(
  '/question-counters',
  isAuthenticated,
  userController.questionCountersForUser
);

export default router;
