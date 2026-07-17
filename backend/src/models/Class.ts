import mongoose, { Schema, Document } from 'mongoose';

export interface IClass extends Document {
  className: string;
  description?: string;
  leaderId?: mongoose.Types.ObjectId;
  leaderName?: string;
  memberCount: number;
  meetingDay?: string;
  meetingTime?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const ClassSchema: Schema = new Schema(
  {
    className: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    leaderId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    leaderName: {
      type: String, // Denormalized for quick display
      trim: true,
    },
    memberCount: {
      type: Number,
      default: 0,
    },
    meetingDay: {
      type: String,
      trim: true,
    },
    meetingTime: {
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
ClassSchema.index({ leaderId: 1 });
ClassSchema.index({ isActive: 1, isDeleted: 1 });
ClassSchema.index({ className: 'text' });

export default mongoose.model<IClass>('Class', ClassSchema);
