import mongoose, { Schema, Document } from 'mongoose';

export interface IAttendance extends Document {
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  classId?: mongoose.Types.ObjectId;
  className?: string;
  date: Date;
  status: 'present' | 'absent' | 'late' | 'excused';
  checkedInAt?: Date;
  notes?: string;
  recordedBy: mongoose.Types.ObjectId;
  recordedByName: string;
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceSchema: Schema = new Schema(
  {
    memberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    memberName: {
      type: String,
      required: true,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
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
      enum: ['present', 'absent', 'late', 'excused'],
      default: 'present',
    },
    checkedInAt: {
      type: Date,
    },
    notes: {
      type: String,
      trim: true,
    },
    recordedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recordedByName: {
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
AttendanceSchema.index({ memberId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ date: 1 });
AttendanceSchema.index({ classId: 1, date: 1 });
AttendanceSchema.index({ status: 1 });

export default mongoose.model<IAttendance>('Attendance', AttendanceSchema);
