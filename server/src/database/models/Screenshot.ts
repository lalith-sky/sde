import { Schema, model, Document, Types } from 'mongoose';

export interface IScreenshot extends Document {
  sessionId: Types.ObjectId;
  activityId?: Types.ObjectId;
  filename: string;
  filepath: string;
  mimeType: string;
  size: number;
  createdAt: Date;
}

const ScreenshotSchema = new Schema<IScreenshot>({
  sessionId: {
    type: Schema.Types.ObjectId,
    ref: 'Session',
    required: true,
    index: true,
  },
  activityId: {
    type: Schema.Types.ObjectId,
    ref: 'Activity',
  },
  filename: {
    type: String,
    required: true,
  },
  filepath: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
    default: 'image/jpeg',
  },
  size: {
    type: Number,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Screenshot = model<IScreenshot>('Screenshot', ScreenshotSchema);
export default Screenshot;
