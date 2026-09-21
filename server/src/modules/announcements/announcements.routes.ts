import { Router } from 'express';
import { listAnnouncements, createAnnouncement, markAnnouncementAsRead } from './announcements.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listAnnouncements);
router.post('/', createAnnouncement);
router.post('/:id/read', markAnnouncementAsRead);

export default router;
