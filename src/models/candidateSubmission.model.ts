import mongoose, { Document, Schema } from 'mongoose';

export interface ICandidateSubmission extends Document {
    interviewId: mongoose.Types.ObjectId;
    email: string;
    name: string;
    answers: {
        questionId: mongoose.Types.ObjectId;
        questionType: 'CodingQuestion' | 'BehavioralQuestion';
        response: string;
        language?: string; // For coding submissions
        testCaseResults?: {
            testCaseId: string;
            isPassed: boolean;
            expectedOutput: string;
            userOutput: string;
        }[];
    }[];
    aiEvaluation: {
        behavioralAnalysis: string;
        codingPerformance: string;
        overallFeedback: string;
    };
    score: number;
    status: 'pending' | 'completed';
    submittedAt?: Date;
    initiatedAt?: Date,
}

const CandidateSubmissionSchema = new Schema<ICandidateSubmission>(
    {
        interviewId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Interview',
            required: true,
        },
        email: { type: String, required: true },
        name: { type: String, required: true },
        answers: [
            {
                questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
                questionType: {
                    type: String,
                    enum: ['CodingQuestion', 'BehavioralQuestion'],
                    required: true,
                },
                response: { type: String, required: true },
                language: { type: String },
                testCaseResults: [
                    {
                        testCaseId: { type: String },
                        isPassed: { type: Boolean },
                        expectedOutput: { type: String },
                        userOutput: { type: String },
                    },
                ],
            },
        ],
        aiEvaluation: {
            behavioralAnalysis: { type: String },
            codingPerformance: { type: String },
            overallFeedback: { type: String },
        },
        score: { type: Number, default: 0 },
        status: {
            type: String,
            enum: ['pending', 'completed'],
            default: 'pending',
        },
        initiatedAt: { type: Date },
        submittedAt: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.model<ICandidateSubmission>(
    'CandidateSubmission',
    CandidateSubmissionSchema
);
