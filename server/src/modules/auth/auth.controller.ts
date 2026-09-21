import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { prisma } from '../../config/db.js';
import { config } from '../../config/index.js';
import { UserRole } from '@church/shared';

const loginSchema = z.object({
  identifier: z.string().min(1, 'يرجى إدخال رقم الهاتف أو البريد الإلكتروني'),
  password: z.string().min(1, 'يرجى إدخال كلمة المرور'),
});

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { identifier, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { phone: identifier },
          { email: identifier },
        ],
      },
      include: {
        stage: true,
        sector: true,
      },
    });

    if (!user) {
      res.status(401).json({
        success: false,
        message: 'رقم الهاتف/البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
      return;
    }

    if (user.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        message: 'تم تجميد هذا الحساب، يرجى مراجعة أمين الخدمة أو الأمانة العامة',
      });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      res.status(401).json({
        success: false,
        message: 'رقم الهاتف/البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
      return;
    }

    const tokenPayload = {
      id: user.id,
      phone: user.phone,
      email: user.email,
      fullName: user.fullName,
      role: user.role as unknown as UserRole,
      stageId: user.stageId,
      sectorId: user.sectorId,
      status: user.status,
    };

    const token = jwt.sign(tokenPayload, config.JWT_SECRET, {
      expiresIn: config.JWT_EXPIRES_IN as any,
    });

    res.cookie('token', token, {
      httpOnly: true,
      secure: config.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        stageId: user.stageId,
        stageName: user.stage?.name,
        sectorId: user.sectorId,
        sectorName: user.sector?.name,
        status: user.status,
        maritalStatus: user.maritalStatus,
        fatherConfessor: user.fatherConfessor,
        address: user.address,
        educationCareerStage: user.educationCareerStage,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'غير مصرح' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: {
        stage: true,
        sector: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
      return;
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        phone: user.phone,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        stageId: user.stageId,
        stageName: user.stage?.name,
        sectorId: user.sectorId,
        sectorName: user.sector?.name,
        status: user.status,
        maritalStatus: user.maritalStatus,
        spouseName: user.spouseName,
        fatherConfessor: user.fatherConfessor,
        address: user.address,
        educationCareerStage: user.educationCareerStage,
        childrenJson: user.childrenJson,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
}

export function logout(req: Request, res: Response): void {
  res.clearCookie('token');
  res.json({ success: true, message: 'تم تسجيل الخروج بنجاح' });
}
