import { Schema, model, Document } from 'mongoose';

export interface ILog extends Document {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  meta?: any;
  timestamp: Date;
}

const LogSchema = new Schema<ILog>({
  level: {
    type: String,
    required: true,
    enum: ['info', 'warn', 'error', 'debug'],
    default: 'info',
  },
  message: {
    type: String,
    required: true,
  },
  meta: {
    type: Schema.Types.Mixed,
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
  },
});

export const Log = model<ILog>('Log', LogSchema);
export default Log;
