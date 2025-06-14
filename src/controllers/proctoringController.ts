import ProctoringLog from '../models/proctoringLog.model';
import { Request, Response } from 'express';
import mongoose from "mongoose";

// Log a proctoring event (e.g., tab-switch, face detection, audio alert)
// Update the logProctoringEvent function in your backend
// In your backend controller (proctoringLog.controller.ts)
export const logProctoringEvent = async (req: Request, res: Response) => {
  try {
    console.log("Received proctoring log request:", req.body);

    const { interviewId, email, eventType } = req.body;

    if (!interviewId || !email || !eventType) {
      console.log("Missing fields:", {
        received: { interviewId, email, eventType },
        missing: {
          interviewId: !interviewId,
          email: !email,
          eventType: !eventType,
        },
      });
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: " +
          (!interviewId ? "interviewId " : "") +
          (!email ? "email " : "") +
          (!eventType ? "eventType" : ""),
      });
    }

    const proctoringLog = new ProctoringLog({
      interviewId,
      email,
      name: req.body.name || "Unknown Candidate",
      eventType,
      details: req.body.details || "No additional details",
      eventTimestamp: req.body.timestamp || new Date(),
    });

    await proctoringLog.save();

    console.log("Successfully saved proctoring log:", proctoringLog);

    res.status(201).json({
      success: true,
      message: "Event logged successfully",
      logId: proctoringLog._id,
    });
  } catch (error:any) {
    console.error("Error saving proctoring log:", {
      error: error.message,
      stack: error.stack,
      body: req.body,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error while logging proctoring event",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Get all proctoring logs for a specific interview
export const getProctoringLogsByInterview = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const logs = await ProctoringLog.find({ interviewId });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching proctoring logs',
      error: error
    });
  }
};

// Get all proctoring logs for a specific candidate
export const getProctoringLogsByCandidate = async (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const logs = await ProctoringLog.find({ email });

    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching candidate proctoring logs',
      error: error
    });
  }
};

// Analyze proctoring data to flag suspicious activity
export const analyzeProctoringData = async (req: Request, res: Response) => {
  try {
    const { interviewId } = req.params;
    const logs = await ProctoringLog.find({ interviewId });

    const suspiciousActivities = logs.filter((log) =>
      ['tab-switch', 'multiple-faces', 'audio-alert'].includes(log.eventType)
    );

    res.json({
      success: true,
      flaggedEvents: suspiciousActivities,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error analyzing proctoring data',
      error: error
    });
  }
};
