import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '..', '.env') });

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

  // Aiven requires SSL
  ssl: process.env.DB_SSL === 'true'
    ? { rejectUnauthorized: false }
    : undefined,
};

export const pool = mysql.createPool(dbConfig);

export async function testConnection() {
  let conn;

  try {
    conn = await pool.getConnection();

    // Force UTF-8 for the Aiven MySQL session
    await conn.query("SET NAMES utf8mb4");

    const [charsetRows] = await conn.query(`
      SELECT
        @@character_set_client AS client,
        @@character_set_connection AS connection_charset,
        @@character_set_results AS results_charset
    `);

    console.log('MySQL charset:', charsetRows[0]);

    return {
      ok: true,
      database: dbConfig.database,
      host: dbConfig.host,
      charset: charsetRows[0],
    };

  } catch (err) {
    return {
      ok: false,
      error: err.message || String(err),
    };

  } finally {
    if (conn) conn.release();
  }
}