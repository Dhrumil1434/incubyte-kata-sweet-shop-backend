import dotenv from 'dotenv';
dotenv.config();

import app from './app';
import { validateEnv } from '@utils-core';
import { db, poolConnection } from './db/mysql.db';

validateEnv([
  'PORT',
  'DATABASE_URL',
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'NODE_ENV',
]);

const PORT = process.env['PORT'] || 3000;

async function bootstrap() {
  try {
    const conn = await poolConnection.getConnection();
    await conn.ping();
    console.log('✅ MySQL connection established.');
    conn.release();

    app.locals['db'] = db;
    app.locals['pool'] = poolConnection;

    app.listen(PORT, () => {
      console.log(`⚙️ Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MySQL:', error);
    process.exit(1);
  }
}

bootstrap();
