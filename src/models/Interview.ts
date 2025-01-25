import mongoose, { Document, Schema } from 'mongoose';

export interface IInterview extends Document {
  title: string;
  recruiterId: mongoose.Types.ObjectId;
  questions: {
    questionId: mongoose.Types.ObjectId;
    questionType: 'CodingQuestion' | 'BehavioralQuestion';
  }[];
  jobRole: string;
  totalTime: number;
  uniqueLink: string;
  candidates: {
    email: string;
    name: string;
    status: 'pending' | 'completed' | 'in-progress';
  }[];
  status: 'draft' | 'published' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

const InterviewSchema = new Schema<IInterview>(
  {
    title: { type: String, required: true },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    questions: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: 'questions.questionType',
          required: true,
        },
        questionType: {
          type: String,
          enum: ['CodingQuestion', 'BehavioralQuestion'],
          required: true,
        },
      },
    ],
    jobRole: { type: String, required: true },
    totalTime: { type: Number, required: true },
    uniqueLink: { type: String, required: true, unique: true },
    candidates: [
      {
        email: { type: String, required: true },
        name: { type: String, required: true },
        status: {
          type: String,
          enum: ['pending', 'completed', 'in-progress'],
          default: 'pending',
        },
      },
    ],
    status: {
      type: String,
      enum: ['draft', 'published', 'completed'],
      default: 'draft',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInterview>('Interview', InterviewSchema);
