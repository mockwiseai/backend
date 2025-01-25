import { Request, Response } from 'express';
import behavioralQuestionModel from '../models/behavioralQuestion.model';
import codingQuestionModel from '../models/codingQuestion.model';
import userSubmissionModel from '../models/userSubmission.model';

class UserController {
  // Submit a coding answer
  async questionCountersForUser(req: any, res: Response) {
    try {
      const userId = req.user.userId;

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      // Total counts
      const totalBehavioralQuestions =
        await behavioralQuestionModel.countDocuments();
      const totalCodingQuestions = await codingQuestionModel.countDocuments();

      // User-specific completed counts
      const completedBehavioralQuestions =
        await userSubmissionModel.countDocuments({
          userId,
          questionType: 'BehavioralQuestion',
        });
      const completedCodingQuestions = await userSubmissionModel.countDocuments(
        {
          userId,
          questionType: 'CodingQuestion',
        }
      );

      res.json({
        behavioralQuestions: {
          completedBehavioralQuestions,
          totalBehavioralQuestions,
        },
        codingQuestions: { completedCodingQuestions, totalCodingQuestions },
      });
    } catch (error) {
      console.error('Error fetching question counters for user:', error);
      res.status(500).json({ error: 'Failed to fetch question counters' });
    }
  }
}

export default new UserController();
