import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { prisma } from '../../config/db.js';

const spiritualEntrySchema = z.object({
  date: z.string().min(1, 'التاريخ مطلوب'),
  hadCommunion: z.boolean().default(false),
  hadConfession: z.boolean().default(false),
  regularPrayer: z.boolean().default(false),
  scriptureReadingMinutes: z.number().default(0),
  privateNotes: z.string().optional().nullable(),
});

export async function getMySpiritualEntries(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;

    // Strictly isolated: always filter by user.id only!
    const entries = await prisma.spiritualLifeEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
      take: 60,
    });

    res.json({ success: true, data: entries });
  } catch (err) {
    next(err);
  }
}

export async function logSpiritualEntry(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = req.user!;
    const body = spiritualEntrySchema.parse(req.body);
    const dateObj = new Date(body.date);

    // Upsert entry for this user and date
    const entry = await prisma.spiritualLifeEntry.upsert({
      where: {
        userId_date: {
          userId: user.id,
          date: dateObj,
        },
      },
      update: {
        hadCommunion: body.hadCommunion,
        hadConfession: body.hadConfession,
        regularPrayer: body.regularPrayer,
        scriptureReadingMinutes: body.scriptureReadingMinutes,
        privateNotes: body.privateNotes,
      },
      create: {
        userId: user.id,
        date: dateObj,
        hadCommunion: body.hadCommunion,
        hadConfession: body.hadConfession,
        regularPrayer: body.regularPrayer,
        scriptureReadingMinutes: body.scriptureReadingMinutes,
        privateNotes: body.privateNotes,
      },
    });

    res.json({
      success: true,
      message: 'تم حفظ سجل الحياة الروحية بنجاح في خزنتك الخاصة المشفرة',
      data: entry,
    });
  } catch (err) {
    next(err);
  }
}
