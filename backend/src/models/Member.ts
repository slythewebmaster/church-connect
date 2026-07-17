import mongoose, { Schema, Document } from 'mongoose';

export interface IMember extends Document {
  userId?: mongoose.Types.ObjectId;
  fullName: string;
  phone?: string;
  email?: string;
  address?: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  profilePhoto?: string;
  classId?: mongoose.Types.ObjectId;
  className?: string;
  familyId?: mongoose.Types.ObjectId;
  relationshipType?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  membershipDate?: Date;
  membershipStatus: 'active' | 'inactive' | 'visitor';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const MemberSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      sparse: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    dateOfBirth: {
      type: Date,
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
      ref: 'Class',
    },
    className: {
      type: String, // Denormalized
      trim: true,
    },
    familyId: {
      type: Schema.Types.ObjectId,
    },
    relationshipType: {
      type: String,
      trim: true,
    },
    emergencyContact: {
      name: String,
      phone: String,
      relationship: String,
    },
    membershipDate: {
      type: Date,
    },
    membershipStatus: {
      type: String,
      enum: ['active', 'inactive', 'visitor'],
      default: 'active',
    },
    notes: {
      type: String,
      trim: true,
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
MemberSchema.index({ userId: 1 }, { unique: true, sparse: true });
MemberSchema.index({ classId: 1 });
MemberSchema.index({ familyId: 1 });
MemberSchema.index({ fullName: 'text' });
MemberSchema.index({ phone: 1 });
MemberSchema.index({ membershipStatus: 1, isDeleted: 1 });

export default mongoose.model<IMember>('Member', MemberSchema);
