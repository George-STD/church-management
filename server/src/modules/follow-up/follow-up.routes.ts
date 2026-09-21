import { Router } from 'express';
import {
  listSessions,
  createSession,
  getSessionRecords,
  recordBatchAttendance,
  getAbsenceAlerts,
  resolveAbsenceAlert,
} from './follow-up.controller.js';
import { authenticate } from '../../middleware/auth.js';

const router = Router();

router.use(authenticate);

router.get('/sessions', listSessions);
router.post('/sessions', createSession);
router.get('/sessions/:id/records', getSessionRecords);
router.post('/records', recordBatchAttendance);
router.get('/alerts', getAbsenceAlerts);
router.post('/alerts/:id/resolve', resolveAbsenceAlert);

export default router;
