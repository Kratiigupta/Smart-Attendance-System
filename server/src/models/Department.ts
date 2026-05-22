import { Schema, model, Document, Types } from 'mongoose';

export interface IDepartment extends Document {
  collegeId: Types.ObjectId;
  name: string;
  code: string; // e.g. CSE, ECE
  hodId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const departmentSchema = new Schema<IDepartment>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    hodId: { type: Schema.Types.ObjectId, ref: 'User' }
  },
  { timestamps: true }
);

// Compound unique: code must be unique within a college
departmentSchema.index({ collegeId: 1, code: 1 }, { unique: true });

export const Department = model<IDepartment>('Department', departmentSchema);
