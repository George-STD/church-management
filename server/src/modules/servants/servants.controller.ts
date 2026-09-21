import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { UserRole, ROLE_HIERARCHY_LEVEL, AccountStatus } from '@church/shared';
import { canEvaluateServant, hasScopeAuthority } from '../../core/permissions.js';
import { logAudit } from '../../middleware/audit.js';

// Schema for updating own profile (non-evaluative)
const updateOwnProfileSchema = z.object({
  fullName: z.string().min(2, 'الاسم الكامل مطلوب').optional(),
  phone: z.string().min(10, 'رقم الهاتف يجب أن يكون صالحاً').optional(),
  email: z.string().email('بريد إلكتروني غير صالح').optional().nullable(),
  fatherConfessor: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  maritalStatus: z.string().optional().nullable(),
  spouseName: z.string().optional().nullable(),
  educationCareerStage: z.string().optional().nullable(),
  childrenJson: z.any().optional(),
});

// Schema for updating evaluative fields
const updateEvaluationSchema = z.object({
  financialStatus: z.string().optional().nullable(),
  behaviorWithServed: z.string().optional().nullable(),
  behaviorWithServants: z.string().optional().nullable(),
  cooperation: z.string().optional().nullable(),
  individualWork: z.string().optional().nullable(),
  periodNotes: z.string().optional().nullable(),
});

// Schema for creating new servant account (FR-1.2)
const createServantSchema = z.object({
  phone: z.string().min(10, 'رقم الهاتف مطلوب'),
  email: z.string().email().optional(),
  fullName: z.string().min(2, 'الاسم الكامل مطلوب'),
  password: z.string().min(6, 'كلمة المرور يجب ألا تقل عن 6 أحرف'),
  role: z.nativeEnum(UserRole).default(UserRole.SERVANT),
  stageId: z.string().optional(),
  sectorId: z.string().optional(),
  fatherConfessor: z.string().optional(),
  address: z.string().optional(),
  maritalStatus: z.string().optional(),
});

export async function listServants(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    let whereClause: any = {};

    // Apply strict scope filter based on actor's role
    if (user.role === UserRole.GENERAL_SECRETARY) {
      whereClause = {}; // All servants
    } else if (user.role === UserRole.SECTOR_SECRETARY) {
      whereClause = {
        OR: [
          { sectorId: user.sectorId },
          { stage: { sectorId: user.sectorId } },
        ],
      };
    } else if (user.role === UserRole.STAGE_SECRETARY || user.role === UserRole.ASSISTANT_SECRETARY) {
      whereClause = { stageId: user.stageId };
    } else {
      // Regular servant can only list servants in their stage
      whereClause = { stageId: user.stageId };
    }

    const servants = await prisma.user.findMany({
      where: whereClause,
      include: {
        stage: true,
        sector: true,
      },
      orderBy: { fullName: 'asc' },
    });

    const sanitized = servants.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      phone: s.phone,
      email: s.email,
      role: s.role,
      status: s.status,
      stageId: s.stageId,
      stageName: s.stage?.name,
      sectorId: s.sectorId,
      sectorName: s.sector?.name,
      fatherConfessor: s.fatherConfessor,
      educationCareerStage: s.educationCareerStage,
      maritalStatus: s.maritalStatus,
    }));

    res.json({ success: true, data: sanitized });
  } catch (err) {
    next(err);
  }
}

