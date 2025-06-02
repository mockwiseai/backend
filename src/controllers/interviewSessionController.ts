// controllers/interviewSession.controller.ts

import { Request, Response } from 'express';
import Interview from '../models/Interview';
import CandidateSubmission from '../models/candidateSubmission.model';
import mongoose from 'mongoose';

// Get interview details with questions
export const getInterviewSession = async (req: Request, res: Response) => {
  try {
    const interview = await Interview.findOne({
      uniqueLink: req.params.interviewId
    })
      .populate({
        path: 'questions.questionId',
        model: 'InterviewQuestion',
        select: 'title description difficulty testCases' // Add any other fields you need
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview session not found'
      });
    }

    // Transform the Mongoose document into a plain object
    const interviewObj = interview.toObject();

    let quess = interviewObj.questions as any;

    // Format the questions array
    const formattedQuestions = quess.map((q: any) => ({
      questionId: q.questionId._id,
      title: q.questionId?.title,
      description: q.questionId?.description,
      difficulty: q.questionId?.difficulty,
      questionType: q.questionType,
      testCases: q.questionId?.testCases // If you have test cases
    }));

    let submission = await CandidateSubmission.findOne({
      interviewId: interviewObj._id,
      email: req.query.email
    })
    
    let startDate = submission?.initiatedAt;
    let nowDate = Date.now()

    let timeLeft = startDate ? Number(startDate) - nowDate : null;

    // Create the response object with the formatted data
    const sessionData = {
      id: interviewObj._id,
      title: interviewObj.title,
      totalTime: interviewObj.totalTime,
      remainingTime: timeLeft,
      jobRole: interviewObj.jobRole,
      status: interviewObj.status,
      questions: formattedQuestions,
      candidates: interviewObj.candidates,
      createdAt: interviewObj.createdAt,
      updatedAt: interviewObj.updatedAt,
      submission: submission
    };

    res.json({
      success: true, 
      data: sessionData
    });
  } catch (error) {
    console.error('Error in getInterviewSession:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching interview session',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Update interview status (when starting a question)
export const updateInterviewStatus = async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const interview = await Interview.findOneAndUpdate(
      { uniqueLink: req.params.interviewId },
      {
        $set: { status },
        // Update candidate status if needed
        'candidates.$[candidate].status': status
      },
      {
        new: true,
        arrayFilters: [{ 'candidate.email': req.body.email }]
      }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // create a new submission if it doesn't exist
    if (status === 'started') {
      const submission = new CandidateSubmission({
        interviewId: interview._id,
        email: req.body.email,
        name: req.body.name,
        answers: [],
        status: 'started',
        initiatedAt: Date.now()
      });

      await submission.save();
    }

    // start the timer if status is 'started'
    if (status === 'started') {
      setTimeout(() => {
        let updatedStatus = 'completed';
        // Update interview status
        Interview.findOneAndUpdate(
          { uniqueLink: req.params.interviewId },
          {
            $set: {
              'candidates.$[candidate].status': updatedStatus
            }
          },
          {
            new: true,
            arrayFilters: [{ 'candidate.email': req.body.email }]
          }
        );

        // Update submission status
        CandidateSubmission.findOneAndUpdate(
          {
            interviewId: interview._id,
            email: req.body.email
          },
          {
            $set: {
              status: updatedStatus,
              submittedAt: new Date()
            }
          },
          { new: true }
        );
      }, interview.totalTime * 60 * 1000); // Convert minutes to milliseconds
    }

    res.json({ success: true, data: interview });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating interview status',
      error
    });
  }
};

