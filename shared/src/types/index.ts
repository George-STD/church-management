/**
 * Church Service (خدمة) Management System - Domain Types & Interfaces
 * Pure Clean Architecture Domain Definitions
 */

export enum UserRole {
  SERVANT = 'SERVANT',                             // خادم (Base level)
  ASSISTANT_SECRETARY = 'ASSISTANT_SECRETARY',     // مساعد امين الخدمة
  STAGE_SECRETARY = 'STAGE_SECRETARY',             // امين الخدمة / امين المرحلة
  SECTOR_SECRETARY = 'SECTOR_SECRETARY',           // امين قطاع
  GENERAL_SECRETARY = 'GENERAL_SECRETARY',         // امين عام (Organization-wide)
}

export enum AccountStatus {
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  TRANSFERRED = 'TRANSFERRED',
}

export enum ScopeType {
  ORGANIZATION = 'ORGANIZATION',
  SECTOR = 'SECTOR',
  STAGE = 'STAGE',
  SELF = 'SELF',
}

export enum EducationCareerStage {
  STUDYING = 'STUDYING',
  MILITARY_SERVICE = 'MILITARY_SERVICE',
  GRADUATED = 'GRADUATED',
  WORKING = 'WORKING',
}

export enum MaritalStatus {
  SINGLE = 'SINGLE',
  ENGAGED = 'ENGAGED',
  MARRIED = 'MARRIED',
}

export enum FollowUpItemType {
  // Common & Servant items
  MASS = 'MASS',                                           // القداس
  PREPARATION = 'PREPARATION',                             // التحضير
  SERVICE = 'SERVICE',                                     // الخدمة
  VISITATION = 'VISITATION',                               // الافتقاد (Home visit)
  SERVICE_MEETING = 'SERVICE_MEETING',                     // اجتماع الخدمة
  PRAYER_MEETING = 'PRAYER_MEETING',                       // اجتماع الصلاة / الأسرة
  ACTIVITIES = 'ACTIVITIES',                               // الأنشطة / النادي / الرحلة / المؤتمر
  SECRETARIES_MEETING = 'SECRETARIES_MEETING',             // اجتماع الأمناء (امين الخدمة فما فوق)
  STAGE_SECRETARIES_MEETING = 'STAGE_SECRETARIES_MEETING', // اجتماع أمناء المراحل (امين قطاع فما فوق)
}

export enum PrepStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  NEEDS_REVISION = 'NEEDS_REVISION',
}

export enum YearPlanCategory {
  CURRICULUM = 'CURRICULUM',     // مناهج ودروس
  TRIP = 'TRIP',                 // رحلة
  CONFERENCE = 'CONFERENCE',     // مؤتمر
  ACTIVITY = 'ACTIVITY',         // نشاط / نادي
  MEETING = 'MEETING',           // اجتماع روحي / إداري
  OTHER = 'OTHER',
}

// ----------------------------------------------------
// Core Entities
// ----------------------------------------------------

export interface ISector {
  id: string;
  name: string;
  description?: string;
  generalSecretaryId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IStage {
  id: string;
  name: string;
  sectorId: string;
  description?: string;
  genderSplit?: 'ALL' | 'BOYS' | 'GIRLS';
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface IUserProfile {
  id: string;
  phone: string;
  email?: string;
  fullName: string;
  fatherConfessor?: string;
  dateOfBirth?: string;
  address?: string;
  maritalStatus?: MaritalStatus;
  spouseName?: string;
  educationCareerStage?: EducationCareerStage;
  children?: { name: string; age: number }[];
  role: UserRole;
  stageId?: string;
  sectorId?: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface IServantEvaluativeRecord {
  id: string;
  servantId: string;
  evaluatorId: string;
  financialStatus?: string;
  behaviorWithServed?: string;
  behaviorWithServants?: string;
  cooperation?: string;
  individualWork?: string;
  periodNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IServedMember {
  id: string;
  fullName: string;
  fatherConfessor?: string;
  dateOfBirth?: string;
  address?: string;
  phone?: string;
  fatherName?: string;
  fatherAge?: number;
  motherName?: string;
  motherAge?: number;
  schoolUniversity?: string;
  educationalStage?: string;
  siblings?: { name: string; age?: number }[];
  stageId: string;
  assignedServantIds: string[];
  // Evaluative fields (entered by assigned servant)
  financialStatus?: string;
  behaviorInService?: string;
  integrationWithOthers?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IFollowUpRecord {
  id: string;
  sessionId: string;
  targetType: 'SERVANT' | 'SERVED_MEMBER';
  targetId: string;
  itemType: FollowUpItemType;
  attended: boolean;
  notes?: string;
  recordedById: string;
  date: string;
  createdAt: string;
}

export interface IFollowUpSession {
  id: string;
  date: string;
  title?: string;
  stageId?: string;
  sectorId?: string;
  sessionType: 'SERVICE' | 'MASS' | 'MEETING' | 'ACTIVITY';
  createdAt: string;
}

export interface ILessonPrep {
  id: string;
  authorId: string;
  stageId: string;
  date: string;
  topic: string;
  biblicalReference?: string;
  objectives?: string[];
  content: string;
  attachmentUrls?: string[];
  status: PrepStatus;
  feedback?: string;
  reviewerId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ISpiritualLifeEntry {
  id: string;
  userId: string;
  date: string;
  hadCommunion: boolean;
  hadConfession: boolean;
  regularPrayer: boolean;
  scriptureReadingMinutes?: number;
  privateNotes?: string;
  createdAt: string;
}

export interface IYearPlanItem {
  id: string;
  title: string;
  scopeType: ScopeType;
  scopeId: string;
  date: string;
  endDate?: string;
  category: YearPlanCategory;
  description?: string;
  createdById: string;
  isOfficial: boolean;
  signups?: { userId: string; roleNotes?: string; signedUpAt: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface IPrivateNote {
  id: string;
  subjectId: string;
  authorId: string;
  authorRole: UserRole;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface IPoll {
  id: string;
  createdById: string;
  scopeType: ScopeType;
  scopeId?: string;
  question: string;
  options: { id: string; text: string }[];
  votes?: { userId: string; optionId: string; votedAt: string }[];
  deadline?: string;
  isClosed: boolean;
  createdAt: string;
}

export interface IAnnouncement {
  id: string;
  authorId: string;
  authorRole: UserRole;
  title: string;
  content: string;
  targetScopeType: ScopeType;
  targetScopeId?: string;
  targetRoles: UserRole[];
  targetUserIds?: string[];
  readByUserIds: string[];
  createdAt: string;
}

export interface IAuditLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}
