import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { UserRole, FollowUpItemType, ROLE_HIERARCHY_LEVEL } from '@church/shared';
import { config } from '../../config/index.js';
import { logAudit } from '../../middleware/audit.js';

const sessionSchema = z.object({
  date: z.string().min(1, 'التاريخ مطلوب'),
  title: z.string().optional(),
  stageId: z.string().optional(),
  sectorId: z.string().optional(),
  sessionType: z.enum(['SERVICE', 'MASS', 'MEETING', 'ACTIVITY']).default('SERVICE'),
});

const batchAttendanceSchema = z.object({
  sessionId: z.string().min(1, 'معرف الجلسة مطلوب'),
  records: z.array(
    z.object({
      targetType: z.enum(['SERVANT', 'SERVED_MEMBER']),
      targetId: z.string().min(1),
      itemType: z.nativeEnum(FollowUpItemType),
      attended: z.boolean(),
      notes: z.string().optional().nullable(),
    })
  ),
});

export async function listSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { stageId } = req.query;

    let whereClause: any = {};
    if (stageId) {
      whereClause.stageId = stageId as string;
    } else if (user.role !== UserRole.GENERAL_SECRETARY && user.stageId) {
      whereClause.stageId = user.stageId;
    }

    const sessions = await prisma.followUpSession.findMany({
      where: whereClause,
      orderBy: { date: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: sessions });
  } catch (err) {
    next(err);
  }
}

export async function createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const body = sessionSchema.parse(req.body);

    if (ROLE_HIERARCHY_LEVEL[user.role] < ROLE_HIERARCHY_LEVEL[UserRole.ASSISTANT_SECRETARY]) {
      res.status(403).json({ success: false, message: 'إنشاء جلسات الحضور مقتصر على مساعد أمين الخدمة فما فوق' });
      return;
    }

    const session = await prisma.followUpSession.create({
      data: {
        date: new Date(body.date),
        title: body.title || 'خدمة أسبوعية',
        stageId: body.stageId || user.stageId,
        sectorId: body.sectorId || user.sectorId,
        sessionType: body.sessionType,
      },
    });

    res.status(201).json({ success: true, message: 'تم إنشاء جلسة الحضور بنجاح', data: session });
  } catch (err) {
    next(err);
  }
}

export async function getSessionRecords(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const records = await prisma.followUpRecord.findMany({
      where: { sessionId: id },
    });
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
}

export async function recordBatchAttendance(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { sessionId, records } = batchAttendanceSchema.parse(req.body);

    const session = await prisma.followUpSession.findUnique({ where: { id: sessionId } });
    if (!session) {
      res.status(404).json({ success: false, message: 'الجلسة غير موجودة' });
      return;
    }

    // FR-4.1: Subjects cannot record their own attendance!
    for (const r of records) {
      if (r.targetType === 'SERVANT' && r.targetId === user.id) {
        res.status(403).json({
          success: false,
          message: 'غير مسموح للخادم بتسجيل حضور نفسه؛ تسجيل حضور الخادم اختصاص أمين الخدمة المشرف فقط (FR-4.1)',
        });
        return;
      }
    }

    // Delete existing records for this session for these targets to avoid duplicates
    for (const r of records) {
      await prisma.followUpRecord.deleteMany({
        where: {
          sessionId,
          targetType: r.targetType as any,
          targetId: r.targetId,
          itemType: r.itemType as any,
        },
      });

      await prisma.followUpRecord.create({
        data: {
          sessionId,
          targetType: r.targetType as any,
          targetId: r.targetId,
          itemType: r.itemType as any,
          attended: r.attended,
          notes: r.notes,
          recordedById: user.id,
          date: session.date,
        },
      });

      // Consecutive Absence Detection Engine (FR-4.3 / FR-11.1)
      if (!r.attended && r.itemType === FollowUpItemType.SERVICE) {
        await checkConsecutiveAbsence(r.targetType, r.targetId, session.stageId || user.stageId || '', user.id);
      }
    }

    await logAudit(user.id, 'RECORD_ATTENDANCE', 'FollowUpSession', sessionId, { count: records.length }, req);

    res.json({ success: true, message: 'تم حفظ سجلات الحضور بنجاح' });
  } catch (err) {
    next(err);
  }
}

/**
 * Checks if target has accumulated >= threshold consecutive absences
 * and dispatches alert notification
 */
async function checkConsecutiveAbsence(targetType: 'SERVANT' | 'SERVED_MEMBER', targetId: string, stageId: string, actorId: string) {
  const threshold = config.ABSENCE_ALERT_THRESHOLD;

  const recentRecords = await prisma.followUpRecord.findMany({
    where: {
      targetType,
      targetId,
      itemType: FollowUpItemType.SERVICE,
    },
    orderBy: { date: 'desc' },
    take: threshold,
  });

  if (recentRecords.length >= threshold && recentRecords.every((rec) => !rec.attended)) {
    // Target has missed consecutively!
    let targetName = '';
    let responsibleId = actorId;

    if (targetType === 'SERVED_MEMBER') {
      const member = await prisma.servedMember.findUnique({
        where: { id: targetId },
        include: { assignments: true },
      });
      targetName = member?.fullName || 'مخدوم';
      if (member?.assignments[0]) {
        responsibleId = member.assignments[0].servantId;
      }
    } else {
      const servant = await prisma.user.findUnique({ where: { id: targetId } });
      targetName = servant?.fullName || 'خادم';
    }

    // Create alert record
    await prisma.consecutiveAbsenceAlert.create({
      data: {
        targetType,
        targetId,
        consecutiveCount: threshold,
        responsibleId,
        stageId,
      },
    });

    // Send in-app notification to the responsible servant/secretary (FR-11.1)
    await prisma.notification.create({
      data: {
        userId: responsibleId,
        type: 'ABSENCE_ALERT',
        title: `تنبيه غياب متكرر: ${targetName}`,
        message: `المخدوم / الخادم (${targetName}) غائب لعدد ${threshold} أسابيع متتالية في الخدمة. يرجى المتابعة والافتفاد الفوري.`,
        link: `/follow-up`,
      },
    });
  }
}

export async function getAbsenceAlerts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    let whereClause: any = { resolved: false };

    if (user.role === UserRole.SERVANT) {
      whereClause.responsibleId = user.id;
    } else if (user.role !== UserRole.GENERAL_SECRETARY && user.stageId) {
      whereClause.stageId = user.stageId;
    }

    const alerts = await prisma.consecutiveAbsenceAlert.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, data: alerts });
  } catch (err) {
    next(err);
  }
}

export async function resolveAbsenceAlert(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const alert = await prisma.consecutiveAbsenceAlert.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date() },
    });
    res.json({ success: true, message: 'تم إغلاق تنبيه الغياب والافتقاد', data: alert });
  } catch (err) {
    next(err);
  }
}
