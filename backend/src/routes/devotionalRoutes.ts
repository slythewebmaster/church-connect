import express from 'express';
import {
  createDevotional,
  getMyClassDevotionals,
  getMyDevotionals,
  markAsRead,
  likeDevotional,
  updateDevotional,
  deleteDevotional,
} from '../controllers/devotionalController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Member routes
router.get('/my-class', authenticate, getMyClassDevotionals);
router.put('/:id/mark-read', authenticate, markAsRead);
router.put('/:id/like', authenticate, likeDevotional);

// Class leader routes
router.post('/', authenticate, authorize('class_leader', 'admin'), createDevotional);
router.get('/', authenticate, authorize('class_leader', 'admin'), getMyDevotionals);
router.put('/:id', authenticate, authorize('class_leader', 'admin'), updateDevotional);
router.delete('/:id', authenticate, authorize('class_leader', 'admin'), deleteDevotional);

export default router;
