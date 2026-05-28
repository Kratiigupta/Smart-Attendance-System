import { Schema, model, Document, Types } from 'mongoose';

export interface IUser extends Document {
  collegeId: Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  role: 'super_admin' | 'college_admin' | 'hod' | 'faculty' | 'student' | 'parent';
  phone?: string;
  avatar?: string;
  profileImage?: string;
  department?: Types.ObjectId;
  semester?: number;
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

export interface IParent extends IUser {
  studentRollNumber?: string;
}

const userSchema = new Schema<IUser>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      enum: ['super_admin', 'college_admin', 'hod', 'faculty', 'student', 'parent'],
      required: true
    },
    phone: { type: String, trim: true },
    avatar: { type: String },
    profileImage: { type: String },
    department: { type: Schema.Types.ObjectId, ref: 'Department' },
    semester: { type: Number, min: 1, max: 8 },
    isActive: { type: Boolean, default: true }
  },
  {
    discriminatorKey: 'userType',
    timestamps: true
  }
);

userSchema.pre('save', function (next) {
  const self = this as any;
  // Sync profileImage and avatar
  if (self.profileImage && !self.avatar) {
    self.avatar = self.profileImage;
  } else if (self.avatar && !self.profileImage) {
    self.profileImage = self.avatar;
  }

  // Sync department and departmentId
  if (self.department && !self.departmentId) {
    self.departmentId = self.department;
  } else if (self.departmentId && !self.department) {
    self.department = self.departmentId;
  }
  next();
});

// Compound unique index: email must be unique WITHIN a college
userSchema.index({ collegeId: 1, email: 1 }, { unique: true });

export const User = model<IUser>('User', userSchema);

// Student Discriminator
export const Student = User.discriminator<IStudent>(
  'Student',
  new Schema({
    rollNumber: { type: String, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
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

// Parent Discriminator
export const Parent = User.discriminator<IParent>(
  'Parent',
  new Schema({
    studentRollNumber: { type: String, trim: true }
  })
);
