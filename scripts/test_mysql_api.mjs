import assert from 'node:assert';

const BASE = 'http://localhost:8787/api';
const ROOT = 'http://localhost:8787';

async function testSuite() {
  console.log('--- STARTING COMPREHENSIVE MYSQL + API TEST SUITE ---');

  // 1. Health check & MySQL connection
  console.log('1. Testing GET /api/health...');
  const healthRes = await fetch(`${BASE}/health`);
  assert.strictEqual(healthRes.status, 200, 'Health check should return 200');
  const health = await healthRes.json();
  assert.strictEqual(health.ok, true, 'Health ok should be true');
  assert.strictEqual(health.database.connected, true, 'Database should be connected');
  assert.strictEqual(health.database.name, 'dna_survey_db', 'Database name should be dna_survey_db');
  console.log('   ✓ Health check passed (Connected to MySQL database "dna_survey_db")');

  // Clean up any test records in VG1
  console.log('2. Preparing clean test state in VG1...');
  await fetch(`${BASE}/forms/form0/test_form0_vg1`, { method: 'DELETE' });
  await fetch(`${BASE}/forms/formA/test_formA_vg1`, { method: 'DELETE' });
  await fetch(`${BASE}/forms/formB/test_formB_vg1`, { method: 'DELETE' });
  await fetch(`${BASE}/forms/formC/test_formC_vg1`, { method: 'DELETE' });
  await fetch(`${BASE}/forms/formD/test_formD_vg1`, { method: 'DELETE' });
  await fetch(`${BASE}/forms/formE/test_formE_vg1`, { method: 'DELETE' });

  // 3. Create/save a Form 0 record
  console.log('3. Testing Create/Save Form 0 record...');
  const form0Payload = {
    id: 'test_form0_vg1',
    villageCode: 'VG1',
    village: 'मांगवली',
    wadi: 'गावठण',
    date: '2026-09-12',
    formNo: '0-1 of 1',
    taluka: 'Vaibhavwadi',
    district: 'Sindhudurg',
    interviewer: 'Rahul Patil',
    respondent: 'Gram Sevak',
    data: {
      villageCode: 'VG1',
      village: 'मांगवली',
      population: '1250',
      households: '320',
      facility_0_number: '1',
      facility_0_remarks: 'Primary school running',
    },
    updated: Date.now(),
  };

  const saveForm0Res = await fetch(`${BASE}/forms/form0/test_form0_vg1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(form0Payload),
  });
  assert.strictEqual(saveForm0Res.status, 200, 'Saving Form 0 should return 200');
  const savedForm0 = await saveForm0Res.json();
  assert.strictEqual(savedForm0.ok, true);
  console.log('   ✓ Form 0 saved successfully in MySQL');

  // Verify Form 0 list
  const listForm0Res = await fetch(`${BASE}/forms/form0`);
  const form0List = await listForm0Res.json();
  assert(form0List.records.some((r) => r.id === 'test_form0_vg1'), 'Saved Form 0 should be listed');
  console.log('   ✓ Form 0 retrieved via GET /api/forms/form0');

  // 4. Save Form A (Farmers) with TAI screening rows
  console.log('4. Testing Save Form A (Farmers) with TAI Screening (P06)...');
  const formAPayload = {
    id: 'test_formA_vg1',
    villageCode: 'VG1',
    village: 'मांगवली',
    date: '2026-09-12',
    formNo: 'A-1 of 5',
    interviewer: 'Rahul Patil',
    data: {
      villageCode: 'VG1',
      village: 'मांगवली',
      land: '2.5-5',
      taiUse: [
        { fieldId: 'P06', problem: 'Crop pest', long: true, often: true, many: true, realLoss: true, keep: 'Keep', tech: 'Tech' },
        { fieldId: 'P01', problem: 'Water', long: false, often: false, many: false, realLoss: false, keep: 'Drop', tech: 'Admin' },
      ],
    },
    updated: Date.now(),
  };
  const saveFormARes = await fetch(`${BASE}/forms/formA/test_formA_vg1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formAPayload),
  });
  assert.strictEqual(saveFormARes.status, 200, 'Saving Form A should return 200');
  console.log('   ✓ Form A saved and normalized in MySQL (tai_screenings populated)');

  // 5. Save Forms B, C, D
  console.log('5. Testing Save Forms B, C, D...');
  await fetch(`${BASE}/forms/formB/test_formB_vg1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'test_formB_vg1', villageCode: 'VG1', village: 'मांगवली', date: '2026-09-12',
      data: { villageCode: 'VG1', waterSource: 'Tap in house', taiUse: [{ fieldId: 'P01', long: true, often: true, keep: 'Keep' }] },
      updated: Date.now(),
    }),
  });
  await fetch(`${BASE}/forms/formC/test_formC_vg1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'test_formC_vg1', villageCode: 'VG1', village: 'मांगवली', date: '2026-09-12',
      data: { villageCode: 'VG1', role: 'ASHA', taiUse: [{ fieldId: 'P15', long: true, often: true, keep: 'Keep' }] },
      updated: Date.now(),
    }),
  });
  await fetch(`${BASE}/forms/formD/test_formD_vg1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'test_formD_vg1', villageCode: 'VG1', village: 'मांगवली', date: '2026-09-12',
      data: { villageCode: 'VG1', status: 'Studying', taiUse: [{ fieldId: 'P23', long: true, often: true, keep: 'Keep' }] },
      updated: Date.now(),
    }),
  });
  console.log('   ✓ Forms B, C, D saved successfully');

  // 6. Save Form E (Village Walk with 16 observation stops)
  console.log('6. Testing Save Form E (Village Walk 16 stops)...');
  const formEPayload = {
    id: 'test_formE_vg1',
    villageCode: 'VG1',
    village: 'मांगवली',
    date: '2026-09-12',
    data: {
      villageCode: 'VG1',
      village: 'मांगवली',
      walkStart: '08:30',
      walkEnd: '12:00',
      teamMembers: 'Rahul, Amit, Gram Sevak',
      stops: [
        { id: 'E1', place: 'Water source', look: 'Pump running?', see: 'Pump burned, leak at pipe', photo: 'IMG_E1_01.jpg', gps: '16.5123, 73.6543', fieldId: 'P04' },
        { id: 'E10', place: 'Internal road', look: 'Surface', see: 'Culvert cracked, monsoon mud', photo: 'IMG_E10_02.jpg', gps: '16.5180, 73.6590', fieldId: 'P22' },
      ],
    },
    updated: Date.now(),
  };
  const saveFormERes = await fetch(`${BASE}/forms/formE/test_formE_vg1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formEPayload),
  });
  assert.strictEqual(saveFormERes.status, 200, 'Saving Form E should return 200');
  console.log('   ✓ Form E saved and form_e_stops populated in MySQL');

  // 7. Test Form F Status & Bundle endpoints
  console.log('7. Testing Form F endpoints (village status & bundle)...');
  const statusRes = await fetch(`${BASE}/villages/VG1/status`);
  const statusData = await statusRes.json();
  assert.strictEqual(statusData.villageCode, 'VG1');
  assert.strictEqual(statusData.form0Ready, true, 'form0Ready should be true');
  assert(statusData.counts.form0 >= 1);
  assert(statusData.counts.formA >= 1);
  assert(statusData.counts.formE >= 1);
  console.log('   ✓ GET /api/villages/VG1/status passed (form0Ready=true)');

  const bundleRes = await fetch(`${BASE}/villages/VG1/bundle`);
  const bundle = await bundleRes.json();
  assert.strictEqual(bundle.villageCode, 'VG1');
  assert(bundle.forms.formA.length >= 1);
  assert(bundle.forms.formE.length >= 1);
  console.log('   ✓ GET /api/villages/VG1/bundle passed (Bundle retrieved with all forms)');

  // 8. Update a record
  console.log('8. Testing Update record...');
  formAPayload.data.land = '>5';
  formAPayload.interviewer = 'Rahul Patil (Updated)';
  const updateRes = await fetch(`${BASE}/forms/formA/test_formA_vg1`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formAPayload),
  });
  assert.strictEqual(updateRes.status, 200);
  const updatedList = await (await fetch(`${BASE}/forms/formA`)).json();
  const updatedItem = updatedList.records.find((r) => r.id === 'test_formA_vg1');
  assert.strictEqual(updatedItem.interviewer, 'Rahul Patil (Updated)');
  console.log('   ✓ Record update verified');

  // 9. Batch Import records
  console.log('9. Testing POST /api/forms/formA/import...');
  const importRes = await fetch(`${BASE}/forms/formA/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      records: [
        { id: 'import_a1', villageCode: 'VG2', village: 'तिरवडे', data: { land: '<1' }, updated: Date.now() },
        { id: 'import_a2', villageCode: 'VG2', village: 'तिरवडे', data: { land: '1-2.5' }, updated: Date.now() },
      ],
    }),
  });
  const importData = await importRes.json();
  assert.strictEqual(importData.ok, true);
  assert.strictEqual(importData.count, 2);
  console.log('   ✓ Batch import passed (2 records imported)');

  // 10. Image Upload Testing
  console.log('10. Testing Image Upload (POST /api/upload)...');
  // Create a minimal valid 1x1 PNG buffer
  const png1x1 = Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
    'base64'
  );
  const formData = new FormData();
  formData.append('villageCode', 'VG1');
  formData.append('stopId', 'E1');
  formData.append('caption', 'Water Pump Leakage Test Image');
  formData.append('photo', new Blob([png1x1], { type: 'image/png' }), 'test_pump.png');

  const uploadRes = await fetch(`${BASE}/upload`, {
    method: 'POST',
    body: formData,
  });
  assert.strictEqual(uploadRes.status, 201, 'Image upload should return 201');
  const uploadData = await uploadRes.json();
  assert.strictEqual(uploadData.ok, true);
  assert(uploadData.url.startsWith('/uploads/'));
  assert(uploadData.id > 0);
  console.log(`   ✓ Image uploaded successfully (Saved to MySQL ID: ${uploadData.id}, URL: ${uploadData.url})`);

  // 11. Image Retrieval via static file server
  console.log('11. Testing Image Retrieval from URL...');
  const imgUrl = `${ROOT}${uploadData.url}`;
  const getImgRes = await fetch(imgUrl);
  assert.strictEqual(getImgRes.status, 200, 'Image should be retrievable from static /uploads route');
  const imgBytes = await getImgRes.arrayBuffer();
  assert.strictEqual(imgBytes.byteLength, png1x1.byteLength);
  console.log('   ✓ Image verified and served byte-for-byte from server storage');

  // 12. Query images table via API
  console.log('12. Testing GET /api/images...');
  const listImgRes = await fetch(`${BASE}/images?villageCode=VG1`);
  const listImgData = await listImgRes.json();
  assert.strictEqual(listImgData.ok, true);
  assert(listImgData.images.some((img) => img.id === uploadData.id));
  console.log('   ✓ Image metadata verified in MySQL survey_images table');

  // 13. Testing Invalid Inputs
  console.log('13. Testing Invalid Input Validation...');
  // Invalid village code (VG999)
  const invalidVillageRes = await fetch(`${BASE}/forms/form0/invalid_id`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: 'invalid_id', villageCode: 'VG999', data: {} }),
  });
  assert.strictEqual(invalidVillageRes.status, 400, 'Invalid village should be rejected with 400');
  console.log('   ✓ Invalid village code rejected with 400');

  // Invalid form key
  const invalidFormRes = await fetch(`${BASE}/forms/formZ`, { method: 'GET' });
  assert.strictEqual(invalidFormRes.status, 400, 'Invalid form key should return 400');
  console.log('   ✓ Invalid form key rejected with 400');

  // 14. Testing Invalid Image Type
  console.log('14. Testing Invalid Image File Type...');
  const badFormData = new FormData();
  badFormData.append('photo', new Blob(['console.log("hello");'], { type: 'text/javascript' }), 'script.js');
  const badTypeRes = await fetch(`${BASE}/upload`, {
    method: 'POST',
    body: badFormData,
  });
  assert.strictEqual(badTypeRes.status, 400, 'Non-image file should be rejected with 400');
  console.log('   ✓ Invalid image type (script.js) safely rejected with 400');

  // 15. Testing Oversized Image Handling
  console.log('15. Testing Oversized Image (>15MB)...');
  const largeBlob = new Blob([new Uint8Array(16 * 1024 * 1024)], { type: 'image/jpeg' });
  const oversizedForm = new FormData();
  oversizedForm.append('photo', largeBlob, 'huge_photo.jpg');
  const oversizedRes = await fetch(`${BASE}/upload`, {
    method: 'POST',
    body: oversizedForm,
  });
  assert.strictEqual(oversizedRes.status, 400, 'Oversized file should be rejected with 400');
  const oversizedErr = await oversizedRes.json();
  assert(oversizedErr.error.includes('large') || oversizedErr.error.includes('size'));
  console.log('   ✓ Oversized file (>15MB) rejected with 400 and friendly message');

  // 16. Test Delete Record
  console.log('16. Testing Delete Record...');
  const delRes = await fetch(`${BASE}/forms/formA/import_a1`, { method: 'DELETE' });
  assert.strictEqual(delRes.status, 200);
  const checkDelList = await (await fetch(`${BASE}/forms/formA`)).json();
  assert(!checkDelList.records.some((r) => r.id === 'import_a1'));
  console.log('   ✓ Record deletion verified');

  // 17. Test Phase 1: GET /api/villages
  console.log('17. Testing Phase 1: GET /api/villages...');
  const villagesRes = await fetch(`${BASE}/villages`);
  assert.strictEqual(villagesRes.status, 200, 'GET /api/villages should return 200');
  const villagesData = await villagesRes.json();
  assert.strictEqual(villagesData.ok, true);
  assert.strictEqual(villagesData.count, 21, 'Should return 21 project villages');
  assert.strictEqual(villagesData.villages[0].village_code, 'VG1');
  assert.strictEqual(villagesData.villages[0].village_name, 'मांगवली');
  console.log('   ✓ GET /api/villages returned 21 villages from MySQL database');

  // 18. Test Phase 1: GET /api/problems
  console.log('18. Testing Phase 1: GET /api/problems...');
  const problemsRes = await fetch(`${BASE}/problems`);
  assert.strictEqual(problemsRes.status, 200, 'GET /api/problems should return 200');
  const problemsData = await problemsRes.json();
  assert.strictEqual(problemsData.ok, true);
  assert.strictEqual(problemsData.count, 28, 'Should return 28 problem codes (P01-P28)');
  assert.strictEqual(problemsData.problems[0].code, 'P01');
  assert(problemsData.problems[0].problem_en.includes('Drinking water'));
  console.log('   ✓ GET /api/problems returned 28 problem catalog items from MySQL database');

  // 19. Test Phase 1: POST /api/surveys
  console.log('19. Testing Phase 1: POST /api/surveys...');
  const surveyCreateRes = await fetch(`${BASE}/surveys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      id: 'test_survey_post_vg2',
      formKey: 'formA',
      villageCode: 'VG2',
      village: 'तिरवडे तर्फ खारेपाटण',
      wadi: 'वाडी १',
      date: '2026-09-12',
      interviewer: 'Pooja',
      respondent: 'Farmer Kisan',
      data: {
        villageCode: 'VG2',
        village: 'तिरवडे तर्फ खारेपाटण',
        land: '1-2.5',
        taiUse: [
          { fieldId: 'P03', problem: 'Irrigation water', long: true, often: true, many: false, realLoss: true, keep: 'Keep', tech: 'Tech' },
        ],
      },
    }),
  });
  assert.strictEqual(surveyCreateRes.status, 201, 'POST /api/surveys should return 201');
  const surveyCreated = await surveyCreateRes.json();
  assert.strictEqual(surveyCreated.ok, true);
  assert.strictEqual(surveyCreated.id, 'test_survey_post_vg2');
  assert.strictEqual(surveyCreated.formKey, 'formA');
  console.log('   ✓ POST /api/surveys successfully created survey record in MySQL');

  // 20. Test Phase 1: GET /api/surveys/:village
  console.log('20. Testing Phase 1: GET /api/surveys/:village...');
  const villageSurveysRes = await fetch(`${BASE}/surveys/VG2`);
  assert.strictEqual(villageSurveysRes.status, 200, 'GET /api/surveys/VG2 should return 200');
  const villageSurveys = await villageSurveysRes.json();
  assert.strictEqual(villageSurveys.ok, true);
  assert.strictEqual(villageSurveys.villageCode, 'VG2');
  assert(villageSurveys.records.some((r) => r.id === 'test_survey_post_vg2'));

  // Test with query filter ?formKey=formA
  const filteredSurveysRes = await fetch(`${BASE}/surveys/VG2?formKey=formA`);
  const filteredSurveys = await filteredSurveysRes.json();
  assert(filteredSurveys.records.every((r) => r.formKey === 'formA'));
  console.log('   ✓ GET /api/surveys/VG2 successfully fetched records from MySQL');

  // 21. Test Phase 1: PUT /api/surveys/:id
  console.log('21. Testing Phase 1: PUT /api/surveys/:id...');
  const surveyUpdateRes = await fetch(`${BASE}/surveys/test_survey_post_vg2`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      villageCode: 'VG2',
      interviewer: 'Pooja (Updated)',
      data: {
        villageCode: 'VG2',
        land: '>5',
      },
    }),
  });
  assert.strictEqual(surveyUpdateRes.status, 200, 'PUT /api/surveys/:id should return 200');
  const checkUpdatedRes = await fetch(`${BASE}/surveys/VG2`);
  const checkUpdated = await checkUpdatedRes.json();
  const updatedRec = checkUpdated.records.find((r) => r.id === 'test_survey_post_vg2');
  assert.strictEqual(updatedRec.interviewer, 'Pooja (Updated)');
  console.log('   ✓ PUT /api/surveys/:id successfully updated survey in MySQL');

  // 22. Test Phase 1: DELETE /api/surveys/:id
  console.log('22. Testing Phase 1: DELETE /api/surveys/:id...');
  const surveyDelRes = await fetch(`${BASE}/surveys/test_survey_post_vg2`, {
    method: 'DELETE',
  });
  assert.strictEqual(surveyDelRes.status, 200, 'DELETE /api/surveys/:id should return 200');
  const checkAfterDelRes = await fetch(`${BASE}/surveys/VG2`);
  const checkAfterDel = await checkAfterDelRes.json();
  assert(!checkAfterDel.records.some((r) => r.id === 'test_survey_post_vg2'));
  console.log('   ✓ DELETE /api/surveys/:id successfully deleted survey from MySQL');

  console.log('\n======================================================');
  console.log('ALL TESTS PASSED SUCCESSFULLY!');
  console.log('MySQL + Express API + Image Upload are 100% OPERATIONAL!');
  console.log('======================================================');
}

async function cleanup() {
  const ids = [
    'test_form0_vg1', 'test_formA_vg1', 'test_formB_vg1',
    'test_formC_vg1', 'test_formD_vg1', 'test_formE_vg1',
    'import_a1', 'import_a2', 'test_survey_post_vg2'
  ];
  for (const id of ids) {
    try { await fetch(`${BASE}/surveys/${id}`, { method: 'DELETE' }); } catch {}
    for (const f of ['form0', 'formA', 'formB', 'formC', 'formD', 'formE']) {
      try { await fetch(`${BASE}/forms/${f}/${id}`, { method: 'DELETE' }); } catch {}
    }
  }
}

try {
  await cleanup();
  await testSuite();
} finally {
  await cleanup();
}
