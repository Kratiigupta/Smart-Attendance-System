import { Schema, model, Document } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  code: string;
  domain?: string;
  address?: {
    city: string;
    state: string;
    country: string;
  };
  subscription?: {
    plan: 'free' | 'basic' | 'premium';
    validUntil: Date;
  };
  settings: {
    attendanceThreshold: number;
    timezone: string;
    workingDays: string[];
  };
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    domain: { type: String, lowercase: true, trim: true },
    address: {
      city: { type: String, default: '' },
      state: { type: String, default: '' },
      country: { type: String, default: '' }
    },
    subscription: {
      plan: { type: String, enum: ['free', 'basic', 'premium'], default: 'free' },
      validUntil: { type: Date }
    },
    settings: {
      attendanceThreshold: { type: Number, default: 75 },
      timezone: { type: String, default: 'Asia/Kolkata' },
      workingDays: { type: [String], default: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] }
    },
    logo: { type: String }
  },
  { timestamps: true }
);

export const College = model<ICollege>('College', collegeSchema);
