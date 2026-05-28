import { Schema, model, Document, Types } from 'mongoose';

export interface ILeaveApplication extends Document {
  collegeId: Types.ObjectId;
  facultyId: Types.ObjectId;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  proxyFaculty: string;
  status: 'Approved' | 'Pending' | 'Rejected';
  appliedDate: string;
  createdAt: Date;
  updatedAt: Date;
}

const leaveApplicationSchema = new Schema<ILeaveApplication>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    leaveType: { type: String, required: true },
    startDate: { type: String, required: true },
    endDate: { type: String, required: true },
    reason: { type: String, required: true },
    proxyFaculty: { type: String, default: 'None Assigned' },
    status: {
      type: String,
      enum: ['Approved', 'Pending', 'Rejected'],
      default: 'Pending',
      required: true
    },
    appliedDate: { type: String, required: true }
  },
  { timestamps: true }
);

export const LeaveApplication = model<ILeaveApplication>('LeaveApplication', leaveApplicationSchema);
