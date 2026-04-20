import { Schema, model, models, Document } from 'mongoose';

export interface AlertItem extends Document {
  userId: string;
  symbol: string;
  company: string;
  alertType: 'upper' | 'lower';
  threshold: number;
  alertName: string;
  createdAt: Date;
  triggeredAt?: Date;
  isActive: boolean;
}

const AlertSchema = new Schema<AlertItem>({
  userId: {
    type: String,
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  alertType: {
    type: String,
    enum: ['upper', 'lower'],
    required: true
  },
  threshold: {
    type: Number,
    required: true
  },
  alertName: {
    type: String,
    required: true,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  triggeredAt: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

// Compound index for userId and symbol to quickly find alerts for a user/stock
AlertSchema.index({ userId: 1, symbol: 1 });

export const Alert = models?.Alert || model<AlertItem>('Alert', AlertSchema);
