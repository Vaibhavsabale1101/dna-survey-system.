import fs from 'fs';
import { pool } from '../server/config/db.js';

async function exportSql() {
  try {
    let sql = '-- ========================================================\n';
    sql += '-- DNA Survey Full MySQL Database Dump\n';
    sql += '-- Generated on: ' + new Date().toISOString() + '\n';
    sql += '-- ========================================================\n\n';
    sql += 'CREATE DATABASE IF NOT EXISTS `dna_survey_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\n';
    sql += 'USE `dna_survey_db`;\n\n';
    sql += 'SET FOREIGN_KEY_CHECKS = 0;\n\n';

    const [tables] = await pool.query('SHOW TABLES');
    for (const t of tables) {
      const tableName = Object.values(t)[0];
      const [[createRow]] = await pool.query('SHOW CREATE TABLE `' + tableName + '`');
      sql += '-- --------------------------------------------------------\n';
      sql += '-- Table structure for `' + tableName + '`\n';
      sql += '-- --------------------------------------------------------\n';
      sql += 'DROP TABLE IF EXISTS `' + tableName + '`;\n';
      sql += createRow['Create Table'] + ';\n\n';

      const [rows] = await pool.query('SELECT * FROM `' + tableName + '`');
      if (rows.length > 0) {
        sql += '-- Dumping data for table `' + tableName + '`\n';
        const cols = Object.keys(rows[0]).map((c) => '`' + c + '`').join(', ');
        for (const row of rows) {
          const vals = Object.values(row)
            .map((val) => {
              if (val === null || val === undefined) return 'NULL';
              if (typeof val === 'number') return val;
              if (val instanceof Date) return pool.escape(val.toISOString().slice(0, 19).replace('T', ' '));
              if (typeof val === 'object') return pool.escape(JSON.stringify(val));
              return pool.escape(String(val));
            })
            .join(', ');
          sql += 'INSERT INTO `' + tableName + '` (' + cols + ') VALUES (' + vals + ');\n';
        }
        sql += '\n';
      }
    }
    sql += 'SET FOREIGN_KEY_CHECKS = 1;\n';

    fs.writeFileSync('./server/database/dna_survey_db_full_dump.sql', sql, 'utf8');
    fs.writeFileSync('./dna_survey_db_dump.sql', sql, 'utf8');
    console.log('Exported full SQL dump successfully to dna_survey_db_dump.sql and server/database/dna_survey_db_full_dump.sql (' + sql.length + ' bytes)');
  } catch (err) {
    console.error('Export failed:', err);
  } finally {
    await pool.end();
  }
}

exportSql();
