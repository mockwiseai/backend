import subscriptionPlanController from 'controllers/subscriptionPlanController';
import express from 'express';

const router = express.Router();

// Routes for subscription plans
router.get('/plans', subscriptionPlanController.getAllPlans);
router.get('/plans/:id', subscriptionPlanController.getPlanById);
router.post('/plans', subscriptionPlanController.createPlan);
router.put('/plans/:id', subscriptionPlanController.updatePlan);
router.delete('/plans/:id', subscriptionPlanController.deletePlan);

export default router;
