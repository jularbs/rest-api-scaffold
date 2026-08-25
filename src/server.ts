import { app } from './app.js';
import { config } from './config/index.js';
import { closeDatabase } from './database/db.js';

const server = app.listen(config.app.port, () => {
  console.log(
    `[STARTUP] ${config.app.name} listening on port ${config.app.port} in ${config.app.env} mode`,
  );
});

async function shutdown(signal: string) {
  console.log(`[SHUTDOWN] Received ${signal}, closing server...`);

  server.close(async (error) => {
    if (error) {
      console.error('[SHUTDOWN] Error while closing HTTP server:', error);
      process.exitCode = 1;
    }

    try {
      await closeDatabase();
      console.log('[SHUTDOWN] Database pool closed.');
    } catch (dbError) {
      console.error('[SHUTDOWN] Error while closing database pool:', dbError);
      process.exitCode = 1;
    }

    process.exit();
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
