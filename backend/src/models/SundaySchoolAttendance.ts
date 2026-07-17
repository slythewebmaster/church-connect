import mongoose, { Schema, Document } from 'mongoose';

export interface ISundaySchoolAttendance extends Document {
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  classId?: mongoose.Types.ObjectId;
  className?: string;
  date: Date;
  status: 'present' | 'absent' | 'late';
  checkedInBy?: string;
  checkedInAt?: Date;
  notes?: string;
  teacherId: mongoose.Types.ObjectId;
  teacherName: string;
  createdAt: Date;
  updatedAt: Date;
}

const SundaySchoolAttendanceSchema: Schema = new Schema(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: 'SundaySchoolStudent',
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'SundaySchoolClass',
    },
    className: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'],
      default: 'present',
    },
    checkedInBy: {
      type: String,
      trim: true,
    },
    checkedInAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    teacherId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    teacherName: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
SundaySchoolAttendanceSchema.index({ studentId: 1, date: 1 }, { unique: true });
SundaySchoolAttendanceSchema.index({ date: 1 });
SundaySchoolAttendanceSchema.index({ classId: 1, date: 1 });

export default mongoose.model<ISundaySchoolAttendance>('SundaySchoolAttendance', SundaySchoolAttendanceSchema);
