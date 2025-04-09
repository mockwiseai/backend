import { Request, Response } from 'express';
import SystemDesignQuestion, { ISystemDesignQuestion } from '../models/systemdesignQuestion.model';

// Get all system design questions with optional filtering
export const getAllSystemDesignQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      difficulty, 
      tags, 
      category, 
      isFree, 
      page = 1, 
      limit = 10,
      sort = 'createdAt',
      order = 'desc'
    } = req.query;

    // Build query based on provided filters
    const query: any = { show: true };
    
    if (difficulty) query.difficulty = difficulty;
    if (isFree !== undefined) query.isFree = isFree === 'true';
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    if (category) {
      const categoryArray = Array.isArray(category) ? category : [category];
      query.category = { $in: categoryArray };
    }

    // Count total documents for pagination
    const total = await SystemDesignQuestion.countDocuments(query);
    
    // Parse pagination parameters
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Sort direction
    const sortDirection = order === 'asc' ? 1 : -1;
    const sortOptions: any = {};
    sortOptions[sort as string] = sortDirection;

    // Execute query with pagination
    const questions = await SystemDesignQuestion.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)
      .select('-solutions');  // Exclude solutions from listing

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      data: questions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
};

// Get a specific system design question by ID
export const getSystemDesignQuestionById = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await SystemDesignQuestion.findById(req.params.id);
    
    if (!question) {
      res.status(404).json({
        success: false,
        error: 'Question not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
};

// Get a specific system design question by problemPathName
export const getSystemDesignQuestionByPath = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await SystemDesignQuestion.findOne({ 
      problemPathName: req.params.pathName,
      show: true
    });
    
    if (!question) {
      res.status(404).json({
        success: false,
        error: 'Question not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
};

// Create a new system design question
export const createSystemDesignQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if a question with the same problemPathName already exists
    const existingQuestion = await SystemDesignQuestion.findOne({
      problemPathName: req.body.problemPathName
    });

    if (existingQuestion) {
      res.status(400).json({
        success: false,
        error: 'A question with this path name already exists'
      });
      return;
    }

    const question = await SystemDesignQuestion.create(req.body);
    
    res.status(201).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
};

// Bulk import system design questions
export const bulkImportSystemDesignQuestions = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!Array.isArray(req.body)) {
      res.status(400).json({
        success: false,
        error: 'Request body must be an array of questions'
      });
      return;
    }

    const operations = req.body.map(question => ({
      updateOne: {
        filter: { problemPathName: question.problemPathName },
        update: { $set: question },
        upsert: true
      }
    }));

    const result = await SystemDesignQuestion.bulkWrite(operations);
    
    res.status(200).json({
      success: true,
      message: 'Bulk import completed',
      data: {
        matched: result.matchedCount,
        modified: result.modifiedCount,
        upserted: result.upsertedCount
      }
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
};

// Update a system design question
export const updateSystemDesignQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await SystemDesignQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    
    if (!question) {
      res.status(404).json({
        success: false,
        error: 'Question not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: question
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
};

// Delete a system design question
export const deleteSystemDesignQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const question = await SystemDesignQuestion.findByIdAndDelete(req.params.id);
    
    if (!question) {
      res.status(404).json({
        success: false,
        error: 'Question not found'
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
};

// Get statistics/breakdown of system design questions
export const getSystemDesignStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const difficultyStats = await SystemDesignQuestion.aggregate([
      { $match: { show: true } },
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    const categoryStats = await SystemDesignQuestion.aggregate([
      { $match: { show: true } },
      { $unwind: '$category' },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const tagStats = await SystemDesignQuestion.aggregate([
      { $match: { show: true } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }  // Get top 20 tags
    ]);

    const totalCount = await SystemDesignQuestion.countDocuments({ show: true });
    const freeCount = await SystemDesignQuestion.countDocuments({ show: true, isFree: true });

    res.status(200).json({
      success: true,
      data: {
        total: totalCount,
        free: freeCount,
        premium: totalCount - freeCount,
        byDifficulty: difficultyStats,
        byCategory: categoryStats,
        byTag: tagStats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Server Error'
    });
  }
};