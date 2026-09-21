import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { UserRole, ScopeType, YearPlanCategory, ROLE_HIERARCHY_LEVEL } from '@church/shared';

const yearPlanSchema = z.object({
  title: z.string().min(2, 'عنوان الفعالية أو التدبير مطلوب'),
  date: z.string().min(1, 'تاريخ البدء مطلوب'),
  endDate: z.string().optional().nullable(),
  category: z.nativeEnum(YearPlanCategory).default(YearPlanCategory.ACTIVITY),
  description: z.string().optional().nullable(),
  scopeType: z.nativeEnum(ScopeType).default(ScopeType.STAGE),
  scopeId: z.string().optional(),
});

export async function listYearPlanItems(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;

    // Servants see: official items for stage/sector/org + servant posts in their own stage
    const items = await prisma.yearPlanItem.findMany({
      where: {
        OR: [
          { scopeType: ScopeType.ORGANIZATION },
          { scopeType: ScopeType.SECTOR, scopeId: user.sectorId || undefined },
          { scopeType: ScopeType.STAGE, scopeId: user.stageId || undefined },
        ],
      },
      include: {
        author: { select: { id: true, fullName: true, role: true } },
        signups: {
          include: {
            user: { select: { id: true, fullName: true, phone: true } },
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    res.json({ success: true, data: items });
  } catch (err) {
    next(err);
  }
}

export async function createYearPlanItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const body = yearPlanSchema.parse(req.body);

    const isSupervisor = ROLE_HIERARCHY_LEVEL[user.role] >= ROLE_HIERARCHY_LEVEL[UserRole.STAGE_SECRETARY];

    // FR-7.4: Servants can post an update, but it is not official and locked to their stage
    const isOfficial = isSupervisor;
    const scopeType = isSupervisor ? body.scopeType : ScopeType.STAGE;
    const scopeId = isSupervisor ? (body.scopeId || user.stageId || 'ORG') : (user.stageId || '');

    const item = await prisma.yearPlanItem.create({
      data: {
        title: body.title,
        date: new Date(body.date),
        endDate: body.endDate ? new Date(body.endDate) : undefined,
        category: body.category,
        description: body.description,
        scopeType,
        scopeId,
        createdById: user.id,
        isOfficial,
      },
      include: { author: true },
    });

    res.status(201).json({
      success: true,
      message: isOfficial ? 'تم إضافة البند إلى تدبير السنة المعتمد' : 'تم نشر التحديث لمرحلتك بنجاح',
      data: item,
    });
  } catch (err) {
    next(err);
  }
}

export async function signupForPlanItem(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const id = req.params.id as string;
    const { roleNotes } = req.body;

    const signup = await prisma.yearPlanSignup.upsert({
      where: {
        yearPlanItemId_userId: {
          yearPlanItemId: id,
          userId: user.id,
        },
      },
      update: { roleNotes },
      create: {
        yearPlanItemId: id,
        userId: user.id,
        roleNotes,
      },
    });

    res.json({ success: true, message: 'تم تسجيلك بنجاح للمشاركة في النشاط', data: signup });
  } catch (err) {
    next(err);
  }
}
