export type UserRole = 'admin' | 'pastor' | 'clerk' | 'class_leader' | 'sunday_school_teacher' | 'member';

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  profilePhoto?: string;
  role: UserRole;
  isActive: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  message: string;
}

export interface Announcement {
  _id: string;
  title: string;
  message: string;
  submittedByName: string;
  submittedAt: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedByName?: string;
  reviewedAt?: string;
  rejectionReason?: string;
  publishDate?: string;
  announcedOnSunday: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  category: 'general' | 'prayer_request' | 'thanksgiving' | 'event' | 'other';
}

export interface Event {
  _id: string;
  eventName: string;
  description?: string;
  eventType: 'service' | 'meeting' | 'conference' | 'social' | 'other';
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  organizerName?: string;
  expectedAttendees?: number;
  isPublic: boolean;
}

export interface Devotional {
  _id: string;
  title: string;
  content: string;
  scripture?: string;
  authorName: string;
  className: string;
  deliveryDate: string;
  imageUrl?: string;
  audioUrl?: string;
  totalRecipients: number;
  totalRead: number;
  totalLikes: number;
  recipients: {
    memberId: string;
    memberName: string;
    readAt?: string;
    liked: boolean;
  }[];
}

export interface ApiError {
  message: string;
  statusCode?: number;
}
