import mongoose, { Document, ObjectId } from 'mongoose';

export interface ICodingTestCase {
  _id: ObjectId;
  input: string;
  output: string;
  isHidden: boolean;
}

export interface ICodingQuestion extends Document {
  title: string;
  difficulty: 'easy' | 'medium' | 'hard';
  description: string;
  examples: {
    input: string;
    output: string;
    explanation: string;
  }[];
  starterCode: {
    python: string;
    javascript: string;
    java: string;
    cpp: string;
  };
  testCases: ICodingTestCase[];
}

const CodingQuestionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true,
  },
  description: { type: String, required: true },
  examples: [
    {
      input: String,
      output: String,
      explanation: String,
    },
  ],
  starterCode: {
    python: String,
    javascript: String,
    java: String,
    cpp: String,
  },
  testCases: [
    {
      input: String,
      output: String,
      isHidden: Boolean,
    },
  ],
});

export default mongoose.model<ICodingQuestion>(
  'CodingQuestion',
  CodingQuestionSchema
);
