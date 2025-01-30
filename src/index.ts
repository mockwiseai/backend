import express, { Request, Response } from 'express';
import cors from 'cors';
import { config } from './config/config';
import { connectDB } from './config/database';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import compilerRoutes from './routes/compilerRoutes';
import questionRoutes from './routes/questionRoutes';
import submissionRoutes from './routes/userSubmission.routes';
import candidateRoutes from './routes/candidateRoutes';
import invitationRoutes from './routes/invitationRoutes';
import aiRoutes from './routes/aiRoutes';
import interviewRoutes from './routes/interviewRoutes';

import { errorHandler } from './middleware/error';
import logger from './utils/logger';
import path from 'path';
import fs from 'fs/promises';

const app = express();

// Create temp directory for compiler if it doesn't exist
const TEMP_DIR = path.join(process.cwd(), 'temp');
(async () => {
  try {
    await fs.access(TEMP_DIR);
  } catch {
    await fs.mkdir(TEMP_DIR);
    logger.info('Created temp directory for compiler');
  }
})();

// Middleware
app.use(
  cors({
    origin: 'http://localhost:3000', // Allow frontend domain
    credentials: true,
  })
);
app.use(express.json({ limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/compiler', compilerRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/invitation', invitationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/recruiter/interviews', interviewRoutes);


// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
  });
});

// Compiler health check
app.get('/api/compiler/health', (req, res) => {
  res.json({
    status: 'OK',
    compilerReady: true,
    supportedLanguages: ['javascript', 'python', 'java', 'cpp'],
    tempDirectory: TEMP_DIR,
    timestamp: new Date().toISOString(),
  });
});

// Error Handler
app.use(errorHandler);

// Start server
const startServer = async () => {
  try {
    await connectDB();

    // Verify compiler dependencies
    const verifyCompilerDependencies = async () => {
      const { exec } = require('child_process');
      const util = require('util');
      const execAsync = util.promisify(exec);

      try {
        await execAsync('node --version');
        await execAsync('python3 --version');
        await execAsync('java --version');
        await execAsync('g++ --version');
        logger.info('All compiler dependencies verified');
      } catch (error) {
        logger.warn('Some compiler dependencies are missing:', error);
      }
    };

    await verifyCompilerDependencies();

    app.listen(config.port, () => {
      logger.info(`Server running on port ${config.port}`);
      logger.info(`API available at http://localhost:${config.port}`);
      logger.info(`Environment: ${config.nodeEnv}`);
      logger.info(
        `Compiler service ready at http://localhost:${config.port}/api/compiler`
      );
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle cleanup on shutdown
process.on('SIGINT', async () => {
  try {
    // Cleanup temp directory
    const files = await fs.readdir(TEMP_DIR);
    await Promise.all(
      files.map((file) => fs.unlink(path.join(TEMP_DIR, file)))
    );
    logger.info('Cleaned up compiler temp directory');
    process.exit(0);
  } catch (error) {
    logger.error('Error during cleanup:', error);
    process.exit(1);
  }
});

startServer();

export default app;