// Submit answer for a question
export const submitAnswer = async (req: Request, res: Response) => {
  try {
    const { interviewId, email, name, answers } = req.body;

    // Check if we're getting the correct structure
    if (!answers || !Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Missing or invalid answers array'
      });
    }

    // Find existing submission or create new one
    let submission = await CandidateSubmission.findOne({
      interviewId,
      email
    });

    if (!submission) {
      submission = new CandidateSubmission({
        interviewId,
        email,
        name,
        answers: [],
        status: 'pending',
        initiatedAt: Date.now()
      });
    }

    let newAnswersCount = 0;

    // Process each answer in the answers array
    for (const answer of answers) {
      const { questionId, questionType, response } = answer;
      
      // Convert string ID to ObjectId (this is crucial!)
      const questionObjectId = new mongoose.Types.ObjectId(questionId);
      
      // Check if question already answered
      let questionExists = submission.answers.find(a => 
        a.questionId.toString() === questionObjectId.toString()
      );
      
      if (questionExists) {
        return res.status(400).json({
          success: false,
          message: 'Answer already submitted for this question'
        });
      }
      
      // Add the new answer with proper ObjectId conversion
      submission.answers.push({
        questionId: questionObjectId,
        questionType,
        response,
        testCaseResults: questionType === 'CodingQuestion' ? [] : undefined
      });

      // Increment counter for new answers
      newAnswersCount++;
    }

    submission.status = 'completed';
    submission.submittedAt = new Date();
    await submission.save();

    // Now update the candidate's status in the Interview document
    const interviewObjectId = new mongoose.Types.ObjectId(interviewId);
    
    const interview = await mongoose.model('Interview').findById(interviewObjectId);
    
    if (interview) {
      // Find the candidate in the candidates array
      const candidateIndex = interview.candidates.findIndex(
        ( candidate: { email: any; }) => candidate.email === email
      );
      
      if (candidateIndex !== -1) {
        // Update the candidate's status to 'completed'
        interview.candidates[candidateIndex].status = 'completed';

        // Update the candidate's submission date
        interview.candidates[candidateIndex].submittedAt = new Date();

        // Increment question counters
        interview.candidates[candidateIndex].questionsAttempted += newAnswersCount;
        interview.candidates[candidateIndex].questionsCompleted += newAnswersCount;
        
        // If they had questions in progress, reduce that count (optional)
        if (interview.candidates[candidateIndex].questionsInProgress >= newAnswersCount) {
          interview.candidates[candidateIndex].questionsInProgress -= newAnswersCount;
        } else {
          interview.candidates[candidateIndex].questionsInProgress = 0;
        }
        await interview.save();
      }
    }
    res.json({ success: true, data: submission });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error
    });
  }
};

// Complete interview
export const completeInterview = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    // Update interview status
    const interview = await Interview.findOneAndUpdate(
      { uniqueLink: req.params.interviewId },
      {
        $set: {
          'candidates.$[candidate].status': 'completed'
        }
      },
      {
        new: true,
        arrayFilters: [{ 'candidate.email': email }]
      }
    );

    if (!interview) {
      return res.status(404).json({
        success: false,
        message: 'Interview not found'
      });
    }

    // Update submission status
    const submission = await CandidateSubmission.findOneAndUpdate(
      {
        interviewId: interview._id,
        email
      },
      {
        $set: {
          status: 'completed',
          submittedAt: new Date()
        }
      },
      { new: true }
    );

    if (!interview || !submission) {
      return res.status(404).json({
        success: false,
        message: 'Interview or submission not found'
      });
    }

    res.json({
      success: true,
      data: { interview, submission }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error completing interview',
      error
    });
  }
};

// Get interview progress
export const getInterviewProgress = async (req: Request, res: Response) => {
  try {
    const { interviewId, email } = req.params;

    const submission = await CandidateSubmission.findOne({
      interviewId,
      email
    });

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'No submission found'
      });
    }

    const progress = {
      totalQuestions: submission.answers.length,
      completedQuestions: submission.answers.map(a => a.questionId),
      status: submission.status,
      timeRemaining: Number(submission.initiatedAt) + 60 * 1000 - Date.now()
    };

    res.json({ success: true, data: progress });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching interview progress',
      error
    });
  }
};