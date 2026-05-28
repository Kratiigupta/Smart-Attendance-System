import { Schema, model, Document, Types } from 'mongoose';

export interface ILesson extends Document {
  collegeId: Types.ObjectId;
  title: string;
  subject: string;
  type: 'Video' | 'Document';
  language: 'English' | 'Hindi' | 'Punjabi';
  duration: string;
  size: string;
  description: string;
  downloaded: boolean;
  contentBody?: string;
  videoUrl?: string;
}

const lessonSchema = new Schema<ILesson>({
  collegeId: { type: Schema.Types.ObjectId, ref: 'College', required: true },
  title: { type: String, required: true },
  subject: { type: String, required: true },
  type: { type: String, enum: ['Video', 'Document'], required: true },
  language: { type: String, enum: ['English', 'Hindi', 'Punjabi'], required: true },
  duration: { type: String, required: true },
  size: { type: String, required: true },
  description: { type: String, required: true },
  downloaded: { type: Boolean, default: false },
  contentBody: { type: String },
  videoUrl: { type: String }
}, { timestamps: true });

export const Lesson = model<ILesson>('Lesson', lessonSchema);
