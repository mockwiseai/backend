import crypto from 'crypto';
// import nodemailer from 'nodemailer';
import { config } from '../config/config';

// Function to generate a unique interview link
export const generateUniqueLink = (interviewId: string): string => {
  const token = crypto.randomBytes(32).toString('hex');
  return `${config.frontendUrl}/interview?token=${token}&id=${interviewId}`;
};



// Function to send email invitations
// export const sendEmail = async (to: string, subject: string, text: string): Promise<void> => {
//   const transporter = nodemailer.createTransport({
//     service: 'gmail',
//     auth: {
//       user: config.emailUser,
//       pass: config.emailPassword,
//     },
//   });

//   const mailOptions = {
//     from: config.emailUser,
//     to,
//     subject,
//     text,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log(`Email sent to ${to}`);
//   } catch (error) {
//     console.error(`Failed to send email to ${to}:`, error);
//     throw new Error('Email sending failed');
//   }
// };

// Function to validate interview token
export const validateInterviewToken = (token: string): boolean => {
  return /^[a-f0-9]{64}$/.test(token);
};

// Function to calculate interview time left
export const calculateTimeLeft = (startTime: Date, totalTime: number): number => {
  const currentTime = new Date().getTime();
  const endTime = new Date(startTime).getTime() + totalTime * 60000;
  return Math.max(0, endTime - currentTime);
};
