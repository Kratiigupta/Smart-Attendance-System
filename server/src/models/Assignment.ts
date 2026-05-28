import { Schema, model, Document, Types } from 'mongoose';

export interface IAssignment extends Document {
  collegeId: Types.ObjectId;
  course: string;
  code: string;
  title: string;
  due: string;
  status: 'pending' | 'submitted' | 'graded';
  points: string;
  grade?: string;
  studentId?: Types.ObjectId;
}

const assignmentSchema = new Schema<IAssignment>({
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  course: { type: String, required: true },
  code: { type: String, required: true },
  title: { type: String, required: true },
  due: { type: String, required: true },
  status: { type: String, enum: ['pending', 'submitted', 'graded'], default: 'pending' },
  points: { type: String, required: true },
  grade: { type: String },
  studentId: { type: Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

export const Assignment = model<IAssignment>('Assignment', assignmentSchema);
