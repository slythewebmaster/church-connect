import express from 'express';
import {
  getUpcomingEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All authenticated users can view events
router.get('/', authenticate, getUpcomingEvents);
router.get('/:id', authenticate, getEventById);

// Admin/Pastor only
router.post('/', authenticate, authorize('admin', 'pastor'), createEvent);
router.put('/:id', authenticate, authorize('admin', 'pastor'), updateEvent);
router.delete('/:id', authenticate, authorize('admin', 'pastor'), deleteEvent);

export default router;
