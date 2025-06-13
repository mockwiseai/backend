import express from 'express';
import {
    getAllSystemDesignQuestions,
    getSystemDesignQuestionById,
    getSystemDesignQuestionByPath,
    createSystemDesignQuestion,
    bulkImportSystemDesignQuestions,
    updateSystemDesignQuestion,
    deleteSystemDesignQuestion,
    getSystemDesignStats
} from '../controllers/systemdesignController';
import { isAuthenticated } from 'middleware/auth';

const router = express.Router();

// Public routes
// router.use(isAuthenticated)
router.get('/', getAllSystemDesignQuestions);
router.get('/stats', getSystemDesignStats);
router.get('/id/:id', getSystemDesignQuestionById);
router.get('/path/:pathName', getSystemDesignQuestionByPath);

// Protected routes (admin only)

router.post('/', createSystemDesignQuestion);
router.post('/bulk', bulkImportSystemDesignQuestions);
router.put('/:id', updateSystemDesignQuestion);
router.delete('/:id', deleteSystemDesignQuestion);

export default router;