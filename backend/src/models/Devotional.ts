import mongoose, { Schema, Document } from 'mongoose';

interface IRecipient {
  memberId: mongoose.Types.ObjectId;
  memberName: string;
  readAt?: Date;
  liked: boolean;
}

export interface IDevotional extends Document {
  title: string;
  content: string;
  scripture?: string;
  authorId: mongoose.Types.ObjectId;
  authorName: string;
  authorRole: string;
  classId: mongoose.Types.ObjectId;
  className: string;
  deliveryDate: Date;
  deliveryTime: string;
  sentAt?: Date;
  recipients: IRecipient[];
  totalRecipients: number;
  totalRead: number;
  totalLikes: number;
  imageUrl?: string;
  audioUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
}

const DevotionalSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    scripture: {
      type: String,
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: {
      type: String,
      required: true,
      trim: true,
    },
    authorRole: {
      type: String,
      trim: true,
    },
    classId: {
      type: Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    className: {
      type: String,
      required: true,
      trim: true,
    },
    deliveryDate: {
      type: Date,
      required: true,
    },
    deliveryTime: {
      type: String,
      default: '06:00 AM',
    },
    sentAt: {
      type: Date,
    },
    recipients: [
      {
        memberId: {
          type: Schema.Types.ObjectId,
          ref: 'Member',
        },
        memberName: String,
        readAt: Date,
        liked: {
          type: Boolean,
          default: false,
        },
      },
    ],
    totalRecipients: {
      type: Number,
      default: 0,
    },
    totalRead: {
      type: Number,
      default: 0,
    },
    totalLikes: {
      type: Number,
      default: 0,
    },
    imageUrl: {
      type: String,
    },
    audioUrl: {
      type: String,
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
DevotionalSchema.index({ classId: 1, deliveryDate: -1 });
DevotionalSchema.index({ authorId: 1, deliveryDate: -1 });
DevotionalSchema.index({ deliveryDate: 1 });

export default mongoose.model<IDevotional>('Devotional', DevotionalSchema);
