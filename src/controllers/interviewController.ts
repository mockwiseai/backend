import { Request, Response } from 'express';
import Interview from '../models/Interview';
import InterviewInvitation from '../models/interviewInvitation';
// import { generateUniqueLink } 
// import { sendEmail } from '../utils/sendEmail'; 
import { generateUniqueLink } from '../utils/generateLink'
import candidateSubmission from '../models/candidateSubmission.model';
import interviewQuestionModel from '../models/interviewQuestion.model';

// Interview Management (Recruiter Side)

export const createInterview = async (req: Request, res: Response) => {
  try {
    const interview = new Interview(req.body);
    await interview.save();
    res.status(201).json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error creating interview', error });
  }
};

export const createInterviewQuestion = async (req: Request, res: Response) => {
  try {
    let interviewQuestion = await interviewQuestionModel.create(req.body);
    res.json({ success: true, data: interviewQuestion });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error adding question', error });
  }
}

export const removeInterviewQuestion = async (req: Request, res: Response) => {
  try {
    await interviewQuestionModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Question deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting question', error });
  }
}

export const getInterviewById = async (req: Request, res: Response) => {
  try {
    const interview = await Interview.findById(req.params.id);
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching interview', error });
  }
};

export const getAllInterviews = async (_req: Request, res: Response) => {
  try {
    const interviews = await Interview.find();
    res.json({ success: true, data: interviews });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching interviews', error });
  }
};

export const updateInterview = async (req: Request, res: Response) => {
  try {
    const interview = await Interview.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating interview', error });
  }
};

export const deleteInterview = async (req: Request, res: Response) => {
  try {
    await Interview.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Interview deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error deleting interview', error });
  }
};

export const generateInterviewLink = async (req: Request, res: Response) => {
  try {
    const uniqueLink = generateUniqueLink(req.params.id);
    res.json({ success: true, link: uniqueLink });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error generating interview link', error });
  }
};

export const sendInterviewInvitation = async (req: Request, res: Response) => {
  try {
    const { interviewId, email, name } = req.body;
    const token = generateUniqueLink(interviewId);
    const invitation = new InterviewInvitation({ interviewId, email, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) });
    await invitation.save();
    // await sendEmail(email, 'Your Interview Link', `Click here to start: ${token}`);
    res.json({ success: true, message: 'Invitation sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error sending invitation', error });
  }
};

// Candidate Interaction

export const startInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId, email, name } = req.body;
    const candidate = await InterviewInvitation.findOne({ interviewId, email });
    if (!candidate) {
      return res.status(400).json({ success: false, message: 'Invalid invitation' });
    }
    res.json({ success: true, message: 'Interview started', data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starting interview', error });
  }
};

export const submitInterview = async (req: Request, res: Response) => {
  try {
    const submission = new candidateSubmission(req.body);
    await submission.save();
    res.json({ success: true, message: 'Interview submitted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error submitting interview', error });
  }
};

export const getInterviewQuestions = async (req: Request, res: Response) => {
  try {
    const interview = await Interview.findById(req.params.id).populate('questions.questionId');
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, data: interview.questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching questions', error });
  }
};

export const trackInterviewProgress = async (req: Request, res: Response) => {
  try {
    const progress = await candidateSubmission.find({ interviewId: req.params.id });
    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error tracking progress', error });
  }
};
