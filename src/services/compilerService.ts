import axios from 'axios';

const JUDGE0_API = 'https://judge0-ce.p.rapidapi.com';

export const compilerService = {
  async executeCode(code: string, language: string) {
    try {
      // Using Judge0 API
      const response = await axios.post(`${JUDGE0_API}/submissions`, {
        source_code: code,
        language_id: this.getLanguageId(language),
      }, {
        headers: {
          'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
          'X-RapidAPI-Key': process.env.RAPID_API_KEY,
        },
      });

      // Get submission result
      const result = await axios.get(
        `${JUDGE0_API}/submissions/${response.data.token}`,
        {
          headers: {
            'X-RapidAPI-Host': 'judge0-ce.p.rapidapi.com',
            'X-RapidAPI-Key': process.env.RAPID_API_KEY,
          },
        }
      );

      return {
        output: result.data.stdout || '',
        error: result.data.stderr || result.data.compile_output || '',
        status: result.data.status.description,
      };
    } catch (error) {
      throw new Error('Code execution failed');
    }
  },

  getLanguageId(language: string): number {
    const languageIds: Record<string, number> = {
      javascript: 63,
      python: 71,
      java: 62,
      cpp: 54,
    };
    return languageIds[language] || 63;
  },
};