import { Schema, model, Document, Types } from 'mongoose';

export interface IRoom extends Document {
  collegeId: Types.ObjectId;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  type: 'Lecture Hall' | 'Computer Lab' | 'Electronics Lab' | 'Seminar Hall' | 'Other';
  status: 'available' | 'occupied' | 'maintenance';
  currentClass?: string | null;
  occupancy: number;
  hasWifi: boolean;
  hasProjector: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema<IRoom>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    name: { type: String, required: true, trim: true },
    building: { type: String, required: true, trim: true },
    floor: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    type: {
      type: String,
      enum: ['Lecture Hall', 'Computer Lab', 'Electronics Lab', 'Seminar Hall', 'Other'],
      required: true
    },
    status: {
      type: String,
      enum: ['available', 'occupied', 'maintenance'],
      default: 'available',
      required: true
    },
    currentClass: { type: String, default: null },
    occupancy: { type: Number, default: 0 },
    hasWifi: { type: Boolean, default: true },
    hasProjector: { type: Boolean, default: true }
  },
  { timestamps: true }
);

roomSchema.index({ collegeId: 1, name: 1 }, { unique: true });

export const Room = model<IRoom>('Room', roomSchema);
