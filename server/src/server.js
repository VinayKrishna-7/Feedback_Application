import app from './app.js';
import { ensureDatabaseRunning } from '../scripts/start-db.js';

const PORT = process.env.PORT || 5000;

async function bootstrap() {
  try {
    // Ensure PostgreSQL is available (external or embedded)
    await ensureDatabaseRunning();

    // In production, ensure PostgreSQL schema and tables are in sync
    if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
      try {
        const { execSync } = await import('child_process');
        console.log('[Server] Synchronizing Prisma schema with database...');
        execSync('npx prisma db push --skip-generate --accept-data-loss', {
          stdio: 'inherit'
        });
      } catch (syncErr) {
        console.warn('[Server] Notice: Database schema sync check:', syncErr.message);
      }
    }

    app.listen(PORT, () => {
      console.log(`[Server] OpenFeedback API server running on port ${PORT}`);
      console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('[Server] Fatal error during startup:', error);
    process.exit(1);
  }
}

bootstrap();
