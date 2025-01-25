import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidateInterview extends Document {
  interviewId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'in-progress' | 'completed' | 'not-started';
  score: number;
  aiEvaluation: {
    behavioralAnalysis: string;
    codingPerformance: string;
    overallFeedback: string;
  };
}

const CandidateInterviewSchema = new Schema<ICandidateInterview>(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    email: { type: String, required: true },
    name: { type: String, required: true },
    startedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'not-started'],
      default: 'not-started',
    },
    score: { type: Number, default: 0 },
    aiEvaluation: {
      behavioralAnalysis: { type: String, default: '' },
      codingPerformance: { type: String, default: '' },
      overallFeedback: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

export default mongoose.model<ICandidateInterview>(
  'CandidateInterview',
  CandidateInterviewSchema
);
