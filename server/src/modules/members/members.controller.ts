import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { UserRole, ROLE_HIERARCHY_LEVEL } from '@church/shared';
import { logAudit } from '../../middleware/audit.js';

const memberSchema = z.object({
  fullName: z.string().min(2, 'اسم المخدوم مطلوب'),
  fatherConfessor: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  fatherName: z.string().optional().nullable(),
  fatherAge: z.number().optional().nullable(),
  motherName: z.string().optional().nullable(),
  motherAge: z.number().optional().nullable(),
  schoolUniversity: z.string().optional().nullable(),
  educationalStage: z.string().optional().nullable(),
  siblingsJson: z.any().optional(),
  stageId: z.string().min(1, 'المرحلة مطلوبة'),
  assignedServantIds: z.array(z.string()).optional(),
});

const memberEvaluationSchema = z.object({
  financialStatus: z.string().optional().nullable(),
  behaviorInService: z.string().optional().nullable(),
  integrationWithOthers: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function listMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { stageId, assignedOnly, search } = req.query;

    let whereClause: any = {};

    // Scoping rules
    if (user.role === UserRole.GENERAL_SECRETARY) {
      if (stageId) whereClause.stageId = stageId as string;
    } else if (user.role === UserRole.SECTOR_SECRETARY) {
      whereClause.stage = { sectorId: user.sectorId };
      if (stageId) whereClause.stageId = stageId as string;
    } else {
      // Stage Secretary, Assistant, Servant -> Scoped to their stage
      whereClause.stageId = user.stageId;
    }

    if (assignedOnly === 'true' || user.role === UserRole.SERVANT) {
      // Servants see assigned by default unless they filter
      if (assignedOnly === 'true') {
        whereClause.assignments = { some: { servantId: user.id } };
      }
    }

    if (search) {
      whereClause.fullName = { contains: search as string, mode: 'insensitive' };
    }

    const members = await prisma.servedMember.findMany({
      where: whereClause,
      include: {
        stage: true,
        assignments: {
          include: {
            servant: { select: { id: true, fullName: true, phone: true } },
          },
        },
        evaluations: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { fullName: 'asc' },
    });

    const formatted = members.map((m) => ({
      id: m.id,
      fullName: m.fullName,
      phone: m.phone,
      stageId: m.stageId,
      stageName: m.stage.name,
      educationalStage: m.educationalStage,
      schoolUniversity: m.schoolUniversity,
      fatherName: m.fatherName,
      motherName: m.motherName,
      assignedServants: m.assignments.map((a) => a.servant),
      isAssignedToMe: m.assignments.some((a) => a.servantId === user.id),
      latestEvaluation: m.evaluations[0] || null,
    }));

    res.json({ success: true, data: formatted });
  } catch (err) {
    next(err);
  }
}

export async function getMemberById(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const id = req.params.id as string;

    const member = await prisma.servedMember.findUnique({
      where: { id },
      include: {
        stage: true,
        assignments: {
          include: {
            servant: { select: { id: true, fullName: true, phone: true, role: true } },
          },
        },
        evaluations: {
          orderBy: { createdAt: 'desc' },
          include: {
            servant: { select: { id: true, fullName: true } },
          },
        },
      },
    });

    if (!member) {
      res.status(404).json({ success: false, message: 'المخدوم غير موجود' });
      return;
    }

    res.json({ success: true, data: member });
  } catch (err) {
    next(err);
  }
}

export async function createMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const body = memberSchema.parse(req.body);

    // Assistant Secretary & above can create (FR-3.2)
    if (ROLE_HIERARCHY_LEVEL[user.role] < ROLE_HIERARCHY_LEVEL[UserRole.ASSISTANT_SECRETARY]) {
      res.status(403).json({ success: false, message: 'إضافة مخدوم جديد مقتصر على مساعد أمين الخدمة فما فوق (FR-3.2)' });
      return;
    }

    const member = await prisma.servedMember.create({
      data: {
        fullName: body.fullName,
        fatherConfessor: body.fatherConfessor,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        address: body.address,
        phone: body.phone,
        fatherName: body.fatherName,
        fatherAge: body.fatherAge,
        motherName: body.motherName,
        motherAge: body.motherAge,
        schoolUniversity: body.schoolUniversity,
        educationalStage: body.educationalStage,
        siblingsJson: body.siblingsJson,
        stageId: body.stageId,
        assignments: body.assignedServantIds
          ? {
              create: body.assignedServantIds.map((servantId) => ({ servantId })),
            }
          : undefined,
      },
      include: { assignments: true },
    });

    await logAudit(user.id, 'CREATE_MEMBER', 'ServedMember', member.id, { fullName: member.fullName }, req);

    res.status(201).json({ success: true, message: 'تمت إضافة المخدوم بنجاح', data: member });
  } catch (err) {
    next(err);
  }
}

