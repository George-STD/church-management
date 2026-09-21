import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AuthUser } from '../core/permissions.js';
import { UserRole } from '@church/shared';

// Extend Express Request interface
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const tokenFromCookie = req.cookies?.token;

  let token: string | undefined;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  } else if (tokenFromCookie) {
    token = tokenFromCookie;
  }

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'لم يتم العثور على رمز التحقق (Unauthenticated)',
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET) as AuthUser;
    if (decoded.status === 'SUSPENDED') {
      res.status(403).json({
        success: false,
        message: 'تم تجميد هذا الحساب، يرجى التواصل مع امين الخدمة أو الأمين العام.',
      });
      return;
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({
      success: false,
      message: 'رمز التحقق غير صالح أو منتهي الصلاحية (Invalid or expired token)',
    });
  }
}
