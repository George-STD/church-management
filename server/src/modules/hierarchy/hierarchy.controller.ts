import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/db.js';

export async function getSectorsWithStages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const sectors = await prisma.sector.findMany({
      include: {
        stages: {
          orderBy: { orderIndex: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    res.json({ success: true, data: sectors });
  } catch (err) {
    next(err);
  }
}

export async function getStages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const stages = await prisma.stage.findMany({
      include: {
        sector: true,
      },
      orderBy: { orderIndex: 'asc' },
    });

    res.json({ success: true, data: stages });
  } catch (err) {
    next(err);
  }
}
