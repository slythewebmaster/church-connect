import { Response } from 'express';
import { Event, User } from '../models';
import { AuthRequest } from '../middleware/auth';

// Get all upcoming events
export const getUpcomingEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const events = await Event.find({
      startDate: { $gte: today },
      isPublic: true,
      isDeleted: false,
    }).sort({ startDate: 1 });

    res.json({ events });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get event by ID
export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findOne({ _id: id, isDeleted: false });
    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.json({ event });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Create event (admin/pastor)
export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      eventName,
      description,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      expectedAttendees,
      isPublic,
    } = req.body;

    const user = await User.findById(req.user?.userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const event = new Event({
      eventName,
      description,
      eventType,
      startDate,
      endDate,
      startTime,
      endTime,
      location,
      expectedAttendees,
      isPublic: isPublic !== undefined ? isPublic : true,
      organizerId: user._id,
      organizerName: user.fullName,
      createdBy: user._id,
    });

    await event.save();

    res.status(201).json({
      message: 'Event created successfully',
      event,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update event (admin/pastor)
export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const event = await Event.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: updates },
      { new: true }
    );

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.json({
      message: 'Event updated successfully',
      event,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete event (admin/pastor)
export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await Event.findOneAndUpdate(
      { _id: id, isDeleted: false },
      { $set: { isDeleted: true } },
      { new: true }
    );

    if (!event) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
