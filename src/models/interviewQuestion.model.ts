import mongoose, { Document, ObjectId } from 'mongoose';

export interface ICodingTestCase {
    _id: ObjectId;
    input: string;
    output: string;
    isHidden: boolean;
}

export interface IInterviewQuestion extends Document {
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

const InterviewQuestionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    recruiterId: { type: mongoose.Types.ObjectId, ref: 'User' },
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

export default mongoose.model<IInterviewQuestion>(
    'InterviewQuestion',
    InterviewQuestionSchema
);
