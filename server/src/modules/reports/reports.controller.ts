import { Request, Response, NextFunction } from 'express';
import ExcelJS from 'exceljs';
import { prisma } from '../../config/db.js';
import { UserRole, ROLE_HIERARCHY_LEVEL } from '@church/shared';
import { logAudit } from '../../middleware/audit.js';

export async function exportMembersExcel(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const { stageId } = req.query;

    if (ROLE_HIERARCHY_LEVEL[user.role] < ROLE_HIERARCHY_LEVEL[UserRole.STAGE_SECRETARY]) {
      res.status(403).json({ success: false, message: 'تصدير التقارير مقتصر على أمين الخدمة فما فوق (FR-14.1)' });
      return;
    }

    const members = await prisma.servedMember.findMany({
      where: stageId ? { stageId: stageId as string } : user.role === UserRole.GENERAL_SECRETARY ? {} : { stageId: user.stageId || '' },
      include: {
        stage: true,
        assignments: { include: { servant: true } },
        evaluations: { take: 1, orderBy: { createdAt: 'desc' } },
      },
      orderBy: { fullName: 'asc' },
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'منظومة إدارة الخدمة الكنسية';
    workbook.created = new Date();

    const sheet = workbook.addWorksheet('سجل المخدومين', {
      views: [{ rightToLeft: true }], // Native RTL Excel View!
    });

    sheet.columns = [
      { header: 'م', key: 'index', width: 6 },
      { header: 'اسم المخدوم', key: 'fullName', width: 25 },
      { header: 'المرحلة', key: 'stage', width: 18 },
      { header: 'رقم الهاتف', key: 'phone', width: 16 },
      { header: 'العنوان', key: 'address', width: 30 },
      { header: 'أب الاعتراف', key: 'confessor', width: 20 },
      { header: 'الخدام المسؤولون', key: 'servants', width: 25 },
      { header: 'السلوك والاندماج', key: 'behavior', width: 25 },
    ];

    // Style Header Row
    sheet.getRow(1).font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
    sheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF1E3A8A' }, // Royal Indigo
    };
    sheet.getRow(1).alignment = { horizontal: 'center', vertical: 'middle' };

    members.forEach((m, idx) => {
      const evalItem = m.evaluations[0];
      sheet.addRow({
        index: idx + 1,
        fullName: m.fullName,
        stage: m.stage.name,
        phone: m.phone || '—',
        address: m.address || '—',
        confessor: m.fatherConfessor || '—',
        servants: m.assignments.map((a) => a.servant.fullName).join('، ') || '—',
        behavior: evalItem ? `${evalItem.behaviorInService || ''} / ${evalItem.integrationWithOthers || ''}` : '—',
      });
    });

    await logAudit(user.id, 'EXPORT_MEMBERS_EXCEL', 'ServedMember', 'ALL', { count: members.length }, req);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="members_roster_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    next(err);
  }
}
