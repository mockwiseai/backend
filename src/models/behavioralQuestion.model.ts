import mongoose, { Document, ObjectId } from 'mongoose';

export interface IBehavioralQuestion extends Document {
  question: string;
  vategory: string;
  description: string;
}

const BehavioralQuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  category: { type: String, required: true },
  description: { type: String, required: true },
});

export default mongoose.model<IBehavioralQuestion>(
  'BehavioralQuestion',
  BehavioralQuestionSchema
);
