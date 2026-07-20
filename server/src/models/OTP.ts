import { Schema, model, Document } from 'mongoose';

export interface IOTP extends Document {
  email: string;
  otp: string;
  purpose: 'reset_password' | 'verify_email';
  createdAt: Date;
}

const otpSchema = new Schema<IOTP>(
  {
    email: { type: String, required: true, trim: true, lowercase: true, index: true },
    otp: { type: String, required: true },
    purpose: { type: String, enum: ['reset_password', 'verify_email'], default: 'reset_password', required: true },
    createdAt: { type: Date, default: Date.now, index: { expires: 300 } } // Expiry in 5 minutes (300 seconds)
  }
);

export const OTP = model<IOTP>('OTP', otpSchema);
