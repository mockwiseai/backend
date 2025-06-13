import InterviewInvitation from '../models/interviewInvitation';
import { Request, Response } from 'express';
import { generateUniqueLink } from '../utils/generateLink';

import { sendEmail, generateInvitationEmail } from "../services/emailService";
// controllers/invitationController.ts
import Interview from '../models/Interview';
import { User } from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    // other user properties
  };
}

export const sendInvitations = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    const { interviewId, emails } = req.body;
    const recruiterId = req.user?.userId;

    console.log("recruiterId: ", recruiterId);
    
    // Validate interview exists and belongs to recruiter
    const interview = await Interview.findOne({
      _id: interviewId,
      recruiterId,
    });
    
    if (!interview) {
      return res.status(404).json({
        success: false,
        message: "Interview not found or you don't have permission",
      });
    }
    
    // Get recruiter/company name
    const recruiter = await User.findById(recruiterId);
    console.log("after recruiter: ", recruiter);
    const companyName = recruiter?.name || "Our Company";

    // Construct the full interview link
    const interviewLink = `http://localhost:3000//live/${interview.uniqueLink}`;

    // Process each email
    const results = [];
    for (const email of emails) {
      try {
        // Generate unique token for each candidate
        const token = generateUniqueLink(interviewId);
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days from now

        // Create invitation record
        const invitation = new InterviewInvitation({
          interviewId,
          recruiterId,
          email,
          name: "Candidate",
          token,
          expiresAt,
          status: "pending",
        });

        await invitation.save();

        // Add to interview candidates if not already there
        const candidateExists = interview.candidates.some(
          (c) => c.email === email
        );
        if (!candidateExists) {
          interview.candidates.push({
            email,
            name: "Candidate",
            questionsAttempted: 0,
            questionsCompleted: 0,
            questionsInProgress: 0,
            status: "pending",
          });
        }

        // Send email with the correct link
        const emailHtml = generateInvitationEmail(
          interview.title,
          interview.jobRole,
          companyName,
          interview.totalTime,
          interview.questions.length,
          interviewLink, // Use the full constructed link here
          expiresAt.toLocaleDateString()
        );

        const emailSent = await sendEmail({
          to: email,
          subject: `Invitation to Complete Your Interview - ${interview.title}`,
          html: emailHtml,
        });

        results.push({
          email,
          success: true,
          invitationId: invitation._id,
          emailSent,
        });
      } catch (error: any) {
        results.push({
          email,
          success: false,
          error: error.message,
        });
      }
    }

    // Save any candidate additions to interview
    await interview.save();

    res.json({
      success: true,
      message: "Invitations processed",
      results,
    });
  } catch (error: any) {
    console.error("Error sending invitations:", error);
    res.status(500).json({
      success: false,
      message: "Error sending invitations",
      error: error.message,
    });
  }
};

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
