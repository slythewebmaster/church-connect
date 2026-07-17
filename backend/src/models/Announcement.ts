import mongoose, { Schema, Document } from 'mongoose';

export interface IAnnouncement extends Document {
  title: string;
  message: string;
  submittedBy: mongoose.Types.ObjectId;
  submittedByName: string;
  submittedByPhone?: string;
  submittedAt: Date;
  status: 'pending' | 'approved' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedByName?: string;
  reviewedAt?: Date;
  rejectionReason?: string;
  publishDate?: Date;
  announcedOnSunday: boolean;
  announcedAt?: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'prayer_request' | 'thanksgiving' | 'event' | 'other';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const AnnouncementSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    submittedBy: {
      type: Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
    },
    submittedByName: {
      type: String,
      required: true,
      trim: true,
    },
    submittedByPhone: {
      type: String,
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedByName: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
      trim: true,
    },
    publishDate: {
      type: Date,
    },
    announcedOnSunday: {
      type: Boolean,
      default: false,
    },
    announcedAt: {
      type: Date,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    category: {
      type: String,
      enum: ['general', 'prayer_request', 'thanksgiving', 'event', 'other'],
      default: 'general',
    },
    isPublic: {
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
AnnouncementSchema.index({ status: 1, submittedAt: -1 });
AnnouncementSchema.index({ publishDate: 1, status: 1 });
AnnouncementSchema.index({ submittedBy: 1 });
AnnouncementSchema.index({ reviewedBy: 1 });

export default mongoose.model<IAnnouncement>('Announcement', AnnouncementSchema);
