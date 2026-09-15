import { pool } from '../config/db.js';
import { FORM_VERSION, definitionsForRecord, pathGet, answerToText } from './formDefinitions.js';

async function hasColumn(connection, table, column) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) AS n FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column]
  );
  return Number(rows?.[0]?.n || 0) > 0;
}

async function addColumnIfMissing(connection, table, column, ddl) {
  if (!(await hasColumn(connection, table, column))) {
    await connection.query(`ALTER TABLE ${table} ADD COLUMN ${column} ${ddl}`);
  }
}

export async function ensureAnswerStorage(connection = pool) {
  await connection.query(`
    CREATE TABLE IF NOT EXISTS survey_answers (
      id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
      record_id VARCHAR(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
      form_key ENUM('form0','formA','formB','formC','formD','formE','formF') NOT NULL,
      village_code VARCHAR(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
      form_version VARCHAR(64) NOT NULL DEFAULT '${FORM_VERSION}',
      display_order INT NOT NULL DEFAULT 0,
      section_name VARCHAR(128) NULL,
      question_no VARCHAR(64) NULL,
      question_text TEXT NULL,
      field_path VARCHAR(255) NOT NULL,
      answer_value LONGTEXT NULL,
      answer_json JSON NULL,
      answer_status ENUM('ANSWERED','NOT_ANSWERED') NOT NULL DEFAULT 'NOT_ANSWERED',
      is_mapped TINYINT(1) NOT NULL DEFAULT 1,
      is_blank TINYINT(1) NOT NULL DEFAULT 0,
      created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (id),
      UNIQUE KEY uq_survey_answer (record_id, field_path),
      KEY idx_answer_form_village (form_key, village_code),
      KEY idx_answer_field_path (field_path),
      KEY idx_answer_question_no (question_no),
      CONSTRAINT fk_answer_record FOREIGN KEY (record_id) REFERENCES survey_records(id) ON DELETE CASCADE,
      CONSTRAINT fk_answer_village FOREIGN KEY (village_code) REFERENCES villages(village_code) ON DELETE RESTRICT ON UPDATE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci
  `);

  // Upgrade older v2 tables in place without losing data.
  await addColumnIfMissing(connection, 'survey_answers', 'form_version', `VARCHAR(64) NOT NULL DEFAULT '${FORM_VERSION}'`);
  await addColumnIfMissing(connection, 'survey_answers', 'display_order', 'INT NOT NULL DEFAULT 0');
  await addColumnIfMissing(connection, 'survey_answers', 'section_name', 'VARCHAR(128) NULL');
  await addColumnIfMissing(connection, 'survey_answers', 'question_no', 'VARCHAR(64) NULL');
  await addColumnIfMissing(connection, 'survey_answers', 'question_text', 'TEXT NULL');
  await addColumnIfMissing(connection, 'survey_answers', 'answer_status', "ENUM('ANSWERED','NOT_ANSWERED') NOT NULL DEFAULT 'NOT_ANSWERED'");
  await addColumnIfMissing(connection, 'survey_answers', 'is_mapped', 'TINYINT(1) NOT NULL DEFAULT 1');
}

export async function syncSurveyAnswers(connection, { recordId, formKey, villageCode, dataJson }) {
  await ensureAnswerStorage(connection);
  const data = dataJson && typeof dataJson === 'object' ? dataJson : {};
  const defs = definitionsForRecord(formKey, data);

  await connection.query('DELETE FROM survey_answers WHERE record_id = ?', [recordId]);
  if (!defs.length) return { stored: 0, unmapped: 0 };

  const sql = `INSERT INTO survey_answers
    (record_id, form_key, village_code, form_version, display_order, section_name, question_no, question_text,
     field_path, answer_value, answer_json, answer_status, is_mapped, is_blank)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

  let unmapped = 0;
  for (const d of defs) {
    const raw = pathGet(data, d.path);
    const answer = answerToText(raw);
    const blank = answer === '';
    let jsonValue = null;
    try { jsonValue = JSON.stringify(raw === undefined ? null : raw); } catch { jsonValue = null; }
    if (!d.mapped) unmapped += 1;
    await connection.query(sql, [
      recordId,
      formKey,
      villageCode,
      FORM_VERSION,
      d.order || 0,
      d.section || '',
      d.no || '',
      d.question || '',
      d.path,
      answer,
      jsonValue,
      blank ? 'NOT_ANSWERED' : 'ANSWERED',
      d.mapped ? 1 : 0,
      blank ? 1 : 0,
    ]);
  }
  return { stored: defs.length, unmapped };
}

export async function backfillSurveyAnswers({ onlyMissing = true } = {}) {
  await ensureAnswerStorage(pool);
  const [rows] = await pool.query(`
    SELECT r.id, r.form_key, r.village_code, r.village_name, r.wadi, r.interviewer, r.respondent, r.survey_date, r.form_no, r.data_json,
           COALESCE(a.answer_count, 0) AS answer_count,
           COALESCE(a.current_version_count, 0) AS current_version_count
    FROM survey_records r
    LEFT JOIN (
      SELECT record_id, COUNT(*) AS answer_count,
             SUM(CASE WHEN form_version = ? THEN 1 ELSE 0 END) AS current_version_count
      FROM survey_answers
      GROUP BY record_id
    ) a ON a.record_id = r.id
  `, [FORM_VERSION]);

  let processed = 0;
  let unmapped = 0;
  for (const row of rows) {
    if (onlyMissing && Number(row.answer_count || 0) > 0 && Number(row.current_version_count || 0) === Number(row.answer_count || 0)) continue;
    let data = row.data_json;
    if (typeof data === 'string') {
      try { data = JSON.parse(data); } catch { data = {}; }
    }
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      const storageData = {
        ...(data || {}),
        villageCode: row.village_code,
        village: row.village_name || data?.village || '',
        wadi: row.wadi || data?.wadi || '',
        interviewer: row.interviewer || data?.interviewer || '',
        respondent: row.respondent || data?.respondent || '',
        formNo: row.form_no || data?.formNo || '',
        date: row.survey_date ? String(row.survey_date).slice(0, 10) : (data?.date || ''),
      };
      if (row.form_key === 'formB') delete storageData.gender;
      const result = await syncSurveyAnswers(conn, { recordId: row.id, formKey: row.form_key, villageCode: row.village_code, dataJson: storageData });
      await conn.commit();
      processed += 1;
      unmapped += result.unmapped || 0;
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  }
  return { processed, unmapped };
}
