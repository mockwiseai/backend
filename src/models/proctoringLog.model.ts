import mongoose, { Document, Schema } from 'mongoose';

export interface IProctoringLog extends Document {
  interviewId: string;
  email: string;
  name: string;
  eventType: string;
  eventTimestamp: Date;
  details: string;
}

const ProctoringLogSchema = new Schema<IProctoringLog>(
  {
    interviewId: {
      type: String,
      required: true,
    },
    email: { type: String, required: true },
    name: { type: String, required: true },
    eventType: { type: String, required: true },
    eventTimestamp: { type: Date, default: Date.now },
    details: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model<IProctoringLog>(
  'ProctoringLog',
  ProctoringLogSchema
);
