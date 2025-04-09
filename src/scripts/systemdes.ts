#!/usr/bin/env node
// scripts/import-system-design.ts

import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load env variables from .env file (create if it doesn't exist)
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Import model - adjust path as needed based on your project structure
import SystemDesignQuestion from '../models/systemdesignQuestion.model';

// MongoDB connection string - read from .env or use default
const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/interview-platform';

// Connect to MongoDB
const connectDB = async () => {
    try {
        const conn = await mongoose.connect(MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error(`Error connecting to MongoDB: ${error instanceof Error ? error.message : 'Unknown error'}`);
        process.exit(1);
    }
};

// Function to import data from JSON file
const importData = async (filePath: string) => {
    try {
        // Check if file exists
        if (!fs.existsSync(filePath)) {
            console.error(`File not found: ${filePath}`);
            process.exit(1);
        }

        // Read data from file
        const rawData = fs.readFileSync(filePath, 'utf8');
        let questions = [];

        try {
            questions = JSON.parse(rawData);
            console.log(questions);
            
        } catch (error) {
            console.error('Error parsing JSON file:', error);
            process.exit(1);
        }

        if (!Array.isArray(questions)) {
            console.error('Data is not an array. Expected an array of system design questions.');
            process.exit(1);
        }

        console.log(`Found ${questions.length} system design questions to import...`);

        // Process each question for import
        const processedQuestions = questions.map((question: any) => {
            // Map fields from your scraped data to the model schema
            return {
                title: question.title,
                description: question.description,
                difficulty: question.difficulty || 'medium', // default to medium if not specified
                solutions: question.solutions || {},
                starter: question.starter || {},
                problemPathName: question.problemPathName || question.title.toLowerCase().replace(/\s+/g, '-'),
                tags: question.tags || [],
                status: question.status,
                isFree: question.isFree !== undefined ? question.isFree : true,
                type: question.type || 'system-design',
                show: question.show !== undefined ? question.show : true,
                category: question.category || [],
                hasEditorialSolution: question.hasEditorialSolution || false,
                hasSharedSolution: question.hasSharedSolution || false
            };
        });

        const operation = process.argv.includes('--append') ? 'append' : 'replace';

        if (operation === 'replace') {
            // Clear existing data
            console.log('Clearing existing system design questions...');
            await SystemDesignQuestion.deleteMany({});
        }

        // Insert new data
        console.log(`${operation === 'append' ? 'Appending' : 'Importing'} new data...`);

        if (process.argv.includes('--upsert')) {
            // Upsert mode - update existing or insert new
            console.log('Using upsert mode...');
            const operations = processedQuestions.map(question => ({
                updateOne: {
                    filter: { problemPathName: question.problemPathName },
                    update: { $set: question },
                    upsert: true
                }
            }));

            const result = await SystemDesignQuestion.bulkWrite(operations);
            console.log(`Bulk upsert result: ${result.upsertedCount} inserted, ${result.modifiedCount} modified`);
        } else {
            // Regular insert
            await SystemDesignQuestion.insertMany(processedQuestions);
            console.log(`Inserted ${processedQuestions.length} questions`);
        }

        console.log('Data import completed successfully!');
    } catch (error) {
        console.error('Error importing data:', error);
        process.exit(1);
    }
};

// Function to delete all data
const deleteData = async () => {
    try {
        await SystemDesignQuestion.deleteMany({});
        console.log('All system design questions deleted successfully!');
    } catch (error) {
        console.error('Error deleting data:', error);
        process.exit(1);
    }
};

// Function to list basic stats
const listStats = async () => {
    try {
        const totalCount = await SystemDesignQuestion.countDocuments();
        const countByDifficulty = await SystemDesignQuestion.aggregate([
            { $group: { _id: '$difficulty', count: { $sum: 1 } } }
        ]);

        console.log(`\nSystem Design Questions Statistics:`);
        console.log(`Total questions: ${totalCount}`);
        console.log('\nBy difficulty:');
        countByDifficulty.forEach(item => {
            console.log(`  ${item._id}: ${item.count}`);
        });

        console.log('\nLatest 5 questions:');
        const latestQuestions = await SystemDesignQuestion.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('title difficulty');

        latestQuestions.forEach(q => {
            console.log(`  - ${q.title} (${q.difficulty})`);
        });
    } catch (error) {
        console.error('Error getting stats:', error);
    }
};

// Main function
const main = async () => {
    // Connect to MongoDB
    const conn = await connectDB();

    try {
        const command = process.argv[2];

        if (!command) {
            console.log(`
Usage: 
  npm run import-system-design -- <command> [options]

Commands:
  import <file>     Import system design questions from JSON file
  delete           Delete all system design questions
  stats            Show statistics about system design questions
  help             Show this help message

Options for import:
  --append         Add to existing data (don't delete current data)
  --upsert         Update existing questions, insert new ones

Examples:
  npm run import-system-design -- import ./data/system-design-questions.json
  npm run import-system-design -- import ./data/new-questions.json --append
  npm run import-system-design -- import ./data/update-questions.json --upsert
  npm run import-system-design -- delete
  npm run import-system-design -- stats
      `);
            process.exit(0);
        }

        switch (command) {
            case 'import':
                const filePath = process.argv[3];
                if (!filePath) {
                    console.error('Please provide a file path');
                    process.exit(1);
                }
                await importData(filePath);
                break;

            case 'delete':
                await deleteData();
                break;

            case 'stats':
                await listStats();
                break;

            case 'help':
                console.log(`
Usage: 
  npm run import-system-design -- <command> [options]

Commands:
  import <file>     Import system design questions from JSON file
  delete           Delete all system design questions
  stats            Show statistics about system design questions
  help             Show this help message

Options for import:
  --append         Add to existing data (don't delete current data)
  --upsert         Update existing questions, insert new ones

Examples:
  npm run import-system-design -- import ./data/system-design-questions.json
  npm run import-system-design -- import ./data/new-questions.json --append
  npm run import-system-design -- import ./data/update-questions.json --upsert
  npm run import-system-design -- delete
  npm run import-system-design -- stats
        `);
                break;

            default:
                console.error(`Unknown command: ${command}`);
                process.exit(1);
        }
    } finally {
        // Close MongoDB connection
        await conn.disconnect();
        console.log('MongoDB connection closed');
    }
};

// Run the script
main()
    .then(() => process.exit(0))
    .catch(err => {
        console.error('Error:', err);
        process.exit(1);
    });