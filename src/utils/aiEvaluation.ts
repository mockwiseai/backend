import { ICandidateSubmission } from '../models/candidateSubmission.model';

// Analyze behavioral responses using basic sentiment analysis
export const analyzeBehavioralResponses = (answers: ICandidateSubmission['answers']) => {
  let positiveKeywords = ['teamwork', 'leadership', 'problem-solving', 'initiative', 'communication'];
  let negativeKeywords = ['conflict', 'failure', 'difficulties', 'struggle', 'weakness'];
  let score = 0;

  answers.forEach(answer => {
    positiveKeywords.forEach(keyword => {
      if (answer.response.toLowerCase().includes(keyword)) score++;
    });
    negativeKeywords.forEach(keyword => {
      if (answer.response.toLowerCase().includes(keyword)) score--;
    });
  });

  return score > 0 ? 'Positive response' : 'Needs improvement';
};

// Analyze coding performance by checking test case results
export const analyzeCodingPerformance = (answers: ICandidateSubmission['answers']) => {
  let totalCases = 0;
  let passedCases = 0;

  answers.forEach(answer => {
    if (answer.testCaseResults) {
      totalCases += answer.testCaseResults.length;
      passedCases += answer.testCaseResults.filter(tc => tc.isPassed).length;
    }
  });

  if (totalCases === 0) return 'No coding tests were attempted';

  const percentage = (passedCases / totalCases) * 100;
  return percentage > 80 ? 'Excellent coding skills' : percentage > 50 ? 'Good coding skills' : 'Needs improvement';
};

// Generate overall feedback based on behavioral and coding evaluations
export const generateOverallFeedback = (behavioral: string, coding: string) => {
  return `Behavioral: ${behavioral}, Coding: ${coding}`;
};
