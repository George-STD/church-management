import { Request, Response, NextFunction } from 'express';
import { prisma } from '../config/db.js';

export async function logAudit(
  actorId: string,
  action: string,
  entityType: string,
  entityId: string,
  details?: Record<string, any>,
  req?: Request
): Promise<void> {
  try {
    const ipAddress = req?.ip || (req?.headers['x-forwarded-for'] as string) || undefined;
    const userAgent = req?.headers['user-agent'] || undefined;

    await prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        details: details || {},
        ipAddress,
        userAgent,
      },
    });
  } catch (err) {
    // Non-blocking for critical paths, but logged to stdout
    console.error('⚠️ Failed to write audit log:', err);
  }
}
