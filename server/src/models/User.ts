import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  collegeId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'college_admin' | 'hod' | 'faculty' | 'student';
  phone?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudent extends IUser {
  rollNumber?: string;
  departmentId?: Types.ObjectId;
  semester?: number;
  enrolledCourses: Types.ObjectId[];
  parentPhone?: string;
  faceDescriptor?: number[][]; // Encodings array for face recognition
}

export interface IFaculty extends IUser {
  employeeId?: string;
  departmentId?: Types.ObjectId;
  designation?: string;
  assignedCourses: Types.ObjectId[];
  maxHoursPerWeek: number;
  specializations: string[];
}

const userSchema = new Schema<IUser>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'college_admin', 'hod', 'faculty', 'student'],
      required: true
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true }
  },
  {
    discriminatorKey: 'userType',
    timestamps: true
  }
);

// Compound unique index: email must be unique WITHIN a college
userSchema.index({ collegeId: 1, email: 1 }, { unique: true });

export const User = model<IUser>('User', userSchema);

// Student Discriminator
export const Student = User.discriminator<IStudent>(
  'Student',
  new Schema({
    rollNumber: { type: String, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    semester: { type: Number, min: 1, max: 8 },
    enrolledCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    parentPhone: { type: String, trim: true },
    faceDescriptor: { type: [[Number]], default: undefined } // Array of face encodings
  })
);

// Faculty Discriminator
export const Faculty = User.discriminator<IFaculty>(
  'Faculty',
  new Schema({
    employeeId: { type: String, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    designation: { type: String, trim: true },
    assignedCourses: [{ type: Schema.Types.ObjectId, ref: 'Course' }],
    maxHoursPerWeek: { type: Number, default: 18 },
    specializations: { type: [String], default: [] }
  })
);
