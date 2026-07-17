import mongoose, { Schema, Document } from 'mongoose';

export interface ISundaySchoolStudent extends Document {
  fullName: string;
  dateOfBirth?: Date;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  profilePhoto?: string;
  classId?: mongoose.Types.ObjectId;
  className?: string;
  parentMemberId?: mongoose.Types.ObjectId;
  parentName?: string;
  parentPhone: string;
  allergies?: string;
  specialNeeds?: string;
  notes?: string;
  enrollmentDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const SundaySchoolStudentSchema: Schema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
    },
    age: {
      type: Number,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    profilePhoto: {
      type: String,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'SundaySchoolClass',
    },
    className: {
      type: String,
      trim: true,
    },
    parentMemberId: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
    },
    parentName: {
      type: String,
      trim: true,
    },
    parentPhone: {
      type: String,
      required: true,
      trim: true,
    },
    allergies: {
      type: String,
      trim: true,
    },
    specialNeeds: {
      type: String,
      trim: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    enrollmentDate: {
      type: Date,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
SundaySchoolStudentSchema.index({ classId: 1 });
SundaySchoolStudentSchema.index({ parentMemberId: 1 });
SundaySchoolStudentSchema.index({ fullName: 'text' });
SundaySchoolStudentSchema.index({ isActive: 1, isDeleted: 1 });

export default mongoose.model<ISundaySchoolStudent>('SundaySchoolStudent', SundaySchoolStudentSchema);
