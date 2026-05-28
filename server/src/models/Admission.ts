import { Schema, model, Document, Types } from 'mongoose';

export interface IAdmissionApplication extends Document {
  collegeId: Types.ObjectId;
  name: string;
  email: string;
  programme: string;
  date: string;
  status: 'applied' | 'reviewing' | 'accepted' | 'enrolled' | 'rejected';
  marks: string;
}

const admissionSchema = new Schema<IAdmissionApplication>({
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  name: { type: String, required: true },
  email: { type: String, required: true },
  programme: { type: String, required: true },
  date: { type: String, required: true },
  status: { type: String, enum: ['applied', 'reviewing', 'accepted', 'enrolled', 'rejected'], default: 'applied' },
  marks: { type: String, required: true }
}, { timestamps: true });

export const AdmissionApplication = model<IAdmissionApplication>('AdmissionApplication', admissionSchema);
