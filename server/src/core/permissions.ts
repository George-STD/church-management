import { UserRole, ROLE_HIERARCHY_LEVEL, Action, getEvaluatorRoleFor, canTargetRoleInAnnouncement } from '@church/shared';

export interface AuthUser {
  id: string;
  phone: string;
  email?: string | null;
  fullName: string;
  role: UserRole;
  stageId?: string | null;
  sectorId?: string | null;
  status: string;
}

export interface ResourceScope {
  stageId?: string | null;
  sectorId?: string | null;
  assignedServantIds?: string[];
  targetUserId?: string | null;
}

/**
 * Checks whether an authenticated user has the organizational scope authority
 * over a given resource (Stage, Sector, Organization, or Self/Assigned).
 */
export function hasScopeAuthority(
  user: AuthUser,
  resource: ResourceScope,
  sectorStageMap?: Record<string, string> // stageId -> sectorId mapping
): boolean {
  // 1. General Secretary has organization-wide authority
  if (user.role === UserRole.GENERAL_SECRETARY) {
    return true;
  }

  // 2. Direct user match (Self access)
  if (resource.targetUserId && resource.targetUserId === user.id) {
    return true;
  }

  // 3. Sector Secretary has authority over their sector and all stages inside it
  if (user.role === UserRole.SECTOR_SECRETARY) {
    if (!user.sectorId) return false;
    if (resource.sectorId && resource.sectorId === user.sectorId) {
      return true;
    }
    if (resource.stageId && sectorStageMap && sectorStageMap[resource.stageId] === user.sectorId) {
      return true;
    }
    return false;
  }

  // 4. Stage Secretary and Assistant Secretary have authority over their stage
  if (user.role === UserRole.STAGE_SECRETARY || user.role === UserRole.ASSISTANT_SECRETARY) {
    if (!user.stageId) return false;
    return resource.stageId === user.stageId;
  }

  // 5. Servant has authority only over themselves or explicitly assigned members
  if (user.role === UserRole.SERVANT) {
    if (resource.targetUserId === user.id) {
      return true;
    }
    if (resource.assignedServantIds && resource.assignedServantIds.includes(user.id)) {
      return true;
    }
    return false;
  }

  return false;
}

/**
 * Verifies if the actor is authorized to set/edit the evaluative fields
 * of a given subject servant (SRS A1).
 */
export function canEvaluateServant(actor: AuthUser, subject: { id: string; role: UserRole; stageId?: string | null; sectorId?: string | null }): boolean {
  const expectedRole = getEvaluatorRoleFor(subject.role);
  if (!expectedRole) {
    return false; // Subject cannot be evaluated (e.g. General Secretary)
  }

  if (actor.role !== expectedRole && ROLE_HIERARCHY_LEVEL[actor.role] < ROLE_HIERARCHY_LEVEL[expectedRole]) {
    return false;
  }

  // Check organizational scope
  if (actor.role === UserRole.GENERAL_SECRETARY) return true;
  if (actor.role === UserRole.SECTOR_SECRETARY) {
    return actor.sectorId === subject.sectorId;
  }
  if (actor.role === UserRole.STAGE_SECRETARY) {
    return actor.stageId === subject.stageId;
  }

  return false;
}

/**
 * Verifies if an author can send an announcement to specific target roles (SRS FR-10.2).
 * Senders can only target roles AT OR BELOW their own level in the hierarchy.
 */
export function validateAnnouncementAudience(authorRole: UserRole, targetRoles: UserRole[]): boolean {
  // Author must be at least STAGE_SECRETARY to author announcements
  if (ROLE_HIERARCHY_LEVEL[authorRole] < ROLE_HIERARCHY_LEVEL[UserRole.STAGE_SECRETARY]) {
    return false;
  }

  // Every target role must be at or below author's level
  return targetRoles.every((role) => canTargetRoleInAnnouncement(authorRole, role));
}
