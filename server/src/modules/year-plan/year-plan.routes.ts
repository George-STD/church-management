import { Router } from 'express';
import { listYearPlanItems, createYearPlanItem, signupForPlanItem } from './year-plan.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/', listYearPlanItems);
router.post('/', createYearPlanItem);
router.post('/:id/signup', signupForPlanItem);

export default router;
