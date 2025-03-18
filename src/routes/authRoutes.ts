import express, { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController';
import { isAuthenticated } from '../middleware/auth';

const router: Router = express.Router();

router.post('/register', (req: Request, res: Response) =>
  authController.register(req, res)
);
router.post('/login', (req: Request, res: Response) =>
  authController.login(req, res)
);
router.post('/logout', (req: Request, res: Response) =>
  authController.logout(req, res)
);
router.get('/profile', isAuthenticated, (req: Request, res: Response) =>
  authController.getProfile(req, res)
);
export default router;
