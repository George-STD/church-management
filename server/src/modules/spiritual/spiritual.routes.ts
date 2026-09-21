import { Router } from 'express';
import { getMySpiritualEntries, logSpiritualEntry } from './spiritual.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', getMySpiritualEntries);
router.post('/', logSpiritualEntry);

export default router;