export async function getServantById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const id = req.params.id as string;

    const servant = await prisma.user.findUnique({
      where: { id },
      include: {
        stage: true,
        sector: true,
        receivedEvaluations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            evaluator: { select: { fullName: true, role: true } },
          },
        },
      },
    });

    if (!servant) {
      res.status(404).json({ success: false, message: 'الخادم غير موجود' });
      return;
    }

    // Determine if caller has permission to view evaluative fields
    // Evaluative fields are read-only to the subject, visible to direct supervisor & superiors
    const canSeeEvaluations =
      user.id !== servant.id &&
      ROLE_HIERARCHY_LEVEL[user.role] > ROLE_HIERARCHY_LEVEL[servant.role as unknown as UserRole];

    const evaluation = canSeeEvaluations && servant.receivedEvaluations[0] ? servant.receivedEvaluations[0] : null;

    res.json({
      success: true,
      data: {
        id: servant.id,
        fullName: servant.fullName,
        phone: servant.phone,
        email: servant.email,
        role: servant.role,
        status: servant.status,
        stageId: servant.stageId,
        stageName: servant.stage?.name,
        sectorId: servant.sectorId,
        sectorName: servant.sector?.name,
        fatherConfessor: servant.fatherConfessor,
        dateOfBirth: servant.dateOfBirth,
        address: servant.address,
        maritalStatus: servant.maritalStatus,
        spouseName: servant.spouseName,
        educationCareerStage: servant.educationCareerStage,
        childrenJson: servant.childrenJson,
        createdAt: servant.createdAt,
        evaluation: evaluation
          ? {
              financialStatus: evaluation.financialStatus,
              behaviorWithServed: evaluation.behaviorWithServed,
              behaviorWithServants: evaluation.behaviorWithServants,
              cooperation: evaluation.cooperation,
              individualWork: evaluation.individualWork,
              periodNotes: evaluation.periodNotes,
              evaluatorName: evaluation.evaluator.fullName,
              evaluatorRole: evaluation.evaluator.role,
              updatedAt: evaluation.updatedAt,
            }
          : null,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function updateOwnProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const body = updateOwnProfileSchema.parse(req.body);

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        fullName: body.fullName,
        phone: body.phone,
        email: body.email,
        fatherConfessor: body.fatherConfessor,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        address: body.address,
        maritalStatus: body.maritalStatus,
        spouseName: body.spouseName,
        educationCareerStage: body.educationCareerStage,
        childrenJson: body.childrenJson,
      },
    });

    await logAudit(user.id, 'UPDATE_OWN_PROFILE', 'User', user.id, body, req);

    res.json({
      success: true,
      message: 'تم تحديث البيانات الشخصية بنجاح',
      data: updated,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateServantEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actor = req.user!;
    const id = req.params.id as string;
    const body = updateEvaluationSchema.parse(req.body);

    const subject = await prisma.user.findUnique({ where: { id } });
    if (!subject) {
      res.status(404).json({ success: false, message: 'الخادم غير موجود' });
      return;
    }

    // Strict FR-2.2 & A1: Check evaluative authority
    const authorized = canEvaluateServant(actor, {
      id: subject.id,
      role: subject.role as unknown as UserRole,
      stageId: subject.stageId,
      sectorId: subject.sectorId,
    });

    if (!authorized) {
      res.status(403).json({
        success: false,
        message: 'غير مصرح لك بتعديل التقييم لهذا الخادم وفقاً لقواعد التسلسل الهرمي للخدمة (SRS FR-2.2)',
      });
      return;
    }

    const evaluation = await prisma.servantEvaluativeRecord.create({
      data: {
        servantId: subject.id,
        evaluatorId: actor.id,
        financialStatus: body.financialStatus,
        behaviorWithServed: body.behaviorWithServed,
        behaviorWithServants: body.behaviorWithServants,
        cooperation: body.cooperation,
        individualWork: body.individualWork,
        periodNotes: body.periodNotes,
      },
    });

    await logAudit(actor.id, 'UPDATE_EVALUATION', 'ServantEvaluativeRecord', evaluation.id, { subjectId: subject.id, ...body }, req);

    res.json({
      success: true,
      message: 'تم حفظ التقييم بنجاح في السجل التراكمي',
      data: evaluation,
    });
  } catch (err) {
    next(err);
  }
}

