import { Schema, model, Document, Types } from 'mongoose';

export interface INotification extends Document {
  collegeId: Types.ObjectId;
  recipient: Types.ObjectId;
  title: string;
  message: string;
  isRead: boolean;
  category: 'Attendance' | 'Fees' | 'Timetable' | 'Academic';
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, required: true, default: false },
    category: { type: String, enum: ['Attendance', 'Fees', 'Timetable', 'Academic'], default: 'Academic', required: true },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'low', required: true }
  },
  { timestamps: true }
);

export const Notification = model<INotification>('Notification', notificationSchema);
