import { Router } from 'express';
import { getSectorsWithStages, getStages } from './hierarchy.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.get('/sectors', authenticate, getSectorsWithStages);
router.get('/stages', authenticate, getStages);

export default router;
