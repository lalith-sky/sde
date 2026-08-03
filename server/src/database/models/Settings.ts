import { Schema, model, Document, Types } from 'mongoose';

export interface ISettings extends Document {
  userId: Types.ObjectId;
  screenshotInterval: number; // in seconds
  captureMode: 'active_tab' | 'desktop';
  aiConfidenceThreshold: number;
  geminiApiKey?: string;
  createdAt: Date;
}

const SettingsSchema = new Schema<ISettings>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true,
  },
  screenshotInterval: {
    type: Number,
    required: true,
    default: 10,
  },
  captureMode: {
    type: String,
    enum: ['active_tab', 'desktop'],
    default: 'active_tab',
  },
  aiConfidenceThreshold: {
    type: Number,
    required: true,
    default: 0.7,
  },
  geminiApiKey: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Settings = model<ISettings>('Settings', SettingsSchema);
export default Settings;
