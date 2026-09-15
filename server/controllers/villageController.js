import { pool } from '../config/db.js';
import { VALID_FORMS, cleanVillageCode, validateVillageCode } from './formsController.js';

function formatRow(row) {
  let data = row.data_json;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch { data = {}; }
  } else if (!data || typeof data !== 'object') {
    data = {};
  }

  let dateStr = '';
  if (row.survey_date) {
    if (typeof row.survey_date === 'string') {
      dateStr = row.survey_date.slice(0, 10);
    } else if (row.survey_date instanceof Date) {
      dateStr = row.survey_date.toISOString().slice(0, 10);
    }
  } else if (data.date) {
    dateStr = String(data.date).slice(0, 10);
  }

  return {
    id: row.id,
    villageCode: row.village_code,
    village: row.village_name || data.village || '',
    wadi: row.wadi || data.wadi || '',
    date: dateStr,
    formNo: row.form_no || data.formNo || '',
    taluka: data.taluka || 'Vaibhavwadi',
    district: data.district || 'Sindhudurg',
    respondent: row.respondent || data.respondent || '',
    interviewer: row.interviewer || data.interviewer || '',
    age: data.age || '',
    gender: data.gender || '',
    language: data.language || [],
    data,
    updated: Number(row.client_updated || data.updated || Date.now()),
  };
}

export async function getVillages(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT village_code, village_name, taluka, district, state 
       FROM villages 
       ORDER BY CAST(SUBSTRING(village_code, 3) AS UNSIGNED), village_code`
    );

    return res.status(200).json({
      ok: true,
      count: rows.length,
      villages: rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function getVillageBundle(req, res, next) {
  try {
    const code = cleanVillageCode(req.params.villageCode);
    if (!validateVillageCode(code)) {
      return res.status(400).json({ error: `Invalid village code: ${req.params.villageCode}` });
    }

    const [rows] = await pool.query(
      `SELECT id, form_key, village_code, village_name, wadi, interviewer, respondent, survey_date, form_no, data_json, client_updated 
       FROM survey_records 
       WHERE village_code = ? 
       ORDER BY created_at ASC`,
      [code]
    );

    const forms = {};
    for (const key of VALID_FORMS) {
      forms[key] = [];
    }

    for (const row of rows) {
      if (VALID_FORMS.has(row.form_key)) {
        forms[row.form_key].push(formatRow(row));
      }
    }

    const counts = {};
    for (const key of VALID_FORMS) {
      counts[key] = forms[key].length;
    }

    return res.status(200).json({
      villageCode: code,
      counts,
      forms,
    });
  } catch (err) {
    next(err);
  }
}

export async function getVillageStatus(req, res, next) {
  try {
    const code = cleanVillageCode(req.params.villageCode);
    if (!validateVillageCode(code)) {
      return res.status(400).json({ error: `Invalid village code: ${req.params.villageCode}` });
    }

    const [rows] = await pool.query(
      `SELECT form_key, COUNT(*) as cnt 
       FROM survey_records 
       WHERE village_code = ? 
       GROUP BY form_key`,
      [code]
    );

    const counts = {};
    for (const key of VALID_FORMS) {
      counts[key] = 0;
    }

    for (const r of rows) {
      if (VALID_FORMS.has(r.form_key)) {
        counts[r.form_key] = Number(r.cnt || 0);
      }
    }

    return res.status(200).json({
      villageCode: code,
      form0Ready: counts.form0 > 0,
      counts,
    });
  } catch (err) {
    next(err);
  }
}
