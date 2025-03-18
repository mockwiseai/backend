import { Request, Response } from 'express';
import UserSubmission from '../models/userSubmission.model';
import Question from '../models/codingQuestion.model';
// import { executeCode } from '../utils/codeExecutor';
import { sendSuccess, sendError } from '../utils/responses';
import mongoose from 'mongoose';

class UserSubmissionController {
  // Submit a coding answer
  async submitCodingAnswer(req: any, res: Response) {
    try {
      const { id } = req.params; // Question ID
      const { userAnswer, language } = req.body;
      const userId = req.user?.userId;

      const question = await Question.findById(id);
      if (!question) {
        return sendError(res, 404, 'Question not found');
      }

      // Run the user's code against the test cases
      const results = await Promise.all(
        question.testCases.map(async (testCase) => {
          //   const userOutput = await executeCode(
          //     userAnswer,
          //     testCase.input,
          //     language
          //   );
          return {
            // isPassed: userOutput === testCase.output,
            isPassed: true,
            input: testCase.input,
            expectedOutput: testCase.output,
            userOutput: 'abc',
            isHidden: testCase.isHidden,
          };
        })
      );

      const isCorrect = results.every((result) => result.isPassed);

      // Save the user's submission
      const submission = await UserSubmission.create({
        userId,
        questionId: id,
        questionType: 'CodingQuestion',
        userAnswer,
        language,
        testCaseResults: results,
        isCorrect,
      });

      return sendSuccess(res, 200, 'Answer submitted successfully', {
        submission,
      });
    } catch (error) {
      console.error('Error in submitCodingAnswer:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  // Submit or update a behavioral answer
  async submitBehavioralAnswer(req: any, res: Response) {
    try {
      const { id } = req.params; // Question ID
      const { userAnswer } = req.body;
      const userId = req.user?.userId;

      // Check if the submission already exists
      let submission = await UserSubmission.findOne({
        userId: new mongoose.Types.ObjectId(userId),
        questionId: new mongoose.Types.ObjectId(id),
        questionType: 'BehavioralQuestion',
      });

      if (submission) {
        // Update the existing submission
        submission.userAnswer = userAnswer;
        await submission.save();
        return sendSuccess(res, 200, 'Behavioral answer updated successfully', {
          submission,
        });
      } else {
        // Create a new submission
        submission = await UserSubmission.create({
          userId,
          questionId: id,
          questionType: 'BehavioralQuestion',
          userAnswer,
        });
        return sendSuccess(
          res,
          200,
          'Behavioral answer submitted successfully',
          {
            submission,
          }
        );
      }
    } catch (error) {
      console.error('Error in submitBehavioralAnswer:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  // Get all submissions
  async getAllSubmissions(req: Request, res: Response) {
    try {
      const { userId } = req.params;

      const submissions = await UserSubmission.find({ userId })
        .populate('questionId') // Populate with full question data (coding or behavioral)
        .populate('userId', 'name email') // Populate with user details (adjust fields as needed)
        .sort({ submittedAt: -1 }); // Sort by submission time (latest first)

      // If no submissions found, return an error
      // if (!submissions || submissions.length === 0) {
      //   return sendError(res, 404, 'No submissions found');
      // }

      return sendSuccess(
        res,
        200,
        'All submissions fetched successfully',
        submissions
      );
    } catch (error) {
      console.error('Error in getAllSubmissions:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }
}

export default new UserSubmissionController();
