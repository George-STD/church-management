import { UserRole, FollowUpItemType } from '../types/index.js';

export const ROLE_HIERARCHY_LEVEL: Record<UserRole, number> = {
  [UserRole.SERVANT]: 1,
  [UserRole.ASSISTANT_SECRETARY]: 2,
  [UserRole.STAGE_SECRETARY]: 3,
  [UserRole.SECTOR_SECRETARY]: 4,
  [UserRole.GENERAL_SECRETARY]: 5,
};

export const ARABIC_ROLE_NAMES: Record<UserRole, string> = {
  [UserRole.SERVANT]: 'خادم',
  [UserRole.ASSISTANT_SECRETARY]: 'مساعد امين الخدمة',
  [UserRole.STAGE_SECRETARY]: 'امين الخدمة (امين المرحلة)',
  [UserRole.SECTOR_SECRETARY]: 'امين قطاع',
  [UserRole.GENERAL_SECRETARY]: 'امين عام',
};

export const ARABIC_FOLLOW_UP_ITEMS: Record<FollowUpItemType, string> = {
  [FollowUpItemType.MASS]: 'القداس الإلهي',
  [FollowUpItemType.PREPARATION]: 'التحضير',
  [FollowUpItemType.SERVICE]: 'حضور الخدمة',
  [FollowUpItemType.VISITATION]: 'الافتقاد',
  [FollowUpItemType.SERVICE_MEETING]: 'اجتماع الخدمة',
  [FollowUpItemType.PRAYER_MEETING]: 'اجتماع الصلاة / الأسرة',
  [FollowUpItemType.ACTIVITIES]: 'الأنشطة / النادي / المؤتمر',
  [FollowUpItemType.SECRETARIES_MEETING]: 'اجتماع الأمناء',
  [FollowUpItemType.STAGE_SECRETARIES_MEETING]: 'اجتماع أمناء المراحل',
};

export const DEFAULT_STAGES = [
  { id: 'stage-nursery', name: 'حضانة', sectorName: 'قطاع الطفولة المبكرة', orderIndex: 1, genderSplit: 'ALL' },
  { id: 'stage-primary-1-2', name: 'ابتدائي 1 و 2', sectorName: 'قطاع ابتدائي', orderIndex: 2, genderSplit: 'ALL' },
  { id: 'stage-primary-3-4', name: 'ابتدائي 3 و 4', sectorName: 'قطاع ابتدائي', orderIndex: 3, genderSplit: 'ALL' },
  { id: 'stage-primary-5-6', name: 'ابتدائي 5 و 6', sectorName: 'قطاع ابتدائي', orderIndex: 4, genderSplit: 'ALL' },
  { id: 'stage-prep-boys', name: 'اعدادي بنين', sectorName: 'قطاع اعدادي', orderIndex: 5, genderSplit: 'BOYS' },
  { id: 'stage-prep-girls', name: 'اعدادي بنات', sectorName: 'قطاع اعدادي', orderIndex: 6, genderSplit: 'GIRLS' },
  { id: 'stage-secondary-boys', name: 'ثانوي بنين', sectorName: 'قطاع ثانوي', orderIndex: 7, genderSplit: 'BOYS' },
  { id: 'stage-secondary-girls', name: 'ثانوي بنات', sectorName: 'قطاع ثانوي', orderIndex: 8, genderSplit: 'GIRLS' },
  { id: 'stage-university', name: 'جامعة وخريجين', sectorName: 'قطاع شباب وجامعة', orderIndex: 9, genderSplit: 'ALL' },
] as const;

export enum Action {
  LOGIN = 'LOGIN',
  VIEW_OWN_PROFILE = 'VIEW_OWN_PROFILE',
  EDIT_OWN_PROFILE = 'EDIT_OWN_PROFILE',
  VIEW_OWN_FOLLOWUP = 'VIEW_OWN_FOLLOWUP',
  SUBMIT_PREPARATION = 'SUBMIT_PREPARATION',
  LOG_SPIRITUAL_LIFE = 'LOG_SPIRITUAL_LIFE',
  VIEW_YEAR_PLAN = 'VIEW_YEAR_PLAN',
  SIGNUP_YEAR_PLAN = 'SIGNUP_YEAR_PLAN',
  POST_YEAR_PLAN_UPDATE = 'POST_YEAR_PLAN_UPDATE',
  EDIT_ASSIGNED_MEMBER_EVALUATION = 'EDIT_ASSIGNED_MEMBER_EVALUATION',
  
  // Assistant Secretary & above
  MANAGE_STAGE_MEMBERS = 'MANAGE_STAGE_MEMBERS',
  RECORD_MEMBER_FOLLOWUP = 'RECORD_MEMBER_FOLLOWUP',
  VIEW_STAGE_ANALYTICS = 'VIEW_STAGE_ANALYTICS',

  // Stage Secretary & above
  ADD_PRIVATE_NOTES = 'ADD_PRIVATE_NOTES',
  CREATE_POLL = 'CREATE_POLL',
  MANAGE_STAGE_SERVANTS = 'MANAGE_STAGE_SERVANTS',
  RECORD_SERVANT_FOLLOWUP = 'RECORD_SERVANT_FOLLOWUP',
  VIEW_PREPARATIONS = 'VIEW_PREPARATIONS',
  AUTHOR_OFFICIAL_YEAR_PLAN = 'AUTHOR_OFFICIAL_YEAR_PLAN',
  PUBLISH_ANNOUNCEMENT = 'PUBLISH_ANNOUNCEMENT',
  EXPORT_REPORTS = 'EXPORT_REPORTS',

  // Sector Secretary & above
  MANAGE_SECTOR_SERVANTS = 'MANAGE_SECTOR_SERVANTS',
  VIEW_SECTOR_ANALYTICS = 'VIEW_SECTOR_ANALYTICS',

  // General Secretary
  TRANSFER_OR_SUSPEND_SERVANT = 'TRANSFER_OR_SUSPEND_SERVANT',
  VIEW_ORG_ANALYTICS = 'VIEW_ORG_ANALYTICS',
}

/**
 * Checks if a given author role can send an announcement to a target role.
 * According to SRS FR-10.2: Author can only target roles AT OR BELOW their own level.
 */
export function canTargetRoleInAnnouncement(authorRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY_LEVEL[authorRole] >= ROLE_HIERARCHY_LEVEL[targetRole];
}

/**
 * Determines who is authorized to evaluate a servant based on their role (SRS A1).
 */
export function getEvaluatorRoleFor(subjectRole: UserRole): UserRole | null {
  switch (subjectRole) {
    case UserRole.SERVANT:
    case UserRole.ASSISTANT_SECRETARY:
      return UserRole.STAGE_SECRETARY;
    case UserRole.STAGE_SECRETARY:
      return UserRole.SECTOR_SECRETARY;
    case UserRole.SECTOR_SECRETARY:
      return UserRole.GENERAL_SECRETARY;
    case UserRole.GENERAL_SECRETARY:
      return null; // General secretary has no superior evaluator
  }
}
