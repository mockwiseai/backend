import { connectDB, disconnectDB } from '../config/database';
import codingQuestionModel from '../models/codingQuestion.model';
const questions = require('../data/questions.json');

async function populateDatabase() {
  try {
    await connectDB();

    console.log('Clearing existing questions...');
    await codingQuestionModel.deleteMany({});

    console.log('Inserting new questions...');
    await codingQuestionModel.insertMany(questions);

    console.log('Database populated successfully');
  } catch (error) {
    console.error('Error populating database:', error);
  } finally {
    await disconnectDB();
  }
}

populateDatabase();
