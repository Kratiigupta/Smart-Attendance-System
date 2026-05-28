import { Schema, model, Document, Types } from 'mongoose';

export interface IHostelBlock extends Document {
  collegeId: Types.ObjectId;
  name: string;
  totalRooms: number;
  occupiedRooms: number;
  type: 'Boys' | 'Girls' | 'Co-Ed';
  floors: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHostelRoom extends Document {
  collegeId: Types.ObjectId;
  blockName: string;
  roomName: string;
  floor: string;
  capacity: number;
  occupants: string[];
  status: 'full' | 'partial' | 'empty' | 'maintenance';
  createdAt: Date;
  updatedAt: Date;
}

const hostelBlockSchema = new Schema<IHostelBlock>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    name: { type: String, required: true, trim: true },
    totalRooms: { type: Number, required: true, min: 1 },
    occupiedRooms: { type: Number, default: 0, min: 0 },
    type: { type: String, enum: ['Boys', 'Girls', 'Co-Ed'], required: true },
    floors: { type: Number, required: true, min: 1 }
  },
  { timestamps: true }
);

hostelBlockSchema.index({ collegeId: 1, name: 1 }, { unique: true });

const hostelRoomSchema = new Schema<IHostelRoom>(
  {
    collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true, index: true },
    blockName: { type: String, required: true, trim: true },
    roomName: { type: String, required: true, trim: true },
    floor: { type: String, required: true, trim: true },
    capacity: { type: Number, required: true, min: 1 },
    occupants: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ['full', 'partial', 'empty', 'maintenance'],
      default: 'empty',
      required: true
    }
  },
  { timestamps: true }
);

hostelRoomSchema.index({ collegeId: 1, blockName: 1, roomName: 1 }, { unique: true });

export const HostelBlock = model<IHostelBlock>('HostelBlock', hostelBlockSchema);
export const HostelRoom = model<IHostelRoom>('HostelRoom', hostelRoomSchema);
