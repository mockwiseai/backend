import express, { Router, Request, Response } from 'express';
import * as authController from '../controllers/authController';

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

export default router;
