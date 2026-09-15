import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import multer from 'multer';

import { testConnection } from './config/db.js';
import { backfillSurveyAnswers } from './lib/answerStore.js';
import { UPLOADS_DIR, upload } from './middleware/upload.js';
import {
  listRecords,
  saveRecord,
  deleteRecord,
  clearRecords,
  importRecords,
  getProblems,
  createSurvey,
  getSurveysByVillage,
  updateSurvey,
  deleteSurveyById,
} from './controllers/formsController.js';
import {
  getVillages,
  getVillageBundle,
  getVillageStatus,
} from './controllers/villageController.js';
import {
  uploadImage,
  listImages,
  getImageById,
} from './controllers/uploadController.js';
import { exportForm, exportAll } from './controllers/exportController.js';

// Load environment variables
const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const PORT = Number(process.env.API_PORT || process.env.PORT || 8787);
const app = express();

// Enable CORS and JSON parsing
app.use(cors());
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));

// Serve static uploaded images at /uploads and /api/uploads
app.use('/uploads', express.static(UPLOADS_DIR));
app.use('/api/uploads', express.static(UPLOADS_DIR));

// 1. Health check
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  return res.status(200).json({
    ok: true,
    service: 'DNA Survey API (MySQL)',
    time: new Date().toISOString(),
    database: {
      connected: dbStatus.ok,
      name: dbStatus.database || process.env.DB_NAME || 'dna_survey_db',
      host: dbStatus.host || process.env.DB_HOST || 'localhost',
      error: dbStatus.error || null,
    },
  });
});

// 2. Master data catalog endpoints
app.get('/api/villages', getVillages);
app.get('/api/problems', getProblems);

// Excel export endpoints
app.get('/api/export/all', exportAll);
app.get('/api/export/:formKey', exportForm);

// 3. Survey RESTful endpoints
app.post('/api/surveys', createSurvey);
app.get('/api/surveys/:village', getSurveysByVillage);
app.put('/api/surveys/:id', updateSurvey);
app.delete('/api/surveys/:id', deleteSurveyById);

// 4. Form-key scoped endpoints (Preserved for compatibility)
app.get('/api/forms/:formKey', listRecords);
app.put('/api/forms/:formKey/:id', saveRecord);
app.delete('/api/forms/:formKey/:id', deleteRecord);
app.delete('/api/forms/:formKey', clearRecords);
app.post('/api/forms/:formKey/import', importRecords);

// 5. Village bundle & status endpoints (Required by Form F)
app.get('/api/villages/:villageCode/bundle', getVillageBundle);
app.get('/api/villages/:villageCode/status', getVillageStatus);

// 4. Image upload & retrieval endpoints
// Safe upload wrapper accepting any field name ('image', 'photo', 'file', etc.)
app.post(
  '/api/upload',
  (req, res, next) => {
    upload.any()(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'Image file too large. Maximum allowed size is 15MB.' });
          }
          return res.status(400).json({ error: `Upload error: ${err.message}` });
        }
        return res.status(400).json({ error: err.message });
      }
      if (req.files && req.files.length > 0) {
        req.file = req.files[0];
      }
      next();
    });
  },
  uploadImage
);

app.get('/api/images', listImages);
app.get('/api/images/:id', getImageById);

// 5. 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
});

// 6. Global error handler
app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
  console.error('[API Error]', err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || 'Internal server error',
  });
});

// Start listening
const server = app.listen(PORT, async () => {
  console.log(`DNA Survey API (Express + MySQL) running at http://localhost:${PORT}`);
  const dbStatus = await testConnection();
  if (dbStatus.ok) {
    console.log(`Connected to MySQL database "${dbStatus.database}" on ${dbStatus.host}`);
    try {
      const mirrored = await backfillSurveyAnswers({ onlyMissing: true });
      console.log(`Normalized answer storage ready: ${mirrored.processed} survey record(s) synchronized; ${mirrored.unmapped} unmapped field(s).`);
    } catch (err) {
      console.error(`Answer-storage initialization failed: ${err.message}`);
    }
  } else {
    console.error(`MySQL connection failed: ${dbStatus.error}`);
    console.error(`Please verify MySQL credentials in .env`);
  }
});

export default server;
