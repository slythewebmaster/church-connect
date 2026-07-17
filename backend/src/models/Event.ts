import mongoose, { Schema, Document } from 'mongoose';

export interface IEvent extends Document {
  eventName: string;
  description?: string;
  eventType: 'service' | 'meeting' | 'conference' | 'social' | 'other';
  startDate: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizerId?: mongoose.Types.ObjectId;
  organizerName?: string;
  expectedAttendees?: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: mongoose.Types.ObjectId;
  isDeleted: boolean;
}

const EventSchema: Schema = new Schema(
  {
    eventName: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    eventType: {
      type: String,
      enum: ['service', 'meeting', 'conference', 'social', 'other'],
      default: 'other',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
    },
    startTime: {
      type: String,
      trim: true,
    },
    endTime: {
      type: String,
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    organizerName: {
      type: String,
      trim: true,
    },
    expectedAttendees: {
      type: Number,
    },
    isPublic: {
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
EventSchema.index({ startDate: 1 });
EventSchema.index({ eventType: 1 });
EventSchema.index({ isPublic: 1, isDeleted: 1 });

export default mongoose.model<IEvent>('Event', EventSchema);
