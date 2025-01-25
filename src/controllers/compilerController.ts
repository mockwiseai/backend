import { Request, Response } from 'express';
import axios from 'axios';

const JUDGE0_API = process.env.JUDGE0_API_URL;
const RAPID_API_KEY = process.env.RAPID_API_KEY;

// Define language type
type SupportedLanguage = 'python' | 'javascript' | 'java' | 'cpp';

// Language IDs for Judge0 API
const LANGUAGE_IDS: Record<SupportedLanguage, number> = {
  python: 71,    // Python (3.8.1)
  javascript: 63, // JavaScript (Node.js 12.14.0)
  java: 62,      // Java (OpenJDK 13.0.1)
  cpp: 54        // C++ (GCC 9.2.0)
};

export const runCode = async (req: Request, res: Response) => {
  try {
    const { code, language, input } = req.body;

    // Type check for language
    if (!isValidLanguage(language)) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    // Create submission
    const submissionResponse = await axios.post(`${JUDGE0_API}/submissions`, {
      source_code: code,
      language_id: LANGUAGE_IDS[language],
      stdin: input
    }, {
      headers: {
        'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
        'X-RapidAPI-Key': RAPID_API_KEY
      }
    });

    const token = submissionResponse.data.token;

    // Get submission result
    let result;
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const resultResponse = await axios.get(`${JUDGE0_API}/submissions/${token}`, {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': RAPID_API_KEY
        }
      });

      if (resultResponse.data.status.id <= 2) { // Processing
        attempts++;
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }

      result = resultResponse.data;
      break;
    }

    if (!result) {
      return res.status(408).json({ error: 'Execution timeout' });
    }

    // Handle different status codes
    if (result.status.id === 3) { // Accepted
      res.json({
        output: result.stdout || '',
        error: null,
        executionTime: result.time,
        memory: result.memory
      });
    } else {
      res.json({
        output: null,
        error: result.stderr || result.compile_output || 'Execution error',
        status: result.status.description
      });
    }

  } catch (error) {
    console.error('Compiler error:', error);
    res.status(500).json({
      error: 'Failed to execute code'
    });
  }
};

// Type guard for language validation
function isValidLanguage(language: any): language is SupportedLanguage {
  return ['python', 'javascript', 'java', 'cpp'].includes(language);
}