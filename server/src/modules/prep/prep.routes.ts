import { Router } from 'express';
import { listPreps, getPrepById, createPrep, reviewPrep } from './prep.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listPreps);
router.get('/:id', getPrepById);
router.post('/', createPrep);
router.put('/:id/review', reviewPrep);

export default router;
