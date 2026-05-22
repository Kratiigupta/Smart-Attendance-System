import { Schema, model, Document, Types } from 'mongoose';

export interface IAttendance extends Document {
  collegeId: Types.ObjectId;
  studentId: Types.ObjectId;
  courseId: Types.ObjectId;
  classSessionId: Types.ObjectId;
  date: Date;
  status: 'present' | 'absent' | 'late';
  verifiedAt: Date;
  verificationMethod: 'qr' | 'manual';
  webcamSnapshot?: string; // Base64 data URL representing the software webcam snapshot
  deviceId?: string; // Fingerprint to ensure only one submission per device
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    classSessionId: { type: Schema.Types.ObjectId, ref: 'ClassSession', required: true, index: true },
    date: { type: Date, required: true, default: Date.now },
    status: { type: String, enum: ['present', 'absent', 'late'], default: 'present', required: true },
    verifiedAt: { type: Date, required: true, default: Date.now },
    verificationMethod: { type: String, enum: ['qr', 'manual'], default: 'qr', required: true },
    webcamSnapshot: { type: String },
    deviceId: { type: String }
  },
  { timestamps: true }
);

// Compound index to prevent double attendance of same student in same class session
attendanceSchema.index({ classSessionId: 1, studentId: 1 }, { unique: true });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
