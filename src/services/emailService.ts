// utils/emailSender.ts
// services/emailSender.ts
// services/emailSender.ts
import axios from "axios";

const RESEND_API_KEY = process.env.RESEND_API_KEY!;

export const sendEmail = async ({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) => {
  try {
    const res = await axios.post(
      "https://api.resend.com/emails",
      {
        from: "onboarding@resend.dev", // Use Resend's verified address
        to,
        subject,
        html,
      },
      {
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return true;
  } catch (error: any) {
    console.error(
      "Error sending email:",
      error.response?.data || error.message
    );
    return false;
  }
};




export const generateInvitationEmail = (
  interviewTitle: string,
  interviewType: string,
  companyName: string,
  duration: number,
  questionCount: number,
  interviewLink: string,
  expirationDate: string
) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4f46e5;">Interview Invitation</h2>
      <p>You've been invited to complete a ${interviewType} interview for ${companyName}.</p>
      
      <h3 style="color: #4f46e5;">Interview Details:</h3>
      <ul>
        <li><strong>Title:</strong> ${interviewTitle}</li>
        <li><strong>Estimated Duration:</strong> ${duration} minutes</li>
        <li><strong>Total Questions:</strong> ${questionCount}</li>
      </ul>
      
      <p>To begin your interview, please click the button below:</p>
      <a href="${interviewLink}" style="display: inline-block; background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">
        Start Interview
      </a>
      
      <p>Please complete this interview by ${expirationDate}.</p>
      
      <p>If you have any questions, feel free to reach out to us.</p>
      
      <p>Best regards,<br/>${companyName} Team</p>
    </div>
  `;
};