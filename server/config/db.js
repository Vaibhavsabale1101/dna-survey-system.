import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

// Load .env from project root for local development.
// On Render, environment variables are supplied by Render itself.
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

const useSSL = String(process.env.DB_SSL || '').toLowerCase() === 'true';

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'dna_survey_db',

  charset: 'utf8mb4',

  waitForConnections: true,
  connectionLimit: 15,
  queueLimit: 0,

  enableKeepAlive: true,
  keepAliveInitialDelay: 0,

  ...(useSSL
    ? {
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {}),
};

export const pool = mysql.createPool(dbConfig);

// Quick test to verify connectivity
export async function testConnection() {
  try {
    const conn = await pool.getConnection();
    conn.release();

    return {
      ok: true,
      database: dbConfig.database,
      host: dbConfig.host,
      ssl: useSSL,
    };
  } catch (err) {
    return {
      ok: false,
      error: err.message || String(err),
    };
  }
}