import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/index.js';
import { errorHandler } from './middleware/error.js';

import authRoutes from './modules/auth/auth.routes.js';
import hierarchyRoutes from './modules/hierarchy/hierarchy.routes.js';
import servantsRoutes from './modules/servants/servants.routes.js';
import membersRoutes from './modules/members/members.routes.js';
import followUpRoutes from './modules/follow-up/follow-up.routes.js';
import prepRoutes from './modules/prep/prep.routes.js';
import spiritualRoutes from './modules/spiritual/spiritual.routes.js';
import yearPlanRoutes from './modules/year-plan/year-plan.routes.js';
import announcementsRoutes from './modules/announcements/announcements.routes.js';
import analyticsRoutes from './modules/analytics/analytics.routes.js';
import reportsRoutes from './modules/reports/reports.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Security & Core Middlewares
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);

app.use(
  cors({
    origin: config.NODE_ENV === 'production' && config.CORS_ORIGIN !== '*'
      ? [config.CORS_ORIGIN, 'http://localhost:5173', 'http://localhost:5000']
      : true,
    credentials: true,
  })
);

app.use(morgan(config.NODE_ENV === 'development' ? 'dev' : 'combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.COOKIE_SECRET));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'Church Service Management System API',
    time: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hierarchy', hierarchyRoutes);
app.use('/api/servants', servantsRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/follow-up', followUpRoutes);
app.use('/api/prep', prepRoutes);
app.use('/api/spiritual', spiritualRoutes);
app.use('/api/year-plan', yearPlanRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportsRoutes);

// Serve Frontend Static Files & SPA Fallback (Production)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Centralized Error Handling
app.use(errorHandler);

