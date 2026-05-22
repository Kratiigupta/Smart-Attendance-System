import { Schema, model, Document, Types } from 'mongoose';

export interface ICourse extends Document {
  collegeId: Types.ObjectId;
  departmentId: Types.ObjectId;
  code: string; // e.g. CSC-01-1-01
  title: string;
  credits: number;
  type: 'DSC' | 'Minor' | 'MDC' | 'AEC' | 'SEC' | 'VAC' | 'Research' | 'Internship';
  ltp: {
    lecture: number;
    tutorial: number;
    practical: number;
  };
  semester: number;
  programmeType: 'FYUP' | 'ITEP' | 'PG';
  maxStudents?: number;
  isElective: boolean;
  prerequisites: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const courseSchema = new Schema<ICourse>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    title: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1, max: 12 },
    type: {
      type: String,
      enum: ['DSC', 'Minor', 'MDC', 'AEC', 'SEC', 'VAC', 'Research', 'Internship'],
      required: true
    },
    ltp: {
      lecture: { type: Number, required: true, min: 0 },
      tutorial: { type: Number, required: true, min: 0 },
      practical: { type: Number, required: true, min: 0 }
    },
    semester: { type: Number, required: true, min: 1, max: 8 },
    programmeType: { type: String, enum: ['FYUP', 'ITEP', 'PG'], default: 'FYUP' },
    maxStudents: { type: Number },
    isElective: { type: Boolean, default: false },
    prerequisites: [{ type: Schema.Types.ObjectId, ref: 'Course' }]
  },
  { timestamps: true }
);

// Compound unique: code must be unique within a college
courseSchema.index({ collegeId: 1, code: 1 }, { unique: true });

export const Course = model<ICourse>('Course', courseSchema);
