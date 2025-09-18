import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const poolConnection = mysql.createPool({
  uri: process.env['DATABASE_URL']!,
});

const db = drizzle(poolConnection, { casing: 'snake_case' });
export { db, poolConnection };
