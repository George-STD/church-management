import { Router } from 'express';
import { exportMembersExcel } from './reports.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/members/excel', exportMembersExcel);

export default router;
