import ProctoringLog from '@models/proctoringLog.model';
import { Request, Response } from 'express';


// Log a proctoring event (e.g., tab-switch, face detection, audio alert)
export const logProctoringEvent = async (req: Request, res: Response) => {
  try {
    const { interviewId, email, name, eventType, details } = req.body;

    const proctoringLog = new ProctoringLog({
      interviewId,
      email,
      name,
      eventType,
      details,
      eventTimestamp: new Date(),
    });

    await proctoringLog.save();

    res.status(201).json({ success: true, message: 'Proctoring event logged' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error logging proctoring event',
      error: error
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