export async function updateMember(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const id = req.params.id as string;
    const body = memberSchema.parse(req.body);

    // Assistant Secretary & above can edit full profile (FR-3.2)
    if (ROLE_HIERARCHY_LEVEL[user.role] < ROLE_HIERARCHY_LEVEL[UserRole.ASSISTANT_SECRETARY]) {
      res.status(403).json({ success: false, message: 'تعديل بيانات المخدوم مقتصر على مساعد أمين الخدمة فما فوق (FR-3.2)' });
      return;
    }

    const updated = await prisma.servedMember.update({
      where: { id },
      data: {
        fullName: body.fullName,
        fatherConfessor: body.fatherConfessor,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
        address: body.address,
        phone: body.phone,
        fatherName: body.fatherName,
        fatherAge: body.fatherAge,
        motherName: body.motherName,
        motherAge: body.motherAge,
        schoolUniversity: body.schoolUniversity,
        educationalStage: body.educationalStage,
        siblingsJson: body.siblingsJson,
        stageId: body.stageId,
      },
    });

    if (body.assignedServantIds) {
      await prisma.memberServantAssignment.deleteMany({ where: { memberId: id } });
      await prisma.memberServantAssignment.createMany({
        data: body.assignedServantIds.map((servantId) => ({ memberId: id, servantId })),
      });
    }

    await logAudit(user.id, 'UPDATE_MEMBER', 'ServedMember', id, body, req);

    res.json({ success: true, message: 'تم تحديث بيانات المخدوم بنجاح', data: updated });
  } catch (err) {
    next(err);
  }
}

export async function updateMemberEvaluation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const id = req.params.id as string;
    const body = memberEvaluationSchema.parse(req.body);

    // FR-3.1 & A2:
    // If role is SERVANT, verify that the member is directly assigned to him
    if (user.role === UserRole.SERVANT) {
      const assignment = await prisma.memberServantAssignment.findUnique({
        where: { memberId_servantId: { memberId: id, servantId: user.id } },
      });

      if (!assignment) {
        res.status(403).json({
          success: false,
          message: 'الخادم مصرح له بتعديل التقييم للمخدومين المسندين إليه فقط (FR-3.1)',
        });
        return;
      }
    }

    const evaluation = await prisma.memberEvaluativeRecord.create({
      data: {
        memberId: id,
        servantId: user.id,
        financialStatus: body.financialStatus,
        behaviorInService: body.behaviorInService,
        integrationWithOthers: body.integrationWithOthers,
        notes: body.notes,
      },
    });

    await logAudit(user.id, 'UPDATE_MEMBER_EVALUATION', 'MemberEvaluativeRecord', evaluation.id, { memberId: id, ...body }, req);

    res.json({ success: true, message: 'تم حفظ تقييم المخدوم بنجاح', data: evaluation });
  } catch (err) {
    next(err);
  }
}

export async function bulkImportMembers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { stageId, members } = req.body; // array of member records

    if (ROLE_HIERARCHY_LEVEL[user.role] < ROLE_HIERARCHY_LEVEL[UserRole.ASSISTANT_SECRETARY]) {
      res.status(403).json({ success: false, message: 'استيراد البيانات مقتصر على مساعد أمين الخدمة فما فوق (FR-3.3)' });
      return;
    }

    if (!Array.isArray(members) || members.length === 0) {
      res.status(400).json({ success: false, message: 'قائمة المخدومين فارغة أو غير صالحة' });
      return;
    }

    let insertedCount = 0;
    const errors: { row: number; reason: string }[] = [];

    for (let i = 0; i < members.length; i++) {
      const item = members[i];
      if (!item.fullName || item.fullName.trim() === '') {
        errors.push({ row: i + 1, reason: 'الاسم الكامل مطلوب' });
        continue;
      }

      await prisma.servedMember.create({
        data: {
          fullName: item.fullName.trim(),
          phone: item.phone || null,
          address: item.address || null,
          fatherName: item.fatherName || null,
          motherName: item.motherName || null,
          schoolUniversity: item.schoolUniversity || null,
          educationalStage: item.educationalStage || null,
          fatherConfessor: item.fatherConfessor || null,
          stageId: stageId || user.stageId,
        },
      });
      insertedCount++;
    }

    await logAudit(user.id, 'BULK_IMPORT_MEMBERS', 'ServedMember', 'BATCH', { count: insertedCount, stageId }, req);

    res.json({
      success: true,
      message: `تم استيراد ${insertedCount} مخدوم بنجاح`,
      insertedCount,
      errorsCount: errors.length,
      errors,
    });
  } catch (err) {
    next(err);
  }
}
