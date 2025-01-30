import CandidateSubmission from '../models/candidateSubmission.model'; 
import { Request, Response } from 'express';
import { analyzeBehavioralResponses, analyzeCodingPerformance } from '../utils/aiEvaluation';

// Evaluate interview answers using AI
export const evaluateInterview = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const submission = await CandidateSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    const behavioralAnalysis = analyzeBehavioralResponses(submission.answers);
    const codingPerformance = analyzeCodingPerformance(submission.answers);

    submission.aiEvaluation = {
      behavioralAnalysis,
      codingPerformance,
      overallFeedback: `${behavioralAnalysis} | ${codingPerformance}`,
    };
    await submission.save();

    res.json({ success: true, message: 'Interview evaluated successfully', data: submission });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error evaluating interview',
      error: error,
    });
  }
};

// Get a candidate's AI-generated report
export const getCandidateReport = async (req: Request, res: Response) => {
  try {
    const { submissionId } = req.params;
    const submission = await CandidateSubmission.findById(submissionId);

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Submission not found' });
    }

    res.json({ success: true, data: submission.aiEvaluation });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate report',
      error: error,
    });
  }
};

// Generate AI-based performance insights
export const generatePerformanceInsights = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const submissions = await CandidateSubmission.find({ interviewId });

    if (!submissions.length) {
      return res.status(404).json({ success: false, message: 'No submissions found for this interview' });
    }

    const insights = submissions.map((submission) => {
      return {
        email: submission.email,
        behavioralAnalysis: submission.aiEvaluation.behavioralAnalysis,
        codingPerformance: submission.aiEvaluation.codingPerformance,
        overallFeedback: submission.aiEvaluation.overallFeedback,
      };
    });

    res.json({ success: true, data: insights });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error generating performance insights',
      error: error,
    });
  }
};
