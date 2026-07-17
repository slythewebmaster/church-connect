import { Response } from 'express';
import { Announcement, Member, User } from '../models';
import { AuthRequest } from '../middleware/auth';

// Submit announcement (member)
export const submitAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, message, category, priority } = req.body;

    // Get member info
    const member = await Member.findOne({ userId: req.user?.userId });
    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    const announcement = new Announcement({
      title,
      message,
      category,
      priority: priority || 'normal',
      submittedBy: member._id,
      submittedByName: member.fullName,
      submittedByPhone: member.phone,
      status: 'pending',
    });

    await announcement.save();

    res.status(201).json({
      message: 'Announcement submitted successfully',
      announcement,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get member's submissions
export const getMySubmissions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await Member.findOne({ userId: req.user?.userId });
    if (!member) {
      res.status(404).json({ message: 'Member profile not found' });
      return;
    }

    const announcements = await Announcement.find({
      submittedBy: member._id,
      isDeleted: false,
    }).sort({ submittedAt: -1 });

    res.json({ announcements });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending announcements (clerk/admin)
export const getPendingAnnouncements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const announcements = await Announcement.find({
      status: 'pending',
      isDeleted: false,
    }).sort({ submittedAt: 1 });

    res.json({ announcements, count: announcements.length });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get approved announcements for Sunday
export const getSundaySchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;

    const query: any = {
      status: 'approved',
      isDeleted: false,
    };

    if (date) {
      const targetDate = new Date(date as string);
      query.publishDate = {
        $gte: new Date(targetDate.setHours(0, 0, 0, 0)),
        $lt: new Date(targetDate.setHours(23, 59, 59, 999)),
      };
    }

    const announcements = await Announcement.find(query).sort({ priority: -1, publishDate: 1 });

    res.json({ announcements });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve announcement (clerk/admin)
export const approveAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { publishDate } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }

    announcement.status = 'approved';
    announcement.reviewedBy = user._id;
    announcement.reviewedByName = user.fullName;
    announcement.reviewedAt = new Date();
    announcement.publishDate = publishDate || new Date();

    await announcement.save();

    res.json({
      message: 'Announcement approved successfully',
      announcement,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Reject announcement (clerk/admin)
export const rejectAnnouncement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { rejectionReason } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }

    announcement.status = 'rejected';
    announcement.reviewedBy = user._id;
    announcement.reviewedByName = user.fullName;
    announcement.reviewedAt = new Date();
    announcement.rejectionReason = rejectionReason;

    await announcement.save();

    res.json({
      message: 'Announcement rejected',
      announcement,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Mark as announced (clerk/admin)
export const markAsAnnounced = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const announcement = await Announcement.findById(id);
    if (!announcement) {
      res.status(404).json({ message: 'Announcement not found' });
      return;
    }

    announcement.announcedOnSunday = true;
    announcement.announcedAt = new Date();

    await announcement.save();

    res.json({
      message: 'Marked as announced',
      announcement,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
