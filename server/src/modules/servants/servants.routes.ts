import { Router } from 'express';
import {
  listServants,
  getServantById,
  updateOwnProfile,
  updateServantEvaluation,
  createServant,
  transferServant,
  suspendServant,
} from './servants.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireMinRole } from '../../middleware/rbac.js';
import { UserRole } from '@church/shared';

const router = Router();

router.use(authenticate);

router.get('/', listServants);
router.put('/me', updateOwnProfile);
router.post('/', requireMinRole(UserRole.STAGE_SECRETARY), createServant);
router.get('/:id', getServantById);
router.put('/:id/evaluation', requireMinRole(UserRole.STAGE_SECRETARY), updateServantEvaluation);
router.post('/:id/transfer', requireMinRole(UserRole.GENERAL_SECRETARY), transferServant);
router.post('/:id/suspend', requireMinRole(UserRole.GENERAL_SECRETARY), suspendServant);

export default router;
