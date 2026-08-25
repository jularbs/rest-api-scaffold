import { app } from './app.js';
import { logger } from './common/utils/logger.js';
import { config } from './config/index.js';
import { closeDatabase } from './database/db.js';

const server = app.listen(config.app.port, () => {
  logger.info(
    `[STARTUP] ${config.app.name} listening on port ${config.app.port} in ${config.app.env} mode`,
  );
});

async function shutdown(signal: string) {
  logger.info(`[SHUTDOWN] Received ${signal}, closing server...`);

  server.close(async (error) => {
    if (error) {
      logger.error({ error: error }, '[SHUTDOWN] Error while closing HTTP server');
      process.exitCode = 1;
    }

    try {
      await closeDatabase();
      logger.info('[SHUTDOWN] Database pool closed.');
    } catch (dbError) {
      logger.error({ error: dbError }, '[SHUTDOWN] Error while closing database pool:');
      process.exitCode = 1;
    }

    process.exit();
  });
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
