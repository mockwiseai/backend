import mongoose, { Document } from 'mongoose';

export interface ISubscriptionPlan extends Document {
  name: string;
  price: number;
  description: string[];
  isPopular: boolean;
}

const SubscriptionPlanSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: [{ type: String, required: true }],
  isPopular: { type: Boolean, default: false },
});

export default mongoose.model<ISubscriptionPlan>(
  'SubscriptionPlan',
  SubscriptionPlanSchema
);
