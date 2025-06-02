import mongoose, { Document, Schema } from 'mongoose';

export interface IInterviewInvitation extends Document {
  interviewId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  token: string;
  expiresAt: Date;
  status: 'pending' | 'accepted' | 'expired';
  questionsAttempted?: number;
  submittedAt?: Date;
}

const InterviewInvitationSchema = new Schema<IInterviewInvitation>(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Interview',
      required: true,
    },
    name: { type: String, required: true },
    email: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'expired'],
      default: 'pending',
    },
    questionsAttempted: { type: Number, default: 0 },
    submittedAt: { type: Date, nullable: true, allowNull: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInterviewInvitation>(
  'InterviewInvitation',
  InterviewInvitationSchema
);
