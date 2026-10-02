import fs from 'fs';
import net from 'net';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const DEFAULT_PORT = 5432;
const DEFAULT_USER = 'postgres';
const DEFAULT_PASSWORD = 'password';
const DEFAULT_DB = 'openfeedback';

function parseDatabaseUrl(url) {
  if (!url) return { port: DEFAULT_PORT, user: DEFAULT_USER, password: DEFAULT_PASSWORD, database: DEFAULT_DB };
  try {
    const parsed = new URL(url);
    return {
      port: parsed.port ? parseInt(parsed.port, 10) : DEFAULT_PORT,
      user: parsed.username || DEFAULT_USER,
      password: parsed.password || DEFAULT_PASSWORD,
      database: (parsed.pathname || '').replace('/', '') || DEFAULT_DB,
      host: parsed.hostname || 'localhost'
    };
  } catch {
    return { port: DEFAULT_PORT, user: DEFAULT_USER, password: DEFAULT_PASSWORD, database: DEFAULT_DB, host: 'localhost' };
  }
}

export function isPortOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1500);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

let embeddedInstance = null;

export async function ensureDatabaseRunning() {
  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const dbConfig = parseDatabaseUrl(process.env.DATABASE_URL);
  const running = await isPortOpen(dbConfig.port, dbConfig.host || '127.0.0.1');

  if (running) {
    console.log(`[Database] PostgreSQL is already running on ${dbConfig.host}:${dbConfig.port}.`);
    return null;
  }

  console.log(`[Database] No PostgreSQL detected on port ${dbConfig.port}. Starting embedded PostgreSQL...`);
  const dataDir = path.resolve(__dirname, '../.postgres-data');

  // Check if data directory is already initialized
  const isInitialized = fs.existsSync(path.join(dataDir, 'PG_VERSION'));

  // Clean up stale lock/pid file if postgres crashed or was abruptly killed
  const pidFile = path.join(dataDir, 'postmaster.pid');
  if (fs.existsSync(pidFile)) {
    console.log('[Database] Cleaning up stale postmaster.pid from previous session...');
    try {
      fs.unlinkSync(pidFile);
    } catch (err) {
      console.warn('[Database] Could not remove stale postmaster.pid:', err.message);
    }
  }

  let EmbeddedPostgres;
  try {
    const mod = await import('embedded-postgres');
    EmbeddedPostgres = mod.default || mod;
  } catch (err) {
    console.warn('[Database] embedded-postgres is not available. Relying on external database.');
    return null;
  }

  embeddedInstance = new EmbeddedPostgres({
    databaseDir: dataDir,
    port: dbConfig.port,
    user: dbConfig.user,
    password: dbConfig.password,
    initialDatabase: dbConfig.database,
    persistent: true
  });

  if (!isInitialized) {
    console.log('[Database] Initializing new database cluster...');
    await embeddedInstance.initialise();
  } else {
    console.log('[Database] Database cluster already initialized. Reusing existing data directory.');
  }

  await embeddedInstance.start();
  console.log(`[Database] Embedded PostgreSQL started successfully on port ${dbConfig.port}!`);

  const cleanup = async () => {
    if (embeddedInstance) {
      console.log('\n[Database] Stopping embedded PostgreSQL...');
      try {
        await embeddedInstance.stop();
      } catch (e) {
        // ignore
      }
      embeddedInstance = null;
    }
  };

  process.on('SIGINT', async () => {
    await cleanup();
    process.exit(0);
  });
  process.on('SIGTERM', async () => {
    await cleanup();
    process.exit(0);
  });

  return embeddedInstance;
}

// If executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  ensureDatabaseRunning()
    .then((inst) => {
      if (inst) {
        console.log('[Database] Press Ctrl+C to stop database.');
      } else {
        process.exit(0);
      }
    })
    .catch((err) => {
      console.error('[Database] Failed to start database:', err);
      process.exit(1);
    });
}
