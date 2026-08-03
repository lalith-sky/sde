import { Schema, model, Document, Types } from 'mongoose';

export interface IActivity extends Document {
  sessionId: Types.ObjectId;
  userId: Types.ObjectId;
  timestamp: Date;
  pageTitle: string;
  url: string;
  summary: string;
  detectedTexts: string[];
  confidence: number;
  screenshotId: Types.ObjectId;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
  pageTitle: {
    type: String,
    required: true,
    default: 'Unknown Page',
  },
  url: {
    type: String,
    required: true,
    default: '',
  },
  summary: {
    type: String,
    required: true,
    default: '',
  },
  detectedTexts: {
    type: [String],
    default: [],
  },
  confidence: {
    type: Number,
    required: true,
    default: 1.0,
  },
  screenshotId: {
    type: Schema.Types.ObjectId,
    ref: 'Screenshot',
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Text index for search
ActivitySchema.index({ pageTitle: 'text', url: 'text', summary: 'text', detectedTexts: 'text' });

export const Activity = model<IActivity>('Activity', ActivitySchema);
export default Activity;
