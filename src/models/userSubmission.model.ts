import mongoose, { Document, Schema } from 'mongoose';

export interface IUserSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  questionType: 'CodingQuestion' | 'BehavioralQuestion';
  userAnswer: string;
  language?: string; // For coding questions, store the programming language used (e.g., Python, JavaScript)
  testCaseResults?: {
    testCaseId: string;
    isPassed: boolean;
    expectedOutput: string;
    userOutput: string;
  }[]; // Results for individual test cases for coding questions
  isCorrect: boolean | null; // Whether the solution was correct
  submittedAt: Date; // When the answer was submitted
}

const userSubmissionSchema = new Schema<IUserSubmission>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questionId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'questionType',
      required: true,
    },
    questionType: {
      type: String,
      enum: ['CodingQuestion', 'BehavioralQuestion'],
      required: true,
    },
    userAnswer: { type: String, required: true },
    language: { type: String }, // Programming language for coding submissions
    testCaseResults: [
      {
        testCaseId: { type: String },
        isPassed: { type: Boolean },
        expectedOutput: { type: String },
        userOutput: { type: String },
      },
    ],
    isCorrect: { type: Boolean, default: null }, // Evaluated correctness
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IUserSubmission>(
  'UserSubmission',
  userSubmissionSchema
);
