import { Request, Response, NextFunction } from 'express';
import { UserRole, ROLE_HIERARCHY_LEVEL } from '@church/shared';

/**
 * Ensures the authenticated user has at least the minimum specified role level in the hierarchy.
 */
export function requireMinRole(minRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'غير مصرح (Unauthenticated)' });
      return;
    }

    const userLevel = ROLE_HIERARCHY_LEVEL[req.user.role];
    const requiredLevel = ROLE_HIERARCHY_LEVEL[minRole];

    if (userLevel < requiredLevel) {
      res.status(403).json({
        success: false,
        message: 'ليس لديك الصلاحيات الكافية لتنفيذ هذا الإجراء (Forbidden: Insufficient role level)',
      });
      return;
    }

    next();
  };
}

/**
 * Ensures the user has one of the specific listed roles.
 */
export function requireExactRoles(roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'غير مصرح (Unauthenticated)' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: 'الدور الحالي لا يسمح بهذا الإجراء (Forbidden)',
      });
      return;
    }

    next();
  };
}
