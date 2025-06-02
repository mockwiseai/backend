import mongoose, { Document, Schema } from "mongoose"

export interface IInterview extends Document {
  title: string
  recruiterId: mongoose.Types.ObjectId
  questions: {
    questionId: mongoose.Types.ObjectId
    questionType: "CodingQuestion" | "SystemDesign" | "BehavioralQuestion"
  }[]
  jobRole: string
  totalTime: number
  uniqueLink: string
  scheduleDate: Date // Added schedule date field
  candidates: {
    email: string
    name: string
    questionsAttempted: number
    questionsCompleted: number
    questionsInProgress: number
    submittedAt?: Date | null
    status: "pending" | "completed" | "in-progress"
  }[]
  status: "draft" | "published" | "completed"
  createdAt: Date
  updatedAt: Date
}

const InterviewSchema = new Schema<IInterview>({
  title: { type: String, required: true },
  recruiterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questions: [
    {
      questionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "InterviewQuestion",
        required: true,
      },
      questionType: {
        type: String,
        enum: ["CodingQuestion", "SystemDesign", "BehavioralQuestion"],
        required: true,
      },
    },
  ],
  jobRole: { type: String, required: true },
  totalTime: { type: Number, required: true },
  uniqueLink: { type: String, required: true, unique: true },
  scheduleDate: { type: Date, required: true }, // Added schedule date field
  candidates: [
    {
      email: { type: String, required: true },
      name: { type: String, required: true },
      questionsAttempted: { type: Number, default: 0 },
      questionsCompleted: { type: Number, default: 0 },
      questionsInProgress: { type: Number, default: 0 },
      submittedAt: { type: Date, nullable: true, allowNull: true },
      status: {
        type: String,
        enum: ["pending", "completed", "in-progress"],
        default: "pending",
      },
    },
  ],
  status: {
    type: String,
    enum: ["draft", "published", "completed"],
    default: "draft",
  },
},
  { timestamps: true })

export default mongoose.model<IInterview>("Interview", InterviewSchema)
