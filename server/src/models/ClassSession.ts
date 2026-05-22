import { Schema, model, Document, Types } from 'mongoose';

export interface IClassSession extends Document {
  collegeId: Types.ObjectId;
  courseId: Types.ObjectId;
  facultyId: Types.ObjectId;
  startTime: Date;
  endTime: Date;
  status: 'active' | 'completed' | 'scheduled';
  otp: string; // Dynamic software check-in code / rotating pin
  otpExpiresAt?: Date;
  roomName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const classSessionSchema = new Schema<IClassSession>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'scheduled'], default: 'active', required: true },
    otp: { type: String, default: '' },
    otpExpiresAt: { type: Date },
    roomName: { type: String, default: '' }
  },
  { timestamps: true }
);

export const ClassSession = model<IClassSession>('ClassSession', classSessionSchema);
