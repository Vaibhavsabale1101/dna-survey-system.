import { pool } from '../config/db.js';
import { syncSurveyAnswers } from '../lib/answerStore.js';

export const VALID_FORMS = new Set(['form0', 'formA', 'formB', 'formC', 'formD', 'formE', 'formF']);

export function cleanVillageCode(code) {
  return String(code || '').trim().toUpperCase();
}

export function validateVillageCode(code) {
  const c = cleanVillageCode(code);
  return /^VG(?:[1-9]|1[0-9]|2[01])$/.test(c);
}

function formatRowToRecord(row) {
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
    formKey: row.form_key,
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

export function normalizeFormKey(key) {
  if (!key) return null;
  const k = String(key).trim();
  if (VALID_FORMS.has(k)) return k;
  const lowered = k.toLowerCase();
  if (lowered.startsWith('form')) {
    const suffix = lowered.slice(4);
    const candidate = suffix === '0' ? 'form0' : `form${suffix.toUpperCase()}`;
    if (VALID_FORMS.has(candidate)) return candidate;
  }
  const candidate = lowered === '0' ? 'form0' : `form${k.toUpperCase()}`;
  if (VALID_FORMS.has(candidate)) return candidate;
  return null;
}


async function prepareForPersistence(connection, formKey, villageCode, rawData) {
  const data = rawData && typeof rawData === 'object' ? structuredClone(rawData) : {};
  if (formKey === 'formB') delete data.gender;

  if (formKey === 'form0') {
    const allowed = new Set(['1-High', '2-Medium', '3-Low']);
    for (let i = 0; i < 11; i++) {
      if (!allowed.has(String(data[`occupationRank_${i}`] || ''))) {
        const err = new Error(`Form 0 Section C priority ${i + 1} is compulsory and must be 1-High, 2-Medium or 3-Low.`);
        err.statusCode = 400; throw err;
      }
    }
    const [dupes] = await connection.query("SELECT id FROM survey_records WHERE form_key = 'form0' AND village_code = ? AND id <> ? LIMIT 1", [villageCode, String(data.id || '')]);
    // Exact record-id check is repeated by caller below; this guard is mainly for API/import bypasses.
    if (dupes.length) {
      const err = new Error(`Form 0 already exists for ${villageCode}. Edit the existing Form 0 instead of creating another.`);
      err.statusCode = 409; throw err;
    }
  } else {
    const [base] = await connection.query("SELECT id FROM survey_records WHERE form_key = 'form0' AND village_code = ? LIMIT 1", [villageCode]);
    if (!base.length) {
      const err = new Error(`Form 0 is compulsory. Save Form 0 for ${villageCode} before saving ${formKey}.`);
      err.statusCode = 409; throw err;
    }
  }

  if (['formA','formB','formC','formD'].includes(formKey) && Array.isArray(data.taiUse)) {
    const codes = [...new Set(data.taiUse.map(r => String(r?.fieldId || '').trim().toUpperCase()).filter(c => /^P(?:0[1-9]|1[0-9]|2[0-8])$/.test(c)))];
    const problemMap = new Map();
    if (codes.length) {
      const placeholders = codes.map(() => '?').join(',');
      const [problems] = await connection.query(`SELECT code, problem_en FROM problem_catalog WHERE code IN (${placeholders})`, codes);
      problems.forEach(p => problemMap.set(p.code, p.problem_en));
    }
    data.taiUse = data.taiUse.map(row => {
      const pCode = String(row?.fieldId || '').trim().toUpperCase();
      const checked = ['long','often','many','realLoss'].filter(k => Boolean(row?.[k])).length;
      return { ...row, fieldId: pCode, problem: problemMap.get(pCode) || '', keep: pCode ? (checked >= 2 ? 'Keep' : 'Drop') : '' };
    });
  }
  return data;
}

export async function persistSurveyRecord(connection, {
  recordId,
  formKey,
  villageCode,
  villageName,
  wadi,
  interviewer,
  respondent,
  formNo,
  surveyDate,
  dataJson,
  clientUpdated,
}) {
  // 1. Upsert survey_records
  await connection.query(
    `INSERT INTO survey_records 
      (id, form_key, village_code, village_name, wadi, interviewer, respondent, survey_date, form_no, data_json, client_updated)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      form_key = VALUES(form_key),
      village_code = VALUES(village_code),
      village_name = VALUES(village_name),
      wadi = VALUES(wadi),
      interviewer = VALUES(interviewer),
      respondent = VALUES(respondent),
      survey_date = VALUES(survey_date),
      form_no = VALUES(form_no),
      data_json = VALUES(data_json),
      client_updated = VALUES(client_updated),
      updated_at = CURRENT_TIMESTAMP`,
    [
      recordId,
      formKey,
      villageCode,
      villageName,
      wadi,
      interviewer,
      respondent,
      surveyDate,
      formNo,
      JSON.stringify(dataJson),
      clientUpdated,
    ]
  );

  // 2. Mirror every submitted field into normalized survey_answers.
  // This guarantees that entered answers are queryable independently of JSON
  // and prevents an export mapping mistake from silently losing survey data.
  const storageData = {
    ...(dataJson || {}),
    villageCode,
    village: villageName || dataJson?.village || '',
    wadi: wadi || dataJson?.wadi || '',
    interviewer: interviewer || dataJson?.interviewer || '',
    respondent: respondent || dataJson?.respondent || '',
    formNo: formNo || dataJson?.formNo || '',
    date: surveyDate || dataJson?.date || '',
  };
  if (formKey === 'formB') delete storageData.gender;
  await syncSurveyAnswers(connection, {
    recordId,
    formKey,
    villageCode,
    dataJson: storageData,
  });

  // 3. If Form A-D, sync tai_screenings table
  if (['formA', 'formB', 'formC', 'formD'].includes(formKey) && Array.isArray(dataJson.taiUse)) {
    await connection.query('DELETE FROM tai_screenings WHERE record_id = ?', [recordId]);

    for (const row of dataJson.taiUse) {
      const pCode = String(row.fieldId || '').trim().toUpperCase();
      if (pCode && /^P(?:0[1-9]|1[0-9]|2[0-8])$/.test(pCode)) {
        const keep = row.keep === 'Keep' ? 'Keep' : 'Drop';
        await connection.query(
          `INSERT INTO tai_screenings 
            (record_id, village_code, form_key, p_code, long_term, often, many, real_loss, keep_drop, tech_type)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            recordId,
            villageCode,
            formKey,
            pCode,
            Boolean(row.long),
            Boolean(row.often),
            Boolean(row.many),
            Boolean(row.realLoss),
            keep,
            String(row.tech || 'Tech').slice(0, 50),
          ]
        );
      }
    }
  }

  // 4. If Form E, sync form_e_stops table
  if (formKey === 'formE' && Array.isArray(dataJson.stops)) {
    await connection.query('DELETE FROM form_e_stops WHERE record_id = ?', [recordId]);

    for (const stop of dataJson.stops) {
      if (!stop || !stop.id) continue;
      const pCode = String(stop.fieldId || '').trim().toUpperCase();
      const validPCode = /^P(?:0[1-9]|1[0-9]|2[0-8])$/.test(pCode) ? pCode : null;

      await connection.query(
        `INSERT INTO form_e_stops 
          (record_id, village_code, stop_id, place_name, look_for, actual_seen, gps_coordinates, photo_ref, p_code)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          recordId,
          villageCode,
          String(stop.id).slice(0, 10),
          String(stop.place || '').slice(0, 255),
          stop.look || null,
          stop.see || null,
          stop.gps || null,
          stop.photo || null,
          validPCode,
        ]
      );
    }
  }
}

export async function listRecords(req, res, next) {
  try {
    const { formKey } = req.params;
    if (!VALID_FORMS.has(formKey)) {
      return res.status(400).json({ error: `Invalid form key: ${formKey}` });
    }

    const [rows] = await pool.query(
      `SELECT id, form_key, village_code, village_name, wadi, interviewer, respondent, survey_date, form_no, data_json, client_updated 
       FROM survey_records 
       WHERE form_key = ? 
       ORDER BY created_at DESC`,
      [formKey]
    );

    const records = rows.map(formatRowToRecord);
    return res.status(200).json({ records });
  } catch (err) {
    next(err);
  }
}

export async function saveRecord(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { formKey, id } = req.params;
    const rec = req.body;

    if (!VALID_FORMS.has(formKey)) {
      return res.status(400).json({ error: `Invalid form key: ${formKey}` });
    }
    if (!rec || typeof rec !== 'object') {
      return res.status(400).json({ error: 'Record payload must be a JSON object' });
    }

    const recordId = String(id || rec.id || '').trim();
    if (!recordId) {
      return res.status(400).json({ error: 'Record ID is required' });
    }
    rec.id = recordId;

    const villageCode = cleanVillageCode(rec.villageCode || rec.data?.villageCode);
    if (!validateVillageCode(villageCode)) {
      return res.status(400).json({ error: `Invalid village code: ${rec.villageCode}. Must be VG1 to VG21.` });
    }

    const [villageRows] = await connection.query('SELECT village_name FROM villages WHERE village_code = ? LIMIT 1', [villageCode]);
    if (!villageRows.length) return res.status(400).json({ error: `Unknown village code: ${villageCode}` });
    const villageName = villageRows[0].village_name;
    const wadi = rec.wadi || rec.data?.wadi || null;
    const interviewer = rec.interviewer || rec.data?.interviewer || null;
    const respondent = rec.respondent || rec.data?.respondent || null;
    const formNo = rec.formNo || rec.data?.formNo || null;

    let surveyDate = null;
    const dateInput = rec.date || rec.data?.date;
    if (dateInput && !isNaN(Date.parse(dateInput))) {
      surveyDate = new Date(dateInput).toISOString().slice(0, 10);
    }

    let dataJson = rec.data && typeof rec.data === 'object' ? rec.data : rec;
    dataJson = { ...dataJson, id: recordId };
    dataJson = await prepareForPersistence(connection, formKey, villageCode, dataJson);
    delete dataJson.id;
    const clientUpdated = rec.updated ? Number(rec.updated) : Date.now();

    await connection.beginTransaction();

    await persistSurveyRecord(connection, {
      recordId,
      formKey,
      villageCode,
      villageName,
      wadi,
      interviewer,
      respondent,
      formNo,
      surveyDate,
      dataJson,
      clientUpdated,
    });

    await connection.commit();

    return res.status(200).json({
      ok: true,
      id: recordId,
      villageCode,
      formKey,
      updated: clientUpdated,
      data: dataJson,
    });
  } catch (err) {
    await connection.rollback();
    if (err?.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  } finally {
    connection.release();
  }
}

export async function deleteRecord(req, res, next) {
  try {
    const { formKey, id } = req.params;
    if (!VALID_FORMS.has(formKey)) {
      return res.status(400).json({ error: `Invalid form key: ${formKey}` });
    }

    const [result] = await pool.query(
      'DELETE FROM survey_records WHERE form_key = ? AND id = ?',
      [formKey, id]
    );

    return res.status(200).json({ ok: true, deleted: result.affectedRows > 0 });
  } catch (err) {
    next(err);
  }
}

export async function clearRecords(req, res, next) {
  try {
    const { formKey } = req.params;
    if (!VALID_FORMS.has(formKey)) {
      return res.status(400).json({ error: `Invalid form key: ${formKey}` });
    }

    await pool.query('DELETE FROM survey_records WHERE form_key = ?', [formKey]);
    return res.status(200).json({ ok: true });
  } catch (err) {
    next(err);
  }
}

export async function importRecords(req, res, next) {
  try {
    const { formKey } = req.params;
    if (!VALID_FORMS.has(formKey)) {
      return res.status(400).json({ error: `Invalid form key: ${formKey}` });
    }

    const incoming = Array.isArray(req.body?.records) ? req.body.records : [];
    let count = 0;

    for (const r of incoming) {
      if (!r || !r.id) continue;
      const vCode = cleanVillageCode(r.villageCode || r.data?.villageCode);
      if (!validateVillageCode(vCode)) continue;

      const clientUpdated = r.updated ? Number(r.updated) : Date.now();
      const connection = await pool.getConnection();
      try {
        let dataJson = r.data && typeof r.data === 'object' ? r.data : r;
        dataJson = { ...dataJson, id: String(r.id) };
        dataJson = await prepareForPersistence(connection, formKey, vCode, dataJson);
        delete dataJson.id;
        let surveyDate = null;
        const d = r.date || dataJson.date;
        if (d && !isNaN(Date.parse(d))) surveyDate = new Date(d).toISOString().slice(0, 10);
        const [villageRows] = await connection.query('SELECT village_name FROM villages WHERE village_code = ? LIMIT 1', [vCode]);
        if (!villageRows.length) throw new Error(`Unknown village code: ${vCode}`);
        await connection.beginTransaction();
        await persistSurveyRecord(connection, {
          recordId: String(r.id),
          formKey,
          villageCode: vCode,
          villageName: villageRows[0].village_name,
          wadi: r.wadi || dataJson.wadi || null,
          interviewer: r.interviewer || dataJson.interviewer || null,
          respondent: r.respondent || dataJson.respondent || null,
          formNo: r.formNo || dataJson.formNo || null,
          surveyDate,
          dataJson,
          clientUpdated,
        });
        await connection.commit();
        count++;
      } catch (err) {
        await connection.rollback();
        throw err;
      } finally {
        connection.release();
      }
    }

    return res.status(200).json({ ok: true, count });
  } catch (err) {
    next(err);
  }
}

export async function getProblems(req, res, next) {
  try {
    const [rows] = await pool.query(
      `SELECT code, problem_en, problem_mr 
       FROM problem_catalog 
       ORDER BY CAST(SUBSTRING(code, 2) AS UNSIGNED), code`
    );

    return res.status(200).json({
      ok: true,
      count: rows.length,
      problems: rows,
    });
  } catch (err) {
    next(err);
  }
}

export async function createSurvey(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const rec = req.body;
    if (!rec || typeof rec !== 'object') {
      return res.status(400).json({ error: 'Survey payload must be a JSON object' });
    }

    const rawFormKey = rec.formKey || rec.form_key || rec.form || rec.data?.formKey;
    const formKey = normalizeFormKey(rawFormKey);
    if (!formKey) {
      return res.status(400).json({
        error: `Missing or invalid formKey: "${rawFormKey}". Must be one of: form0, formA, formB, formC, formD, formE, formF.`,
      });
    }

    const recordId = String(rec.id || `srv_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`).trim();

    const villageCode = cleanVillageCode(rec.villageCode || rec.data?.villageCode);
    if (!validateVillageCode(villageCode)) {
      return res.status(400).json({ error: `Invalid village code: "${rec.villageCode || rec.data?.villageCode}". Must be VG1 to VG21.` });
    }

    const [villageRows] = await connection.query('SELECT village_name FROM villages WHERE village_code = ? LIMIT 1', [villageCode]);
    if (!villageRows.length) return res.status(400).json({ error: `Unknown village code: ${villageCode}` });
    const villageName = villageRows[0].village_name;
    const wadi = rec.wadi || rec.data?.wadi || null;
    const interviewer = rec.interviewer || rec.data?.interviewer || null;
    const respondent = rec.respondent || rec.data?.respondent || null;
    const formNo = rec.formNo || rec.data?.formNo || null;

    let surveyDate = null;
    const dateInput = rec.date || rec.surveyDate || rec.survey_date || rec.data?.date;
    if (dateInput && !isNaN(Date.parse(dateInput))) {
      surveyDate = new Date(dateInput).toISOString().slice(0, 10);
    }

    let dataJson = rec.data && typeof rec.data === 'object' ? rec.data : rec;
    dataJson = { ...dataJson, id: recordId };
    dataJson = await prepareForPersistence(connection, formKey, villageCode, dataJson);
    delete dataJson.id;
    const clientUpdated = rec.updated ? Number(rec.updated) : Date.now();

    await connection.beginTransaction();

    await persistSurveyRecord(connection, {
      recordId,
      formKey,
      villageCode,
      villageName,
      wadi,
      interviewer,
      respondent,
      formNo,
      surveyDate,
      dataJson,
      clientUpdated,
    });

    await connection.commit();

    return res.status(201).json({
      ok: true,
      id: recordId,
      formKey,
      villageCode,
      updated: clientUpdated,
      data: dataJson,
    });
  } catch (err) {
    await connection.rollback();
    if (err?.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  } finally {
    connection.release();
  }
}

export async function getSurveysByVillage(req, res, next) {
  try {
    const villageCode = cleanVillageCode(req.params.village);
    if (!validateVillageCode(villageCode)) {
      return res.status(400).json({ error: `Invalid village code: "${req.params.village}". Must be VG1 to VG21.` });
    }

    const { formKey } = req.query;
    let sql = `SELECT id, form_key, village_code, village_name, wadi, interviewer, respondent, survey_date, form_no, data_json, client_updated 
               FROM survey_records 
               WHERE village_code = ?`;
    const params = [villageCode];

    if (formKey) {
      const normalized = normalizeFormKey(formKey);
      if (normalized) {
        sql += ' AND form_key = ?';
        params.push(normalized);
      }
    }

    sql += ' ORDER BY created_at DESC';

    const [rows] = await pool.query(sql, params);
    const records = rows.map(formatRowToRecord);

    return res.status(200).json({
      ok: true,
      villageCode,
      count: records.length,
      records,
    });
  } catch (err) {
    next(err);
  }
}

export async function updateSurvey(req, res, next) {
  const connection = await pool.getConnection();
  try {
    const { id } = req.params;
    const rec = req.body;

    if (!id) {
      return res.status(400).json({ error: 'Survey ID is required in URL path' });
    }
    if (!rec || typeof rec !== 'object') {
      return res.status(400).json({ error: 'Survey payload must be a JSON object' });
    }

    const [existing] = await connection.query(
      'SELECT form_key, village_code FROM survey_records WHERE id = ?',
      [id]
    );

    let formKey = normalizeFormKey(rec.formKey || rec.form_key || rec.form || rec.data?.formKey);
    if (!formKey) {
      if (existing.length > 0) {
        formKey = existing[0].form_key;
      } else {
        return res.status(400).json({ error: 'formKey is required for new survey records' });
      }
    }

    const villageCode = cleanVillageCode(rec.villageCode || rec.data?.villageCode || (existing[0]?.village_code));
    if (!validateVillageCode(villageCode)) {
      return res.status(400).json({ error: `Invalid village code: "${villageCode}". Must be VG1 to VG21.` });
    }

    const recordId = String(id).trim();
    const [villageRows] = await connection.query('SELECT village_name FROM villages WHERE village_code = ? LIMIT 1', [villageCode]);
    if (!villageRows.length) return res.status(400).json({ error: `Unknown village code: ${villageCode}` });
    const villageName = villageRows[0].village_name;
    const wadi = rec.wadi || rec.data?.wadi || null;
    const interviewer = rec.interviewer || rec.data?.interviewer || null;
    const respondent = rec.respondent || rec.data?.respondent || null;
    const formNo = rec.formNo || rec.data?.formNo || null;

    let surveyDate = null;
    const dateInput = rec.date || rec.surveyDate || rec.survey_date || rec.data?.date;
    if (dateInput && !isNaN(Date.parse(dateInput))) {
      surveyDate = new Date(dateInput).toISOString().slice(0, 10);
    }

    let dataJson = rec.data && typeof rec.data === 'object' ? rec.data : rec;
    dataJson = { ...dataJson, id: recordId };
    dataJson = await prepareForPersistence(connection, formKey, villageCode, dataJson);
    delete dataJson.id;
    const clientUpdated = rec.updated ? Number(rec.updated) : Date.now();

    await connection.beginTransaction();

    await persistSurveyRecord(connection, {
      recordId,
      formKey,
      villageCode,
      villageName,
      wadi,
      interviewer,
      respondent,
      formNo,
      surveyDate,
      dataJson,
      clientUpdated,
    });

    await connection.commit();

    return res.status(200).json({
      ok: true,
      id: recordId,
      formKey,
      villageCode,
      updated: clientUpdated,
      data: dataJson,
    });
  } catch (err) {
    await connection.rollback();
    if (err?.statusCode) return res.status(err.statusCode).json({ error: err.message });
    next(err);
  } finally {
    connection.release();
  }
}

export async function deleteSurveyById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Survey ID is required' });
    }

    const [result] = await pool.query('DELETE FROM survey_records WHERE id = ?', [id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: `Survey record with ID "${id}" not found` });
    }

    return res.status(200).json({ ok: true, id, deleted: true });
  } catch (err) {
    next(err);
  }
}
