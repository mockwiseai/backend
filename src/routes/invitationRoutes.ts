import express from 'express';
import {
  verifyInvitationToken,
  resendInvitation,
  expireInvitation,
} from '../controllers/invitationController';

const router = express.Router();

// Invitation management routes
router.get('/verify/:token', verifyInvitationToken);
router.post('/resend', resendInvitation);
router.post('/expire/:token', expireInvitation);

export default router;
