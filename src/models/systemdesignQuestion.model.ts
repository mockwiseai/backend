import mongoose, { Document, Schema } from 'mongoose';

export interface ISystemDesignQuestion extends Document {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard' | 'advanced'
  solutions: Record<string, any>; // Flexible structure for various solution formats
  starter: Record<string, any>; // Starter templates if any
  problemPathName: string;
  tags: string[];
  status: string | null;
  isFree: boolean;
  type: string;
  show: boolean;
  category: string[];
  hasEditorialSolution: boolean;
  hasSharedSolution: boolean;
}

const SystemDesignQuestionSchema = new Schema({
  title: { type: String, required: true, index: true },
  description: { type: String, required: true },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'advanced'],
    required: true,
    index: true
  },
  solutions: {
    type: Schema.Types.Mixed,
    default: {}
  },
  starter: {
    type: Schema.Types.Mixed,
    default: {}
  },
  problemPathName: { 
    type: String, 
    required: true, 
    unique: true,
    index: true 
  },
  tags: {
    type: [String],
    index: true,
    default: []
  },
  status: { 
    type: String, 
    default: null 
  },
  isFree: { 
    type: Boolean, 
    default: true,
    index: true
  },
  type: { 
    type: String, 
    default: 'system-design',
    index: true
  },
  show: { 
    type: Boolean, 
    default: true 
  },
  category: {
    type: [String],
    index: true,
    default: []
  },
  hasEditorialSolution: { 
    type: Boolean, 
    default: false 
  },
  hasSharedSolution: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true
});

// Create indexes for common query patterns
SystemDesignQuestionSchema.index({ difficulty: 1, isFree: 1 });
SystemDesignQuestionSchema.index({ tags: 1, show: 1 });
SystemDesignQuestionSchema.index({ category: 1, difficulty: 1 });

export default mongoose.model<ISystemDesignQuestion>(
  'SystemDesignQuestion',
  SystemDesignQuestionSchema
);