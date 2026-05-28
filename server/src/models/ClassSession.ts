import { Schema, model, Document, Types } from 'mongoose';

export interface IClassSession extends Document {
  collegeId: Types.ObjectId;
  courseId: Types.ObjectId;
  facultyId: Types.ObjectId;
  faculty: Types.ObjectId;
  subject: Types.ObjectId;
  room: string;
  qrToken: string;
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
    faculty: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    subject: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    room: { type: String, required: true },
    qrToken: { type: String, default: '' },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['active', 'completed', 'scheduled'], default: 'active', required: true },
    otp: { type: String, default: '' },
    otpExpiresAt: { type: Date },
    roomName: { type: String, default: '' }
  },
  { timestamps: true }
);

classSessionSchema.pre('validate', function(next) {
  if (!this.faculty && this.facultyId) this.faculty = this.facultyId;
  if (!this.subject && this.courseId) this.subject = this.courseId;
  if (!this.room && this.roomName) this.room = this.roomName;
  if (!this.qrToken && this.otp) this.qrToken = this.otp;

  if (!this.facultyId && this.faculty) this.facultyId = this.faculty;
  if (!this.courseId && this.subject) this.courseId = this.subject;
  if (!this.roomName && this.room) this.roomName = this.room;
  if (!this.otp && this.qrToken) this.otp = this.qrToken;
  next();
});

export const ClassSession = model<IClassSession>('ClassSession', classSessionSchema);
