// routes/invitationRoutes.ts
import express from "express";
import { isAuthenticated } from "../middleware/auth";
import {
  sendInvitations,
  verifyInvitationToken,
  resendInvitation,
  expireInvitation,
} from "../controllers/invitationController";

const router = express.Router();

router.post("/send", isAuthenticated, sendInvitations);
router.get("/verify/:token", verifyInvitationToken);
router.post("/resend", isAuthenticated, resendInvitation);
router.post("/expire/:token", isAuthenticated, expireInvitation);

export default router;
