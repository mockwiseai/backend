import mongoose, { Document, Schema } from "mongoose";

export interface IInterviewInvitation extends Document {
  interviewId: mongoose.Types.ObjectId;
  recruiterId: mongoose.Types.ObjectId;
  email: string;
  name: string;
  token: string;
  expiresAt: Date;
  status: "pending" | "accepted" | "expired";
  createdAt: Date;
  updatedAt: Date;
}

const InterviewInvitationSchema = new Schema<IInterviewInvitation>(
  {
    interviewId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Interview",
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    email: { type: String, required: true },
    name: { type: String, required: true },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model<IInterviewInvitation>(
  "InterviewInvitation",
  InterviewInvitationSchema
);
