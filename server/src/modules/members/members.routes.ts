import { Router } from 'express';
import {
  listMembers,
  getMemberById,
  createMember,
  updateMember,
  updateMemberEvaluation,
  bulkImportMembers,
} from './members.controller.js';
import { authenticate } from '../../middleware/auth.js';
import { requireMinRole } from '../../middleware/rbac.js';
import { UserRole } from '@church/shared';

const router = Router();

router.use(authenticate);

router.get('/', listMembers);
router.get('/:id', getMemberById);
router.post('/', requireMinRole(UserRole.ASSISTANT_SECRETARY), createMember);
router.put('/:id', requireMinRole(UserRole.ASSISTANT_SECRETARY), updateMember);
router.put('/:id/evaluation', updateMemberEvaluation); // Handles assigned servant logic internally
router.post('/bulk-import', requireMinRole(UserRole.ASSISTANT_SECRETARY), bulkImportMembers);

export default router;
