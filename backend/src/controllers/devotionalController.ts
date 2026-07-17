import { Response } from 'express';
import { Devotional, Class, Member, User } from '../models';
import { AuthRequest } from '../middleware/auth';

// Create devotional (class leader)
export const createDevotional = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, content, scripture, classId, deliveryDate, deliveryTime, imageUrl, audioUrl } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const classDoc = await Class.findById(classId);
    if (!classDoc) {
      res.status(404).json({ message: 'Class not found' });
      return;
    }

    // Get class members for recipients
    const members = await Member.find({ classId, isDeleted: false });
    const recipients = members.map((m) => ({
      memberId: m._id,
      memberName: m.fullName,
      liked: false,
    }));

    const devotional = new Devotional({
      title,
      content,
      scripture,
      authorId: user._id,
      authorName: user.fullName,
      authorRole: user.role,
      classId,
      className: classDoc.className,
      deliveryDate,
      deliveryTime: deliveryTime || '06:00 AM',
      recipients,
      totalRecipients: recipients.length,
      imageUrl,
      audioUrl,
    });

    await devotional.save();

    res.status(201).json({
      message: 'Devotional created successfully',
      devotional,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get devotionals for my class (member)
export const getMyClassDevotionals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const member = await Member.findOne({ userId: req.user?.userId });
    if (!member || !member.classId) {
      res.status(404).json({ message: 'Member or class not found' });
      return;
    }

    const devotionals = await Devotional.find({
      classId: member.classId,
      isActive: true,
      isDeleted: false,
    }).sort({ deliveryDate: -1 }).limit(30);

    res.json({ devotionals });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get my published devotionals (class leader)
export const getMyDevotionals = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const devotionals = await Devotional.find({
      authorId: req.user?.userId,
      isDeleted: false,
    }).sort({ deliveryDate: -1 });

    res.json({ devotionals });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Mark devotional as read
export const markAsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const member = await Member.findOne({ userId: req.user?.userId });
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    const devotional = await Devotional.findById(id);
    if (!devotional) {
      res.status(404).json({ message: 'Devotional not found' });
      return;
    }

    // Find recipient and mark as read
    const recipient = devotional.recipients.find(
      (r) => r.memberId.toString() === member._id.toString()
    );

    if (recipient && !recipient.readAt) {
      recipient.readAt = new Date();
      devotional.totalRead += 1;
      await devotional.save();
    }

    res.json({ message: 'Marked as read', devotional });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Like devotional
export const likeDevotional = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const member = await Member.findOne({ userId: req.user?.userId });
    if (!member) {
      res.status(404).json({ message: 'Member not found' });
      return;
    }

    const devotional = await Devotional.findById(id);
    if (!devotional) {
      res.status(404).json({ message: 'Devotional not found' });
      return;
    }

    // Find recipient and toggle like
    const recipient = devotional.recipients.find(
      (r) => r.memberId.toString() === member._id.toString()
    );

    if (recipient) {
      recipient.liked = !recipient.liked;
      if (recipient.liked) {
        devotional.totalLikes += 1;
      } else {
        devotional.totalLikes -= 1;
      }
      await devotional.save();
    }

    res.json({ message: 'Like toggled', devotional });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update devotional (class leader)
export const updateDevotional = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const devotional = await Devotional.findOneAndUpdate(
      { _id: id, authorId: req.user?.userId, isDeleted: false },
      { $set: updates },
      { new: true }
    );

    if (!devotional) {
      res.status(404).json({ message: 'Devotional not found or unauthorized' });
      return;
    }

    res.json({ message: 'Devotional updated successfully', devotional });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete devotional (class leader)
export const deleteDevotional = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const devotional = await Devotional.findOneAndUpdate(
      { _id: id, authorId: req.user?.userId, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!devotional) {
      res.status(404).json({ message: 'Devotional not found or unauthorized' });
      return;
    }

    res.json({ message: 'Devotional deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
