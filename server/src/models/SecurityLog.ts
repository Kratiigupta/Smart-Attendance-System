import { Schema, model, Document, Types } from 'mongoose';

export interface ISecurityLog extends Document {
  collegeId: Types.ObjectId;
  student: Types.ObjectId;
  alertType: string;
  confidence: number;
  createdAt: Date;
}

const securityLogSchema = new Schema<ISecurityLog>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    alertType: { type: String, required: true },
    confidence: { type: Number, required: true, default: 1.0 },
    createdAt: { type: Date, required: true, default: Date.now }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

export const SecurityLog = model<ISecurityLog>('SecurityLog', securityLogSchema);
