import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { UserRole, PrepStatus, ROLE_HIERARCHY_LEVEL } from '@church/shared';

const prepSchema = z.object({
  date: z.string().min(1, 'التاريخ مطلوب'),
  stageId: z.string().optional(),
  topic: z.string().min(2, 'موضوع الدرس مطلوب'),
  biblicalReference: z.string().optional().nullable(),
  objectivesJson: z.any().optional(),
  content: z.string().min(10, 'محتوى الدرس مطلوب بالتفصيل'),
  attachmentUrls: z.array(z.string()).optional(),
});

const reviewSchema = z.object({
  status: z.nativeEnum(PrepStatus),
  feedback: z.string().optional(),
});

export async function listPreps(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { stageId } = req.query;

    let whereClause: any = {};

    if (user.role === UserRole.SERVANT) {
      whereClause.authorId = user.id; // Servants see their own
    } else if (user.role === UserRole.GENERAL_SECRETARY) {
      if (stageId) whereClause.stageId = stageId as string;
    } else if (user.role === UserRole.SECTOR_SECRETARY) {
      whereClause.stage = { sectorId: user.sectorId };
    } else {
      // Stage Secretary or Assistant
      whereClause.stageId = user.stageId;
    }

    const preps = await prisma.lessonPrep.findMany({
      where: whereClause,
      include: {
        author: { select: { id: true, fullName: true, role: true } },
        reviewer: { select: { id: true, fullName: true } },
        stage: true,
      },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: preps });
  } catch (err) {
    next(err);
  }
}

export async function getPrepById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string;
    const prep = await prisma.lessonPrep.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, fullName: true, role: true, phone: true } },
        reviewer: { select: { id: true, fullName: true } },
        stage: true,
      },
    });

    if (!prep) {
      res.status(404).json({ success: false, message: 'التحضير غير موجود' });
      return;
    }

    res.json({ success: true, data: prep });
  } catch (err) {
    next(err);
  }
}

export async function createPrep(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const body = prepSchema.parse(req.body);

    const prep = await prisma.lessonPrep.create({
      data: {
        authorId: user.id,
        stageId: body.stageId || user.stageId || '',
        date: new Date(body.date),
        topic: body.topic,
        biblicalReference: body.biblicalReference,
        objectivesJson: body.objectivesJson || [],
        content: body.content,
        attachmentUrls: body.attachmentUrls || [],
        status: PrepStatus.SUBMITTED,
      },
    });

    res.status(201).json({ success: true, message: 'تم إرسال التحضير بنجاح للمراجعة والاعتماد', data: prep });
  } catch (err) {
    next(err);
  }
}

export async function reviewPrep(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const id = req.params.id as string;
    const { status, feedback } = reviewSchema.parse(req.body);

    if (ROLE_HIERARCHY_LEVEL[user.role] < ROLE_HIERARCHY_LEVEL[UserRole.STAGE_SECRETARY]) {
      res.status(403).json({ success: false, message: 'اعتماد ومراجعة التحضير مقتصر على أمين الخدمة فما فوق (FR-5.2)' });
      return;
    }

    const updated = await prisma.lessonPrep.update({
      where: { id },
      data: {
        status,
        feedback,
        reviewerId: user.id,
      },
      include: { author: true },
    });

    // Notify author of review
    await prisma.notification.create({
      data: {
        userId: updated.authorId,
        type: 'PREP_REVIEW',
        title: `تمت مراجعة تحضيرك: ${updated.topic}`,
        message: `حالة التحضير الآن: ${status === 'APPROVED' ? 'معتمد' : 'يحتاج تعديل'}. ملاحظات المراجع: ${feedback || 'لا توجد'}`,
        link: `/prep/${updated.id}`,
      },
    });

    res.json({ success: true, message: 'تم حفظ اعتماد وملاحظات التحضير', data: updated });
  } catch (err) {
    next(err);
  }
}
