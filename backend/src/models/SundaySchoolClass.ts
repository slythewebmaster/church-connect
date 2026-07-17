import mongoose, { Schema, Document } from 'mongoose';

interface IAssistantTeacher {
  userId: mongoose.Types.ObjectId;
  name: string;
}

export interface ISundaySchoolClass extends Document {
  className: string;
  ageGroup?: string;
  teacherId?: mongoose.Types.ObjectId;
  teacherName?: string;
  assistantTeachers: IAssistantTeacher[];
  studentCount: number;
  meetingTime?: string;
  room?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const SundaySchoolClassSchema: Schema = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    ageGroup: {
      type: String,
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    teacherName: {
      type: String,
      trim: true,
    },
    assistantTeachers: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        name: String,
      },
    ],
    studentCount: {
      type: Number,
      default: 0,
    },
    meetingTime: {
      type: String,
      trim: true,
    },
    room: {
      type: String,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SundaySchoolClassSchema.index({ teacherId: 1 });
SundaySchoolClassSchema.index({ ageGroup: 1 });
SundaySchoolClassSchema.index({ isActive: 1, isDeleted: 1 });

export default mongoose.model<ISundaySchoolClass>('SundaySchoolClass', SundaySchoolClassSchema);
