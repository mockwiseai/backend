import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 8000,
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-platform',
  jwtSecret: process.env.JWT_SECRET || 'your-secret-key',
  nodeEnv: process.env.NODE_ENV || 'development',
  openAiKey: process.env.OPENAI_API_KEY,
  judge0Api: process.env.JUDGE0_API_URL,
  // Add compiler configuration
  compiler: {
    timeoutMs: 10000, // 10 seconds
    maxMemoryMb: 512,
    tempDir: 'temp',
    judge0: {
      apiUrl: process.env.JUDGE0_API_URL,
      apiKey: process.env.RAPID_API_KEY
    }
  },
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
};
