import express from 'express';
import {
  submitAnnouncement,
  getMySubmissions,
  getPendingAnnouncements,
  getSundaySchedule,
  approveAnnouncement,
  rejectAnnouncement,
  markAsAnnounced,
} from '../controllers/announcementController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Member routes
router.post('/', authenticate, submitAnnouncement);
router.get('/my-submissions', authenticate, getMySubmissions);

// Clerk/Admin routes
router.get('/pending', authenticate, authorize('clerk', 'admin'), getPendingAnnouncements);
router.get('/sunday-schedule', authenticate, authorize('clerk', 'admin', 'pastor'), getSundaySchedule);
router.put('/:id/approve', authenticate, authorize('clerk', 'admin'), approveAnnouncement);
router.put('/:id/reject', authenticate, authorize('clerk', 'admin'), rejectAnnouncement);
router.put('/:id/mark-announced', authenticate, authorize('clerk', 'admin'), markAsAnnounced);

export default router;
