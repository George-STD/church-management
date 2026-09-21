import { app } from './app.js';
import { config } from './config/index.js';

app.listen(config.PORT, '0.0.0.0', () => {
  console.log(`
  =============================================================
  ⛪ Church Service Management System Backend (منظومة الخدمة الكنسية)
  =============================================================
  🚀 Server running on: http://0.0.0.0:${config.PORT}
  🌍 Environment:       ${config.NODE_ENV}
  🔒 Security:          Cumulative RBAC + Dynamic ABAC Scope Guard
  🛡️ Database:          Supabase (PostgreSQL) via Prisma ORM
  =============================================================
  `);
});
