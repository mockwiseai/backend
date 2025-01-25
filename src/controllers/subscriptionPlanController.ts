import { Request, Response } from 'express';
import SubscriptionPlan from '../models/subscriptionPlan.model';
import { sendSuccess, sendError } from '../utils/responses';

class SubscriptionPlanController {
  // Get all subscription plans
  async getAllPlans(req: Request, res: Response) {
    try {
      const plans = await SubscriptionPlan.find();
      return sendSuccess(
        res,
        200,
        'Subscription plans fetched successfully',
        plans
      );
    } catch (error) {
      console.error('Error in getAllPlans:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  // Get a subscription plan by ID
  async getPlanById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const plan = await SubscriptionPlan.findById(id);

      if (!plan) {
        return sendError(res, 404, 'Subscription plan not found');
      }

      return sendSuccess(
        res,
        200,
        'Subscription plan fetched successfully',
        plan
      );
    } catch (error) {
      console.error('Error in getPlanById:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  // Create a new subscription plan
  async createPlan(req: Request, res: Response) {
    try {
      const { name, price, description, isPopular } = req.body;

      // Validation
      if (!name || !price || !description) {
        return sendError(res, 400, 'Missing required fields');
      }

      const newPlan = new SubscriptionPlan({
        name,
        price,
        description,
        isPopular,
      });

      const savedPlan = await newPlan.save();
      return sendSuccess(
        res,
        201,
        'Subscription plan created successfully',
        savedPlan
      );
    } catch (error) {
      console.error('Error in createPlan:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  // Update an existing subscription plan
  async updatePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, price, description, isPopular } = req.body;

      const updatedPlan = await SubscriptionPlan.findByIdAndUpdate(
        id,
        { name, price, description, isPopular },
        { new: true, runValidators: true }
      );

      if (!updatedPlan) {
        return sendError(res, 404, 'Subscription plan not found');
      }

      return sendSuccess(
        res,
        200,
        'Subscription plan updated successfully',
        updatedPlan
      );
    } catch (error) {
      console.error('Error in updatePlan:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }

  // Delete a subscription plan
  async deletePlan(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const deletedPlan = await SubscriptionPlan.findByIdAndDelete(id);

      if (!deletedPlan) {
        return sendError(res, 404, 'Subscription plan not found');
      }

      return sendSuccess(
        res,
        200,
        'Subscription plan deleted successfully',
        deletedPlan
      );
    } catch (error) {
      console.error('Error in deletePlan:', error);
      return sendError(res, 500, 'Internal server error');
    }
  }
}

export default new SubscriptionPlanController();
