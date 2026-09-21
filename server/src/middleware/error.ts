import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('💥 Server Error:', err);

  // Handle Zod Schema Validation Errors
  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      message: 'بيانات غير صالحة (Validation error)',
      errors: err.errors.map((e) => ({
        path: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Handle Prisma Known Request Errors
  if (err.code === 'P2002') {
    res.status(409).json({
      success: false,
      message: 'عنصر مكرر، الحقل مسجل مسبقاً (Unique constraint violation)',
      target: err.meta?.target,
    });
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = err.message || 'حدث خطأ غير متوقع في الخادم (Internal server error)';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
  });
}
