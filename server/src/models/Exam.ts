import { Schema, model, Document, Types } from 'mongoose';

export interface IExam extends Document {
  collegeId: Types.ObjectId;
  subject: string;
  code: string;
  date: string;
  time: string;
  room: string;
  seat: string;
  studentId?: Types.ObjectId;
}

const examSchema = new Schema<IExam>({
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  subject: { type: String, required: true },
  code: { type: String, required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  room: { type: String, required: true },
  seat: { type: String, required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Exam = model<IExam>('Exam', examSchema);
