import { describe, it, expect } from 'vitest';
import { UserRole, Action } from '@church/shared';
import {
  hasScopeAuthority,
  canEvaluateServant,
  validateAnnouncementAudience,
  AuthUser,
} from '../src/core/permissions.js';

describe('Cumulative RBAC & Scope Engine (SRS §3)', () => {
  const genSec: AuthUser = {
    id: 'user-gen-sec',
    phone: '01000000001',
    fullName: 'أمين عام',
    role: UserRole.GENERAL_SECRETARY,
    status: 'ACTIVE',
  };

  const sectorSec: AuthUser = {
    id: 'user-sec-prep',
    phone: '01000000002',
    fullName: 'أمين قطاع إعدادي',
    role: UserRole.SECTOR_SECRETARY,
    sectorId: 'sec-prep',
    status: 'ACTIVE',
  };

  const stageSec: AuthUser = {
    id: 'user-stage-prep-boys',
    phone: '01000000003',
    fullName: 'أمين إعدادي بنين',
    role: UserRole.STAGE_SECRETARY,
    stageId: 'stage-prep-boys',
    sectorId: 'sec-prep',
    status: 'ACTIVE',
  };

  const assistantSec: AuthUser = {
    id: 'user-assistant-prep-boys',
    phone: '01000000004',
    fullName: 'مساعد إعدادي بنين',
    role: UserRole.ASSISTANT_SECRETARY,
    stageId: 'stage-prep-boys',
    sectorId: 'sec-prep',
    status: 'ACTIVE',
  };

  const servant: AuthUser = {
    id: 'user-servant-1',
    phone: '01000000005',
    fullName: 'خادم فصل',
    role: UserRole.SERVANT,
    stageId: 'stage-prep-boys',
    sectorId: 'sec-prep',
    status: 'ACTIVE',
  };

  const stageMap = {
    'stage-prep-boys': 'sec-prep',
    'stage-prep-girls': 'sec-prep',
    'stage-secondary-boys': 'sec-secondary',
  };

  describe('Scope Authority Checks (ABAC)', () => {
    it('General Secretary should have authority over any stage or sector', () => {
      expect(hasScopeAuthority(genSec, { stageId: 'stage-prep-boys' }, stageMap)).toBe(true);
      expect(hasScopeAuthority(genSec, { stageId: 'stage-secondary-boys' }, stageMap)).toBe(true);
      expect(hasScopeAuthority(genSec, { sectorId: 'sec-secondary' }, stageMap)).toBe(true);
    });

    it('Sector Secretary should have authority within their sector but not other sectors', () => {
      // In their sector
      expect(hasScopeAuthority(sectorSec, { sectorId: 'sec-prep' }, stageMap)).toBe(true);
      expect(hasScopeAuthority(sectorSec, { stageId: 'stage-prep-boys' }, stageMap)).toBe(true);
      expect(hasScopeAuthority(sectorSec, { stageId: 'stage-prep-girls' }, stageMap)).toBe(true);

      // In another sector
      expect(hasScopeAuthority(sectorSec, { sectorId: 'sec-secondary' }, stageMap)).toBe(false);
      expect(hasScopeAuthority(sectorSec, { stageId: 'stage-secondary-boys' }, stageMap)).toBe(false);
    });

    it('Stage Secretary should have authority only within their specific stage', () => {
      expect(hasScopeAuthority(stageSec, { stageId: 'stage-prep-boys' }, stageMap)).toBe(true);
      expect(hasScopeAuthority(stageSec, { stageId: 'stage-prep-girls' }, stageMap)).toBe(false);
    });

    it('Servant should only have authority over self or explicitly assigned members', () => {
      expect(hasScopeAuthority(servant, { targetUserId: 'user-servant-1' })).toBe(true);
      expect(hasScopeAuthority(servant, { targetUserId: 'other-user' })).toBe(false);
      expect(hasScopeAuthority(servant, { assignedServantIds: ['user-servant-1'] })).toBe(true);
      expect(hasScopeAuthority(servant, { assignedServantIds: ['user-other'] })).toBe(false);
    });
  });

  describe('Evaluation Authority Hierarchy (SRS A1)', () => {
    it('Stage Secretary can evaluate Servant and Assistant Secretary in their stage', () => {
      expect(canEvaluateServant(stageSec, { id: servant.id, role: servant.role, stageId: servant.stageId })).toBe(true);
      expect(canEvaluateServant(stageSec, { id: assistantSec.id, role: assistantSec.role, stageId: assistantSec.stageId })).toBe(true);
    });

    it('Sector Secretary evaluates Stage Secretary', () => {
      expect(canEvaluateServant(sectorSec, { id: stageSec.id, role: stageSec.role, sectorId: stageSec.sectorId })).toBe(true);
    });

    it('General Secretary evaluates Sector Secretary', () => {
      expect(canEvaluateServant(genSec, { id: sectorSec.id, role: sectorSec.role })).toBe(true);
    });

    it('Subordinates cannot evaluate superiors or themselves', () => {
      // Servant trying to evaluate Stage Secretary
      expect(canEvaluateServant(servant, { id: stageSec.id, role: stageSec.role, stageId: stageSec.stageId })).toBe(false);
      // Stage Secretary trying to evaluate Sector Secretary
      expect(canEvaluateServant(stageSec, { id: sectorSec.id, role: sectorSec.role, sectorId: sectorSec.sectorId })).toBe(false);
      // General Secretary cannot be evaluated by anyone
      expect(canEvaluateServant(genSec, { id: genSec.id, role: genSec.role })).toBe(false);
    });
  });

  describe('Announcement Audience Validation (SRS FR-10.2)', () => {
    it('Stage Secretary can target Servants and Assistant Secretaries', () => {
      expect(validateAnnouncementAudience(UserRole.STAGE_SECRETARY, [UserRole.SERVANT])).toBe(true);
      expect(validateAnnouncementAudience(UserRole.STAGE_SECRETARY, [UserRole.SERVANT, UserRole.ASSISTANT_SECRETARY])).toBe(true);
    });

    it('Stage Secretary CANNOT target Sector Secretary or General Secretary', () => {
      expect(validateAnnouncementAudience(UserRole.STAGE_SECRETARY, [UserRole.SECTOR_SECRETARY])).toBe(false);
      expect(validateAnnouncementAudience(UserRole.STAGE_SECRETARY, [UserRole.GENERAL_SECRETARY])).toBe(false);
      expect(validateAnnouncementAudience(UserRole.STAGE_SECRETARY, [UserRole.SERVANT, UserRole.GENERAL_SECRETARY])).toBe(false);
    });

    it('Servants and Assistants cannot author announcements', () => {
      expect(validateAnnouncementAudience(UserRole.SERVANT, [UserRole.SERVANT])).toBe(false);
      expect(validateAnnouncementAudience(UserRole.ASSISTANT_SECRETARY, [UserRole.SERVANT])).toBe(false);
    });

    it('General Secretary can target any role in the organization', () => {
      expect(validateAnnouncementAudience(UserRole.GENERAL_SECRETARY, [UserRole.SERVANT, UserRole.STAGE_SECRETARY, UserRole.SECTOR_SECRETARY])).toBe(true);
    });
  });
});
