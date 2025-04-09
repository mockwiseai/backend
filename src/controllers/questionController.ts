import { Request, Response } from 'express';
import CodingQuestion from '../models/codingQuestion.model';
import BehavioralQuestion from '../models/behavioralQuestion.model';
import UserSubmission from '../models/userSubmission.model';
import { sendSuccess, sendError } from '../utils/responses';

class QuestionController {
  // Get random coding question
  async getRandomCodingQuestion(req: Request, res: Response) {
    try {
      const { difficulty } = req.query;
      const query =
        difficulty && difficulty !== 'random'
          ? { difficulty: difficulty.toString().toLowerCase() }
          : {};

      const count = await CodingQuestion.countDocuments(query);

      if (count === 0) {
        return sendError(
          res,
          404,
          'No coding questions found for the specified difficulty'
        );
      }

      const random = Math.floor(Math.random() * count);
      const question = await CodingQuestion.findOne(query).skip(random);

      if (!question) {
        return sendError(res, 404, 'Coding question not found');
      }

      return sendSuccess(
        res,
        200,
        'Coding question fetched successfully',
        question
      );
    } catch (error) {
      console.error('Error in getRandomCodingQuestion:', error);
      return sendError(res, 500, 'Error fetching coding question');
    }
  }

  async getAllCodingQuestion(req: any, res: Response) {
    try {
      const userId = req.user?.userId;
      if (!userId) {
        return sendError(res, 400, 'User ID is required');
      }
  
      const { difficulty, title, page = 1, limit = 10 } = req.query;
      const filter: any = {};
  
      if (difficulty) {
        filter.difficulty = difficulty;
      }
      if (title) {
        filter.title = { $regex: title, $options: 'i' }; // Case-insensitive search
      }
  
      const totalQuestions = await CodingQuestion.countDocuments(filter);
  
      if (totalQuestions === 0) {
        return sendError(res, 404, 'No coding questions found');
      }
  
      const questions = await CodingQuestion.find(filter)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));
  
  
      // For each question, check if a submission exists for the user
      const questionsWithSolvedStatus = await Promise.all(
        questions.map(async (question) => {
          const userSubmission = await UserSubmission.findOne({
            userId,
            questionId: question._id,
            questionType: 'CodingQuestion',
          });
  
          return {
            ...question.toObject(),
            solved: !!userSubmission,
          };
        })
      );
  
      return sendSuccess(res, 200, 'Coding questions fetched successfully', {
        totalQuestions,
        currentPage: page,
        totalPages: Math.ceil(totalQuestions / limit),
        questions: questionsWithSolvedStatus,
      });
    } catch (error) {
      console.error('Error in getAllCodingQuestion:', error);
      return sendError(res, 500, 'Error fetching coding questions');
    }
  }
  

  async getAllBehaviourQuestion(req: any, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return sendError(res, 400, 'User ID is required');
      }

      const count = await BehavioralQuestion.countDocuments();

      if (count === 0) {
        return sendError(res, 404, 'No coding questions found');
      }

      const questions = await BehavioralQuestion.find();

      if (questions.length === 0) {
        return sendError(res, 404, 'Coding questions not found');
      }

      // For each question, check if a submission exists for the user
      const questionsWithSolvedStatus = await Promise.all(
        questions.map(async (question) => {
          const userSubmission = await UserSubmission.findOne({
            userId,
            questionId: question._id,
            questionType: 'BehavioralQuestion',
          });

          return {
            ...question.toObject(), // Convert Mongoose document to plain object
            answered: !!userSubmission, // True if submission exists, otherwise false
            userAnswer: userSubmission?.userAnswer || null,
          };
        })
      );

      return sendSuccess(
        res,
        200,
        'Coding questions fetched successfully',
        questionsWithSolvedStatus
      );
    } catch (error) {
      console.error('Error in getRandomCodingQuestion:', error);
      return sendError(res, 500, 'Error fetching coding question');
    }
  }

  // Get random behavioral question
  async getRandomBehavioralQuestion(req: Request, res: Response) {
    try {
      const { tag } = req.query;
      const query = tag ? { tag: tag.toString().toLowerCase() } : {};

      const count = await BehavioralQuestion.countDocuments(query);

      if (count === 0) {
        return sendError(
          res,
          404,
          'No behavioral questions found for the specified tag'
        );
      }

      const random = Math.floor(Math.random() * count);
      const question = await BehavioralQuestion.findOne(query).skip(random);

      if (!question) {
        return sendError(res, 404, 'Behavioral question not found');
      }

      return sendSuccess(
        res,
        200,
        'Behavioral question fetched successfully',
        question
      );
    } catch (error) {
      console.error('Error in getRandomBehavioralQuestion:', error);
      return sendError(res, 500, 'Error fetching behavioral question');
    }
  }

  // Create a new coding question
  async createCodingQuestion(req: Request, res: Response) {
    try {
      const newQuestion = new CodingQuestion(req.body);
      const savedQuestion = await newQuestion.save();
      return sendSuccess(
        res,
        200,
        'Coding question added successfully',
        savedQuestion
      );
    } catch (error) {
      console.error('Error in createCodingQuestion:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  // Create a new behavioral question
  async createBehavioralQuestion(req: Request, res: Response) {
    try {
      const newQuestion = new BehavioralQuestion(req.body);
      const savedQuestion = await newQuestion.save();
      return sendSuccess(
        res,
        200,
        'Behavioral question added successfully',
        savedQuestion
      );
    } catch (error) {
      console.error('Error in createBehavioralQuestion:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  // Get question by ID
  async getQuestionById(req: Request, res: Response) {
    let question;
    try {
      question = await CodingQuestion.findById(req.params.id);
      if (!question) {
        question = await BehavioralQuestion.findById(req.params.id);
      }
      if (!question) {
        return sendError(res, 404, 'Question not found');
      }
      return sendSuccess(res, 200, 'Question fetched successfully', question);
    }
    catch (error) {
      console.error('Error in getQuestionById:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }
}

export default new QuestionController();
