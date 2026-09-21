import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { UserRole, ScopeType, ROLE_HIERARCHY_LEVEL } from '@church/shared';
import { validateAnnouncementAudience } from '../../core/permissions.js';

const announcementSchema = z.object({
  title: z.string().min(2, 'عنوان الإعلان مطلوب'),
  content: z.string().min(5, 'نص الإعلان مطلوب'),
  targetScopeType: z.nativeEnum(ScopeType).default(ScopeType.STAGE),
  targetScopeId: z.string().optional().nullable(),
  targetRoles: z.array(z.nativeEnum(UserRole)).min(1, 'يرجى تحديد فئة الجمهور المستهدفة'),
  targetUserIds: z.array(z.string()).optional(),
});

export async function listAnnouncements(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;

    // Find announcements that target the user's role and scope
    const announcements = await prisma.announcement.findMany({
      where: {
        AND: [
          { targetRoles: { has: user.role as any } },
          {
            OR: [
              { targetScopeType: ScopeType.ORGANIZATION },
              { targetScopeType: ScopeType.SECTOR, targetScopeId: user.sectorId || undefined },
              { targetScopeType: ScopeType.STAGE, targetScopeId: user.stageId || undefined },
              { targetUserIds: { has: user.id } },
            ],
          },
        ],
      },
      include: {
        author: { select: { id: true, fullName: true, role: true } },
        readReceipts: { where: { userId: user.id } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = announcements.map((a) => ({
      id: a.id,
      title: a.title,
      content: a.content,
      authorName: a.author.fullName,
      authorRole: a.author.role,
      createdAt: a.createdAt,
      isRead: a.readReceipts.length > 0,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

export async function createAnnouncement(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const body = announcementSchema.parse(req.body);

    // FR-10.1: Must be at least Stage Secretary
    if (ROLE_HIERARCHY_LEVEL[user.role] < ROLE_HIERARCHY_LEVEL[UserRole.STAGE_SECRETARY]) {
      res.status(403).json({ success: false, message: 'نشر الإعلانات مقتصر على أمين الخدمة فما فوق (FR-10.1)' });
      return;
    }

    // FR-10.2: Validate downward authority (cannot target higher roles)
    const validAudience = validateAnnouncementAudience(user.role, body.targetRoles);
    if (!validAudience) {
      res.status(403).json({
        success: false,
        message: 'لا يمكن توجيه إعلان إلى أدوار أعلى منك في الهيكل التنظيمي (SRS FR-10.2)',
      });
      return;
    }

    const announcement = await prisma.announcement.create({
      data: {
        authorId: user.id,
        authorRole: user.role as any,
        title: body.title,
        content: body.content,
        targetScopeType: body.targetScopeType,
        targetScopeId: body.targetScopeId || user.stageId,
        targetRoles: body.targetRoles as any,
        targetUserIds: body.targetUserIds || [],
      },
    });

    res.status(201).json({ success: true, message: 'تم نشر الإعلان للجمهور المستهدف بنجاح', data: announcement });
  } catch (err) {
    next(err);
  }
}

export async function markAnnouncementAsRead(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const id = req.params.id as string;

    await prisma.announcementRead.upsert({
      where: {
        announcementId_userId: {
          announcementId: id,
          userId: user.id,
        },
      },
      update: {},
      create: {
        announcementId: id,
        userId: user.id,
      },
    });

    res.json({ success: true, message: 'تم تحديد الإعلان كمقروء' });
  } catch (err) {
    next(err);
  }
}