export async function createServant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actor = req.user!;
    const body = createServantSchema.parse(req.body);

    // Caller must be at least Stage Secretary (FR-1.2)
    if (ROLE_HIERARCHY_LEVEL[actor.role] < ROLE_HIERARCHY_LEVEL[UserRole.STAGE_SECRETARY]) {
      res.status(403).json({ success: false, message: 'إنشاء الحسابات مقتصر على أمين الخدمة فما فوق' });
      return;
    }

    // Role created cannot be equal or higher than actor's own role (unless General Secretary)
    if (actor.role !== UserRole.GENERAL_SECRETARY && ROLE_HIERARCHY_LEVEL[body.role] >= ROLE_HIERARCHY_LEVEL[actor.role]) {
      res.status(403).json({ success: false, message: 'لا يمكنك إنشاء حساب بدور أعلى من أو مساوٍ لدورك' });
      return;
    }

    const passwordHash = await bcrypt.hash(body.password, 10);

    const newServant = await prisma.user.create({
      data: {
        phone: body.phone,
        email: body.email,
        fullName: body.fullName,
        passwordHash,
        role: body.role as any,
        stageId: body.stageId || actor.stageId,
        sectorId: body.sectorId || actor.sectorId,
        fatherConfessor: body.fatherConfessor,
        address: body.address,
        maritalStatus: body.maritalStatus,
        status: AccountStatus.ACTIVE as any,
      },
    });

    await logAudit(actor.id, 'CREATE_SERVANT_ACCOUNT', 'User', newServant.id, { role: newServant.role, phone: newServant.phone }, req);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء حساب الخادم بنجاح',
      data: { id: newServant.id, fullName: newServant.fullName, phone: newServant.phone, role: newServant.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function transferServant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actor = req.user!;
    const id = req.params.id as string;
    const { toStageId, toSectorId, reason } = req.body;

    if (actor.role !== UserRole.GENERAL_SECRETARY) {
      res.status(403).json({ success: false, message: 'نقل الخدام صلاحية حصرية للأمين العام (FR-1.4)' });
      return;
    }

    const subject = await prisma.user.findUnique({ where: { id } });
    if (!subject) {
      res.status(404).json({ success: false, message: 'الخادم غير موجود' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        stageId: toStageId || subject.stageId,
        sectorId: toSectorId || subject.sectorId,
      },
    });

    await prisma.transferHistory.create({
      data: {
        userId: subject.id,
        adminId: actor.id,
        actionType: 'TRANSFER',
        fromStageId: subject.stageId,
        toStageId: toStageId,
        fromSectorId: subject.sectorId,
        toSectorId: toSectorId,
        reason,
      },
    });

    await logAudit(actor.id, 'TRANSFER_SERVANT', 'User', subject.id, { fromStageId: subject.stageId, toStageId, reason }, req);

    res.json({ success: true, message: 'تم نقل الخادم وتسجيل العملية في سجل الانتقالات', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function suspendServant(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const actor = req.user!;
    const id = req.params.id as string;
    const { status, reason } = req.body; // 'SUSPENDED' or 'ACTIVE'

    if (actor.role !== UserRole.GENERAL_SECRETARY) {
      res.status(403).json({ success: false, message: 'تجميد الحسابات صلاحية حصرية للأمين العام (FR-1.4)' });
      return;
    }

    const subject = await prisma.user.findUnique({ where: { id } });
    if (!subject) {
      res.status(404).json({ success: false, message: 'الخادم غير موجود' });
      return;
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: status as any },
    });

    await prisma.transferHistory.create({
      data: {
        userId: subject.id,
        adminId: actor.id,
        actionType: status === 'SUSPENDED' ? 'SUSPENSION' : 'REACTIVATION',
        previousStatus: subject.status,
        newStatus: status,
        reason,
      },
    });

    await logAudit(actor.id, status === 'SUSPENDED' ? 'SUSPEND_SERVANT' : 'REACTIVATE_SERVANT', 'User', subject.id, { reason }, req);

    res.json({ success: true, message: `تم تحديث حالة الحساب إلى ${status}`, data: updated });
  } catch (err) {
    next(err);
  }
}
