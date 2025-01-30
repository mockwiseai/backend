import InterviewInvitation from '../models/interviewInvitation';
import { Request, Response } from 'express';
import { generateUniqueLink } from '../utils/generateLink';
// Verify interview invitation token
export const verifyInvitationToken = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const invitation = await InterviewInvitation.findOne({ token });

    if (!invitation || invitation.expiresAt < new Date()) {
      return res.status(400).json({ success: false, message: 'Invalid or expired invitation token' });
    }

    res.json({ success: true, message: 'Token is valid', data: invitation });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error verifying invitation token',
      error: error
    });
  }
};

// Resend interview invitation
export const resendInvitation = async (req: Request, res: Response) => {
  try {
    const { interviewId, email, name } = req.body;
    const existingInvitation = await InterviewInvitation.findOne({ interviewId, email });

    if (!existingInvitation) {
      return res.status(404).json({ success: false, message: 'No invitation found for this email' });
    }

    const newToken = generateUniqueLink(interviewId);
    existingInvitation.token = newToken;
    existingInvitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await existingInvitation.save();

    // await sendEmail(email, 'Resent Interview Invitation', `Click here to start: ${newToken}`);

    res.json({ success: true, message: 'Invitation resent successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error resending invitation',
      error: error
    });
  }
};

// Expire an invitation
export const expireInvitation = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const invitation = await InterviewInvitation.findOne({ token });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation not found' });
    }

    invitation.status = 'expired';
    await invitation.save();

    res.json({ success: true, message: 'Invitation expired successfully' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error expiring invitation',
      error: error
    });
  }
};
