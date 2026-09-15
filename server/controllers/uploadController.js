import { pool } from '../config/db.js';
import { cleanVillageCode, validateVillageCode } from './formsController.js';

export async function uploadImage(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded. Please send an image using field name "image" or "photo".' });
    }

    const file = req.file;
    let villageCode = cleanVillageCode(req.body?.villageCode || req.query?.villageCode);
    if (!validateVillageCode(villageCode)) {
      villageCode = 'VG1'; // Default fallback if village is not selected yet
    }

    const recordId = req.body?.recordId ? String(req.body.recordId).trim() : null;
    const stopId = req.body?.stopId ? String(req.body.stopId).slice(0, 10) : null;
    const title = req.body?.caption || req.body?.imageTitle || file.originalname;
    const sizeKb = Math.round(file.size / 1024);
    const publicPath = `/uploads/${file.filename}`;

    const [result] = await pool.query(
      `INSERT INTO survey_images 
        (record_id, village_code, stop_id, image_title, file_path, file_name, file_size_kb, mime_type)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        recordId,
        villageCode,
        stopId,
        String(title).slice(0, 255),
        publicPath,
        file.filename,
        sizeKb,
        file.mimetype,
      ]
    );

    return res.status(201).json({
      ok: true,
      id: result.insertId,
      url: publicPath,
      fileName: file.filename,
      originalName: file.originalname,
      fileSizeKb: sizeKb,
      mimeType: file.mimetype,
      villageCode,
      stopId,
    });
  } catch (err) {
    next(err);
  }
}

export async function listImages(req, res, next) {
  try {
    const { villageCode, recordId, stopId } = req.query;
    let sql = 'SELECT id, record_id, village_code, stop_id, image_title, file_path, file_name, file_size_kb, mime_type, uploaded_at FROM survey_images WHERE 1=1';
    const params = [];

    if (villageCode) {
      const code = cleanVillageCode(villageCode);
      if (validateVillageCode(code)) {
        sql += ' AND village_code = ?';
        params.push(code);
      }
    }
    if (recordId) {
      sql += ' AND record_id = ?';
      params.push(recordId);
    }
    if (stopId) {
      sql += ' AND stop_id = ?';
      params.push(stopId);
    }

    sql += ' ORDER BY uploaded_at DESC';

    const [rows] = await pool.query(sql, params);
    return res.status(200).json({ ok: true, images: rows });
  } catch (err) {
    next(err);
  }
}

export async function getImageById(req, res, next) {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT id, record_id, village_code, stop_id, image_title, file_path, file_name, file_size_kb, mime_type, uploaded_at FROM survey_images WHERE id = ?',
      [id]
    );

    if (!rows.length) {
      return res.status(404).json({ error: 'Image not found' });
    }
    return res.status(200).json({ ok: true, image: rows[0] });
  } catch (err) {
    next(err);
  }
}
