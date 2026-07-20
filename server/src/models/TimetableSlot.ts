import { Schema, model, Document, Types } from 'mongoose';

export interface ITimetableSlot extends Document {
  collegeId: Types.ObjectId;
  courseId: Types.ObjectId;
  facultyId: Types.ObjectId;
  roomId: Types.ObjectId;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  slotNumber: number;
  startTime: string; // e.g., "09:00"
  endTime: string;   // e.g., "09:50"
  type: 'Lecture' | 'Practical' | 'Tutorial';
  semester: number;
  academicYear: string; // e.g., "2025-2026"
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const timetableSlotSchema = new Schema<ITimetableSlot>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true, index: true },
    facultyId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    roomId: { type: Schema.Types.ObjectId, ref: 'Room', required: true, index: true },
    day: { 
      type: String, 
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
      required: true 
    },
    slotNumber: { type: Number, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { type: String, enum: ['Lecture', 'Practical', 'Tutorial'], default: 'Lecture' },
    semester: { type: Number, required: true },
    academicYear: { type: String, required: true },
    isPublished: { type: Boolean, default: false, index: true }
  },
  { timestamps: true }
);

// Prevent double booking of rooms and faculty
timetableSlotSchema.index({ collegeId: 1, roomId: 1, day: 1, slotNumber: 1, academicYear: 1, semester: 1 }, { unique: true });
timetableSlotSchema.index({ collegeId: 1, facultyId: 1, day: 1, slotNumber: 1, academicYear: 1, semester: 1 }, { unique: true });

export const TimetableSlot = model<ITimetableSlot>('TimetableSlot', timetableSlotSchema);
