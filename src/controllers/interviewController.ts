import { Request, Response } from 'express';
import Interview from '../models/Interview';
import InterviewInvitation from '../models/interviewInvitation';
// import { generateUniqueLink } 
// import { sendEmail } from '../utils/sendEmail'; 
import { generateUniqueLink } from '../utils/generateLink'
import candidateSubmission from '../models/candidateSubmission.model';
import interviewQuestionModel from '../models/interviewQuestion.model';

// Interview Management (Recruiter Side)

interface RequestWithUser extends Request {
  user?: { userId: string };
}

export const createInterview = async (req: RequestWithUser, res: Response) => {
  try {
    // Validate schedule date
    if (!req.body.scheduleDate) {
      return res.status(400).json({
        success: false,
        message: "Schedule date is required",
      })
    }

    const interview = new Interview({
      ...req.body,
      recruiterId: req.user?.userId,
    })
    await interview.save()

    // questions are already created we just need to add them to the interview object
    const questionsIds = req.body.questions.map((question: any) => question.questionId);
    // update question interviewId to the current interview
    await interviewQuestionModel.updateMany({ _id: { $in: questionsIds } }, { interviewId: interview._id })
    interview.questions = req.body.questions.map((question: any) => ({ 
      questionId: question.questionId, 
      questionType: question.questionType 
    }));
    await interview.save()

    res.status(201).json({ success: true, data: interview })
  } catch (error) {
    res.status(500).json({ success: false, message: "Error creating interview", error })
  }
}

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
    const interview = await Interview.findById(req.params.id).populate('questions.questionId');
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, data: {
      ...interview.toObject(),
      questions: interview.questions.map((question: any) => ({
        ...question.questionId.toObject(),
        questionType: question.questionType,
      })),
    } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching interview', error });
  }
};

export const getInterviewQuestionsById = async (req: Request, res: Response) => {
  try {
    const questions = await interviewQuestionModel.find({ interviewId: req.params.id });
    res.json({ success: true, data: questions });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching questions', error });
  }
}

export const getInterviewQuestionById = async (req: Request, res: Response) => {
  try {
    const question = await interviewQuestionModel.findById(req.params.id);
    res.json({ success: true, data: question });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching questions', error });
  }
}

export const getInterviewByUniqueLink = async (req: Request, res: Response) => {
  try {
    const interview = await Interview.findOne({ uniqueLink: req.params.link }).populate('questions.questionId');
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching interview', error });
  }
}
export const getAllInterviews = async (_req: RequestWithUser, res: Response) => {
  try {
    const interviews = await Interview.find({
      recruiterId: _req.user?.userId,
    }).sort({ createdAt: -1 });

    // candidates name and email
    const candidates = await InterviewInvitation.find({
      interviewId: {
        $in: interviews.map((interview) => interview._id)
      }
    })

    let interviewsData = interviews.map((interview: any) => {
      interview.candidatesData = candidates.filter(candidate => candidate.interviewId.toString() === interview._id.toString());
      return interview;
    });

    res.json({ success: true, data: interviewsData });
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
    const { interviewId: uniqueLink, email, name } = req.body;
    let interview = await Interview.findOne({ uniqueLink });
    if (!interview) {
      return res.status(404).json({ success: false, message: 'Interview not found' });
    }
    const interviewId = interview._id;

    // if user is sending a request to start the interview, it means the user has clicked on the link so create an invitation
    const token = generateUniqueLink(interviewId);
    const invitation = new InterviewInvitation({ interviewId, email, token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), name });
    await invitation.save();
    // await sendEmail(email, 'Your Interview Link', `Click here to start: ${token}`);

    const candidate = await InterviewInvitation.findOne({ interviewId, email });
    if (!candidate) {
      return res.status(400).json({ success: false, message: 'Invalid invitation' });
    }

    // check if the candidate has already started the interview
    let submission = await candidateSubmission.findOne({ interviewId, email });
    if (submission) {
      return res.status(400).json({ success: false, message: 'Interview already started' });
    }

    // create a submission
    submission = new candidateSubmission({ interviewId, email, name, initiatedAt: Date.now() });
    await submission.save();

    interview.candidates.push({
      email,
      name,
      status: 'in-progress',
      questionsAttempted: 0,
      questionsCompleted: 0,
      questionsInProgress: 0,
      submittedAt: null
    })

    await interview.save();
    res.json({ success: true, message: 'Interview started', data: candidate });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error starting interview', error });
  }
};

export const submitInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId, email } = req.body;
    const submission = await candidateSubmission.findOne({ interviewId, email });
    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }
    submission.status = 'completed';
    submission.submittedAt = new Date();
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
