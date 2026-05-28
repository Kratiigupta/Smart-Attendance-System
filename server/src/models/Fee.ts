import { Schema, model, Document, Types } from 'mongoose';

export interface IFeeItem extends Document {
  collegeId: Types.ObjectId;
  studentId: Types.ObjectId;
  name: string;
  category: 'Academic' | 'Facilities' | 'Hostel' | 'Other';
  amount: number;
  status: 'Paid' | 'Unpaid';
  dueDate: string;
}

export interface ITransaction extends Document {
  collegeId: Types.ObjectId;
  studentId: Types.ObjectId;
  transactionId: string;
  amount: number;
  method: string;
  date: string;
  receiptNo: string;
  status: 'Success' | 'Pending';
}

const feeItemSchema = new Schema<IFeeItem>({
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  category: { type: String, enum: ['Academic', 'Facilities', 'Hostel', 'Other'], required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['Paid', 'Unpaid'], default: 'Unpaid' },
  dueDate: { type: String, required: true }
}, { timestamps: true });

const transactionSchema = new Schema<ITransaction>({
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  transactionId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  method: { type: String, required: true },
  date: { type: String, required: true },
  receiptNo: { type: String, required: true },
  status: { type: String, enum: ['Success', 'Pending'], default: 'Success' }
}, { timestamps: true });

export const FeeItem = model<IFeeItem>('FeeItem', feeItemSchema);
export const Transaction = model<ITransaction>('Transaction', transactionSchema);
