import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '../api';

const STORE = 'tai-form0-v1';

const villageMap = {
  VG1: 'मांगवली',
  VG2: 'तिरवडे तर्फ खारेपाटण',
  VG3: 'ऐणारी',
  VG4: 'भुईबावडा',
  VG5: 'उंबर्डे',
  VG6: 'कुर्ली',
  VG7: 'सडुरे-शिराळे',
  VG8: 'अरुळे',
  VG9: 'निमअरुळे',
  VG10: 'एडगाव',
  VG11: 'कुसूर',
  VG12: 'सोनाळी',
  VG13: 'कुंभवडे',
  VG14: 'लोरे नं.२',
  VG15: 'आचिर्णे',
  VG16: 'खांबाळे',
  VG17: 'हेत',
  VG18: 'मौदे',
  VG19: 'आखवणे भोम',
  VG20: 'नेर्ले',
  VG21: 'उपळे',
};

const facilities = [
  'ZP / Primary school|जि.प./प्राथमिक शाळा',
  'Secondary school / Jr. college|माध्यमिक शाळा/कनिष्ठ महाविद्यालय',
  'Anganwadi centres|अंगणवाडी केंद्रे',
  'Sub-centre / PHC / Ayurvedic|उपकेंद्र/PHC/आयुर्वेदिक',
  'Veterinary dispensary|पशुवैद्यकीय दवाखाना',
  'Dairy / milk collection centre|दुग्ध/दूध संकलन केंद्र',
  'Bank / ATM / CSC-Aaple Sarkar|बँक/ATM/CSC-आपले सरकार',
  'SHGs (active) / FPO / Sanstha|सक्रिय बचत गट/FPO/संस्था',
  'Piped water schemes|नळ पाणीपुरवठा योजना',
  'Public wells / borewells|सार्वजनिक विहिरी/बोअरवेल',
  'Overhead tanks (ESR)|उंच पाण्याच्या टाक्या (ESR)',
  'Public stand-posts|सार्वजनिक नळ',
  'Street lights (total / dead)|पथदिवे (एकूण/बंद)',
  'CCTV / PA system|CCTV/ध्वनिक्षेपण यंत्रणा',
  'Computer + internet at GP|ग्रामपंचायतीतील संगणक+इंटरनेट',
  'Weekly market / godown|आठवडी बाजार/गोदाम',
];

const occupations = [
  'Paddy (भात)',
  'Mango orchard (आंबा)',
  'Cashew (काजू)',
  'Kokum / coconut / areca (कोकम/नारळ/सुपारी)',
  'Dairy & livestock (दुग्ध व पशुधन)',
  'Fishing - river/sea (मत्स्यव्यवसाय)',
  'Forest produce (वनउत्पादन)',
  'Wage labour / MGNREGA (मजुरी/मनरेगा)',
  'Service / job outside (बाहेरील नोकरी)',
  'Tourism / homestay (पर्यटन)',
  'Migration to Mumbai-Goa-Pune (स्थलांतर)',
];

const schemes = [
  '15th Finance Commission',
  'MGNREGA',
  'Jal Jeevan Mission',
  'SBM-G',
  'PMGSY',
  'ZP Funds',
  'CSR',
  'Earlier Smart-Village Grant',
  'Other',
];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function genId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

function codeForVillage(name) {
  return Object.keys(villageMap).find((code) => villageMap[code] === name) || '';
}

function readDB() {
  try {
    const x = JSON.parse(localStorage.getItem(STORE));
    return x && Array.isArray(x.records) ? x : { records: [] };
  } catch {
    return { records: [] };
  }
}

function emptyForm() {
  const o = {
    villageCode: '',
    village: '',
    wadi: '',
    date: today(),
    formNo: '0-1 of 1',
    taluka: 'Vaibhavwadi',
    district: 'Sindhudurg',
    respondent: '',
    interviewer: '',
    startTime: '',
    endTime: '',
    age: '',
    gender: '',
    language: [],
    tai: 'Government Polytechnic, Kolhapur',
    visitDate: today(),
    reportDate: '',
    teamLeader: '',
    technicalExpert: '',
    technicalMobile: '',
    govtOfficer: '',
    govtMobile: '',
    sarpanchName: '',
    sarpanchMobile: '',
    gramSevakName: '',
    gramSevakMobile: '',
    fieldCoordinator: '',
    population: '',
    households: '',
    wadiCount: '',
    revenueVillages: '',
    latitude: '',
    longitude: '',
    electricityHours: '',
    annualBudget: '',
    talukaDistance: '',
    busTrips: '',
    populationBand: '',
    gpType: [],
    mobileSignal: '',
    occupation: [...occupations],
    migrationFamilies: '',
    landholding: '',
    confirmation: [],
    confirmName: '',
    confirmMobile: '',
    signatureObtained: '',
    signatureDate: '',
    works: [{ scheme: '', name: '', location: '', status: '' }, { scheme: '', name: '', location: '', status: '' }, { scheme: '', name: '', location: '', status: '' }],
  };
  // facility + occupation rank defaults
  for (let i = 0; i < 8; i++) {
    o[`facility_${i}_number`] = '';
    o[`facility_${i}_remarks`] = '';
    o[`facility_${i + 8}_number`] = '';
    o[`facility_${i + 8}_remarks`] = '';
  }
  for (let i = 0; i < occupations.length; i++) {
    o[`occupationRank_${i}`] = '';
  }
  return o;
}

function recordToForm(rec) {
  if (!rec) return emptyForm();
  const base = {
    villageCode: rec.villageCode || codeForVillage(rec.village) || '',
    village: rec.village || '',
    wadi: rec.wadi || '',
    date: rec.date || today(),
    formNo: rec.formNo || '0-1 of 1',
    taluka: rec.taluka || 'Vaibhavwadi',
    district: rec.district || 'Sindhudurg',
    respondent: rec.respondent || '',
    interviewer: rec.interviewer || '',
    startTime: rec.startTime || '',
    endTime: rec.endTime || '',
    age: rec.age || '',
    gender: rec.gender || '',
    language: Array.isArray(rec.language) ? rec.language : rec.language ? [rec.language] : [],
  };
  const data = rec.data || {};
  const form = { ...emptyForm(), ...base, ...data };
  // ensure arrays
  form.language = Array.isArray(form.language) ? form.language : form.language ? [form.language] : [];
  form.gpType = Array.isArray(form.gpType) ? form.gpType : form.gpType ? [form.gpType] : [];
  form.occupation = Array.isArray(form.occupation) ? form.occupation : form.occupation ? [form.occupation] : [];
  form.confirmation = Array.isArray(form.confirmation) ? form.confirmation : form.confirmation ? [form.confirmation] : [];
  form.works = Array.isArray(form.works) && form.works.length ? form.works : [{ scheme: '', name: '', location: '', status: '' }, { scheme: '', name: '', location: '', status: '' }, { scheme: '', name: '', location: '', status: '' }];
  const legacyPriorityMap = { '1': '1-High', '2': '2-Medium', '3': '3-Low' };
  for (let i = 0; i < occupations.length; i++) {
    form[`occupationRank_${i}`] = legacyPriorityMap[form[`occupationRank_${i}`]] || form[`occupationRank_${i}`] || '';
  }
  form.occupation = [...occupations];
  return form;
}

function Form0({ session, setSession }) {
  const [db, setDb] = useState(readDB);
  const [editing, setEditing] = useState(null);
  const [currentView, setCurrentView] = useState('entry');
  const [form, setForm] = useState(emptyForm);
  const [saveState, setSaveState] = useState('Ready');
  const [search, setSearch] = useState('');
  const jsonFileRef = useRef(null);

  const persist = useCallback((nextDb) => {
    try {
      localStorage.setItem(STORE, JSON.stringify(nextDb));
      setSaveState('✓ Saved ' + new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
    } catch {
      setSaveState('⚠ Storage unavailable — export JSON now');
    }
  }, []);

  useEffect(() => {
    persist(db);
  }, [db, persist]);

  useEffect(() => {
    let alive = true;
    api.listRecords('form0').then(async (remote) => {
      if (!alive) return;
      const remoteRecords = Array.isArray(remote.records) ? remote.records : [];
      const localRecords = readDB().records;
      const merged = new Map(remoteRecords.map((r) => [r.id, r]));
      for (const r of localRecords) {
        const server = merged.get(r.id);
        if (!server || Number(r.updated || 0) > Number(server.updated || 0)) merged.set(r.id, r);
      }
      const next = { records: [...merged.values()] };
      setDb(next);
      setSaveState('✓ API connected');
      const remoteById = new Map(remoteRecords.map((r) => [r.id, r]));
      const pending = next.records.filter((r) => !remoteById.has(r.id) || Number(r.updated || 0) > Number(remoteById.get(r.id)?.updated || 0));
      for (const r of pending) { try { await api.saveRecord('form0', r); } catch {} }
    }).catch(() => setSaveState('⚠ Offline — using local cache'));
    return () => { alive = false; };
  }, []);

  // load editing record into form
  useEffect(() => {
    if (editing) {
      const rec = db.records.find((x) => x.id === editing);
      setForm(recordToForm(rec));
    } else {
      setForm(emptyForm());
    }
  }, [editing]); // eslint-disable-line react-hooks/exhaustive-deps

  const updateField = (name, value) => {
    setForm((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'villageCode') {
        next.village = villageMap[value] || '';
      }
      return next;
    });
  };

  const toggleCheck = (name, value) => {
    setForm((prev) => {
      const arr = Array.isArray(prev[name]) ? [...prev[name]] : [];
      const idx = arr.indexOf(value);
      if (idx >= 0) arr.splice(idx, 1);
      else arr.push(value);
      return { ...prev, [name]: arr };
    });
  };

  const updateWork = (index, key, value) => {
    setForm((prev) => {
      const works = prev.works.map((w, i) => (i === index ? { ...w, [key]: value } : w));
      return { ...prev, works };
    });
  };

  const addWork = () => {
    setForm((prev) => ({
      ...prev,
      works: [...prev.works, { scheme: '', name: '', location: '', status: '' }],
    }));
  };

  const removeWork = (index) => {
    setForm((prev) => ({
      ...prev,
      works: prev.works.filter((_, i) => i !== index),
    }));
  };

  const saveRecord = async (e) => {
    e.preventDefault();
    if (!villageMap[form.villageCode]) {
      alert('Please select a valid Village Code.');
      return;
    }
    const missingOccupationPriority = occupations.findIndex((_, i) => !form[`occupationRank_${i}`]);
    if (missingOccupationPriority >= 0) {
      alert(`Section C is mandatory. Please select a priority for: ${occupations[missingOccupationPriority]}`);
      return;
    }
    const base = {
      villageCode: form.villageCode,
      village: villageMap[form.villageCode],
      wadi: form.wadi || '',
      date: form.date || '',
      formNo: form.formNo || '',
      taluka: form.taluka || '',
      district: form.district || '',
      respondent: form.respondent || '',
      interviewer: form.interviewer || '',
      startTime: form.startTime || '',
      endTime: form.endTime || '',
      age: form.age || '',
      gender: form.gender || '',
      language: form.language || [],
    };
    const data = { ...form };
    // remove base keys from data
    ['villageCode', 'village', 'wadi', 'date', 'formNo', 'taluka', 'district', 'respondent', 'interviewer', 'startTime', 'endTime', 'age', 'gender', 'language'].forEach((k) => delete data[k]);
    // clean works and keep all Section C livelihood fields because all 11 are mandatory
    data.works = (form.works || []).filter((r) => Object.values(r).some(Boolean));
    data.occupation = [...occupations];

    const rec = {
      id: editing || genId(),
      ...base,
      data,
      updated: Date.now(),
    };

    const duplicate = db.records.find(
      (x) =>
        (x.villageCode === rec.villageCode || x.village.trim().toLowerCase() === rec.village.trim().toLowerCase()) &&
        x.id !== rec.id
    );
    if (duplicate) {
      alert(`${rec.villageCode} — ${rec.village} already has Form 0. Form 0 is one-per-village; open the saved record and edit it instead.`);
      return;
    }

    setDb((prev) => {
      const records = [...prev.records];
      const i = records.findIndex((x) => x.id === rec.id);
      if (i >= 0) records[i] = rec;
      else records.push(rec);
      return { records };
    });
    setSession((prev) => ({ ...prev, villageCode: rec.villageCode, village: rec.village, wadi: rec.wadi, date: rec.date, interviewer: rec.interviewer, taluka: rec.taluka, district: rec.district }));
    setSaveState('Saving to API…');
    let apiSaved = false;
    try {
      await api.saveRecord('form0', rec);
      apiSaved = true;
      setSaveState('✓ Saved to API');
    } catch {
      setSaveState('⚠ API unavailable — saved locally; sync pending');
    }
    setEditing(rec.id);
    alert(apiSaved ? 'FORM 0 saved to API successfully.' : 'FORM 0 saved locally. It will sync when the API reconnects.');
    setCurrentView('records');
  };

  const clearForm = () => {
    setEditing(null);
    setForm(emptyForm());
    window.scrollTo(0, 0);
  };

  const printForm = () => window.print();

  const deleteRecord = (id) => {
    if (!window.confirm('Delete this FORM 0 entry?')) return;
    setDb((prev) => ({ records: prev.records.filter((x) => x.id !== id) }));
    api.deleteRecord('form0', id).catch(() => setSaveState('⚠ Delete pending — API unavailable'));
    if (editing === id) {
      setEditing(null);
      setForm(emptyForm());
    }
  };

  const startEdit = (id) => {
    setEditing(id);
    setCurrentView('entry');
    window.scrollTo(0, 0);
  };

  // Export helpers
  const download = (name, text, type) => {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([text], { type }));
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const flat = (r) => {
    const o = {
      Record_ID: r.id,
      Village_Code: r.villageCode || codeForVillage(r.village),
      Village_Name: r.village,
      Wadi: r.wadi,
      Date: r.date,
      Form_No: r.formNo,
      Taluka: r.taluka,
      District: r.district,
      Respondent: r.respondent,
      Interviewer: r.interviewer,
      Start_Time: r.startTime,
      End_Time: r.endTime,
      Age: r.age,
      Gender: r.gender,
      Language: Array.isArray(r.language) ? r.language.join('; ') : r.language,
    };
    for (const [k, val] of Object.entries(r.data || {})) {
      o[k] = Array.isArray(val) ? (k === 'works' ? JSON.stringify(val) : val.join('; ')) : val;
    }
    return o;
  };

  const exportCSV = () => {
    if (!db.records.length) {
      alert('No entries to export.');
      return;
    }
    const rows = db.records.map(flat);
    const keys = [...new Set(rows.flatMap(Object.keys))];
    const csv =
      '\ufeff' +
      [keys, ...rows.map((r) => keys.map((k) => r[k] ?? ''))]
        .map((row) => row.map((x) => '"' + String(x).replaceAll('"', '""') + '"').join(','))
        .join('\r\n');
    download('FORM0-Village-Profile-' + today() + '.csv', csv, 'text/csv;charset=utf-8');
  };

  const exportJSON = () => {
    download('FORM0-backup-' + today() + '.json', JSON.stringify(db, null, 2), 'application/json');
  };

  const importJSON = async (e) => {
    try {
      const file = e.target.files[0];
      if (!file) return;
      const x = JSON.parse(await file.text());
      if (!Array.isArray(x.records)) throw new Error();
      if (window.confirm(`Import ${x.records.length} FORM 0 records? Matching record IDs will be updated.`)) {
        setDb((prev) => {
          const m = new Map(prev.records.map((r) => [r.id, r]));
          x.records.forEach((r) => m.set(r.id, r));
          return { records: [...m.values()] };
        });
        api.importRecords('form0', x.records)
          .then(() => setSaveState('✓ Imported to API'))
          .catch(() => setSaveState('⚠ Import saved locally; API unavailable'));
      }
    } catch {
      alert('Please select a valid FORM 0 JSON backup.');
    }
    e.target.value = '';
  };

  const deleteAll = () => {
    if (window.confirm('Delete every saved FORM 0 entry? Export JSON first.')) {
      setDb({ records: [] });
      api.clearRecords('form0').catch(() => setSaveState('⚠ Clear pending — API unavailable'));
      setEditing(null);
      setForm(emptyForm());
    }
  };

  const filteredRecords = db.records
    .filter((r) => ((r.villageCode || '') + ' ' + r.village + ' ' + (r.wadi || '') + ' ' + (r.date || '')).toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => b.updated - a.updated);

  const v = (key, fallback = '') => form[key] ?? fallback;

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">
          FORM 0
          <small>
            INCEPTION & VILLAGE PROFILE
            <br />
            वैभववाडी · सिंधुदुर्ग
          </small>
        </div>
        <nav>
          <button className={currentView === 'entry' ? 'on' : ''} onClick={() => setCurrentView('entry')}>
            ✎ नवीन / चालू नोंद
          </button>
          <button className={currentView === 'records' ? 'on' : ''} onClick={() => setCurrentView('records')}>
            ▦ जतन केलेल्या नोंदी
          </button>
          <button className={currentView === 'data' ? 'on' : ''} onClick={() => setCurrentView('data')}>
            ⇩ Export / Backup
          </button>
        </nav>
        <div className="count">
          एकूण Form 0 नोंदी
          <b>{db.records.length}</b>
          प्रत्येक गावासाठी एक अंतिम नोंद
        </div>
      </aside>

      <main className="main">
        <div className="head">
          <div>
            <h1>FORM 0 — INCEPTION & VILLAGE PROFILE</h1>
            <p>प्रारंभ व गावाची मूलभूत माहिती · One per village</p>
          </div>
          <span id="saveState">{saveState}</span>
        </div>

        {/* ENTRY VIEW */}
        {currentView === 'entry' && (
          <section id="entryView">
            <form id="form0" onSubmit={saveRecord}>
              <div className="notice">
                <b>Field instruction:</b> हा फॉर्म प्रत्येक गावासाठी एकदाच, कोणतीही मुलाखत सुरू करण्यापूर्वी पथकप्रमुखाने सरपंच/ग्रामसेवकासोबत भरावा. GP records मधील आकडे वापरावेत; अंदाज लिहू नये.
              </div>

              {/* Form Identification */}
              <div className="card sec">
                <h2>
                  Form Identification <small>फॉर्मची ओळख</small>
                </h2>
                <div className="grid g4">
                  <label className="req">
                    Village Code · गाव संकेतांक
                    <select required name="villageCode" value={v('villageCode')} onChange={(e) => updateField('villageCode', e.target.value)}>
                      <option value="">Select VG Code</option>
                      {Object.entries(villageMap).map(([code, name]) => (
                        <option key={code} value={code}>
                          {code} — {name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="req">
                    Village / GP · गाव
                    <input required readOnly name="village" value={v('village')} placeholder="Code निवडल्यावर नाव आपोआप येईल" />
                  </label>
                  <label>
                    Wadi · वाडी
                    <input name="wadi" value={v('wadi')} onChange={(e) => updateField('wadi', e.target.value)} />
                  </label>
                  <label className="req">
                    Date · दिनांक
                    <input required type="date" name="date" value={v('date')} onChange={(e) => updateField('date', e.target.value)} />
                  </label>
                  <label>
                    Form No. · 0 - ___ of 1
                    <input name="formNo" value={v('formNo')} onChange={(e) => updateField('formNo', e.target.value)} />
                  </label>
                  <label>
                    Taluka · तालुका
                    <input name="taluka" value={v('taluka')} onChange={(e) => updateField('taluka', e.target.value)} />
                  </label>
                  <label>
                    District · जिल्हा
                    <input name="district" value={v('district')} onChange={(e) => updateField('district', e.target.value)} />
                  </label>
                  <label>
                    Respondent name (optional) · नाव
                    <input name="respondent" value={v('respondent')} onChange={(e) => updateField('respondent', e.target.value)} />
                  </label>
                  <label>
                    Interviewer name · मुलाखतकार
                    <input name="interviewer" value={v('interviewer')} onChange={(e) => updateField('interviewer', e.target.value)} />
                  </label>
                  <label>
                    Start time
                    <input type="time" name="startTime" value={v('startTime')} onChange={(e) => updateField('startTime', e.target.value)} />
                  </label>
                  <label>
                    End time
                    <input type="time" name="endTime" value={v('endTime')} onChange={(e) => updateField('endTime', e.target.value)} />
                  </label>
                </div>
                <div className="q">
                  <div className="qt">Age · वय</div>
                  <div className="options">
                    {['18-35', '36-60', '60+'].map((x) => (
                      <label key={x}>
                        <input type="radio" name="age" value={x} checked={v('age') === x} onChange={() => updateField('age', x)} />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="q">
                  <div className="qt">Gender · लिंग</div>
                  <div className="options">
                    {['M', 'F', 'Other'].map((x) => (
                      <label key={x}>
                        <input type="radio" name="gender" value={x} checked={v('gender') === x} onChange={() => updateField('gender', x)} />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="q">
                  <div className="qt">Language used · वापरलेली भाषा</div>
                  <div className="options">
                    {['Marathi', 'Malvani'].map((x) => (
                      <label key={x}>
                        <input type="checkbox" name="language" value={x} checked={(v('language') || []).includes(x)} onChange={() => toggleCheck('language', x)} />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* A0. Visit & Team Details */}
              <div className="card sec">
                <h2>
                  A0. Visit & Team Details <small>भेट व पथक तपशील</small>
                </h2>
                <div className="grid g3">
                  <label>
                    TAI name & institution
                    <input name="tai" value={v('tai')} onChange={(e) => updateField('tai', e.target.value)} />
                  </label>
                  <label>
                    Date of visit
                    <input type="date" name="visitDate" value={v('visitDate')} onChange={(e) => updateField('visitDate', e.target.value)} />
                  </label>
                  <label>
                    Date of DNA report
                    <input type="date" name="reportDate" value={v('reportDate')} onChange={(e) => updateField('reportDate', e.target.value)} />
                  </label>
                  <label>
                    Team Leader - name & designation
                    <input name="teamLeader" value={v('teamLeader')} onChange={(e) => updateField('teamLeader', e.target.value)} />
                  </label>
                  <label>
                    Technical Expert - name & designation
                    <input name="technicalExpert" value={v('technicalExpert')} onChange={(e) => updateField('technicalExpert', e.target.value)} />
                  </label>
                  <label>
                    Technical Expert mobile
                    <input name="technicalMobile" inputMode="tel" value={v('technicalMobile')} onChange={(e) => updateField('technicalMobile', e.target.value)} />
                  </label>
                  <label>
                    Accompanying Govt. officer - name/designation/office
                    <input name="govtOfficer" value={v('govtOfficer')} onChange={(e) => updateField('govtOfficer', e.target.value)} />
                  </label>
                  <label>
                    Govt. officer mobile
                    <input name="govtMobile" inputMode="tel" value={v('govtMobile')} onChange={(e) => updateField('govtMobile', e.target.value)} />
                  </label>
                  <label>
                    Sarpanch - name
                    <input name="sarpanchName" value={v('sarpanchName')} onChange={(e) => updateField('sarpanchName', e.target.value)} />
                  </label>
                  <label>
                    Sarpanch mobile
                    <input name="sarpanchMobile" inputMode="tel" value={v('sarpanchMobile')} onChange={(e) => updateField('sarpanchMobile', e.target.value)} />
                  </label>
                  <label>
                    Gram Sevak - name
                    <input name="gramSevakName" value={v('gramSevakName')} onChange={(e) => updateField('gramSevakName', e.target.value)} />
                  </label>
                  <label>
                    Gram Sevak mobile
                    <input name="gramSevakMobile" inputMode="tel" value={v('gramSevakMobile')} onChange={(e) => updateField('gramSevakMobile', e.target.value)} />
                  </label>
                  <label>
                    Field Coordinator / community facilitator
                    <input name="fieldCoordinator" value={v('fieldCoordinator')} onChange={(e) => updateField('fieldCoordinator', e.target.value)} />
                  </label>
                </div>
              </div>

              {/* A. Basic Profile */}
              <div className="card sec">
                <h2>
                  A. Basic Profile <small>GP records मधून गाव माहिती</small>
                </h2>
                <div className="grid g4">
                  <label>
                    Population · लोकसंख्या
                    <input type="number" min="0" name="population" value={v('population')} onChange={(e) => updateField('population', e.target.value)} />
                  </label>
                  <label>
                    Households · कुटुंबे
                    <input type="number" min="0" name="households" value={v('households')} onChange={(e) => updateField('households', e.target.value)} />
                  </label>
                  <label>
                    No. of wadis / hamlets
                    <input type="number" min="0" name="wadiCount" value={v('wadiCount')} onChange={(e) => updateField('wadiCount', e.target.value)} />
                  </label>
                  <label>
                    Revenue villages
                    <input name="revenueVillages" value={v('revenueVillages')} onChange={(e) => updateField('revenueVillages', e.target.value)} />
                  </label>
                  <label>
                    GP office GPS - latitude
                    <input type="number" step="any" name="latitude" value={v('latitude')} onChange={(e) => updateField('latitude', e.target.value)} />
                  </label>
                  <label>
                    GP office GPS - longitude
                    <input type="number" step="any" name="longitude" value={v('longitude')} onChange={(e) => updateField('longitude', e.target.value)} />
                  </label>
                  <label>
                    Electricity hours/day
                    <input type="number" min="0" max="24" step="0.5" name="electricityHours" value={v('electricityHours')} onChange={(e) => updateField('electricityHours', e.target.value)} />
                  </label>
                  <label>
                    GP annual budget (₹ lakh)
                    <input type="number" min="0" step="0.01" name="annualBudget" value={v('annualBudget')} onChange={(e) => updateField('annualBudget', e.target.value)} />
                  </label>
                  <label>
                    Distance to taluka HQ (km)
                    <input type="number" min="0" step="0.1" name="talukaDistance" value={v('talukaDistance')} onChange={(e) => updateField('talukaDistance', e.target.value)} />
                  </label>
                  <label>
                    ST bus trips/day
                    <input type="number" min="0" name="busTrips" value={v('busTrips')} onChange={(e) => updateField('busTrips', e.target.value)} />
                  </label>
                </div>
                <div className="q">
                  <div className="qt">Population band</div>
                  <div className="options">
                    {['≤2,000', '2,001-5,000', '>5,000'].map((x) => (
                      <label key={x}>
                        <input type="radio" name="populationBand" value={x} checked={v('populationBand') === x} onChange={() => updateField('populationBand', x)} />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="q">
                  <div className="qt">GP type</div>
                  <div className="options">
                    {['General', 'Tribal/PESA', 'Coastal'].map((x) => (
                      <label key={x}>
                        <input type="checkbox" name="gpType" value={x} checked={(v('gpType') || []).includes(x)} onChange={() => toggleCheck('gpType', x)} />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="q">
                  <div className="qt">Mobile signal</div>
                  <div className="options">
                    {['No signal', '2G', '4G', '5G'].map((x) => (
                      <label key={x}>
                        <input type="radio" name="mobileSignal" value={x} checked={v('mobileSignal') === x} onChange={() => updateField('mobileSignal', x)} />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* B. Village Facilities */}
              <div className="card sec">
                <h2>
                  B. Village Facilities <small>8 points · प्रत्येक row मध्ये दोन सुविधा</small>
                </h2>
                <div className="tablewrap">
                  <table>
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Facility A · सुविधा</th>
                        <th>No.</th>
                        <th>Working condition / Remarks</th>
                        <th>Facility B · त्याच row मधील सुविधा</th>
                        <th>Availability</th>
                        <th>Working condition / Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.from({ length: 8 }, (_, i) => {
                        const [enA, mrA] = facilities[i].split('|');
                        const [enB, mrB] = facilities[i + 8].split('|');
                        return (
                          <tr key={i}>
                            <td>{i + 1}</td>
                            <td>
                              <b>{enA}</b>
                              <br />
                              <small>{mrA}</small>
                            </td>
                            <td>
                              <input name={`facility_${i}_number`} value={v(`facility_${i}_number`)} onChange={(e) => updateField(`facility_${i}_number`, e.target.value)} />
                            </td>
                            <td>
                              <input name={`facility_${i}_remarks`} value={v(`facility_${i}_remarks`)} onChange={(e) => updateField(`facility_${i}_remarks`, e.target.value)} />
                            </td>
                            <td>
                              <b>{enB}</b>
                              <br />
                              <small>{mrB}</small>
                            </td>
                            <td>
                              <select name={`facility_${i + 8}_number`} value={v(`facility_${i + 8}_number`)} onChange={(e) => updateField(`facility_${i + 8}_number`, e.target.value)}>
                                <option value="">Select</option>
                                {['Yes', 'No', 'Partial'].map((opt) => (
                                  <option key={opt} value={opt}>
                                    {opt}
                                  </option>
                                ))}
                              </select>
                            </td>
                            <td>
                              <input name={`facility_${i + 8}_remarks`} value={v(`facility_${i + 8}_remarks`)} onChange={(e) => updateField(`facility_${i + 8}_remarks`, e.target.value)} />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* C. Livelihood & Land Pattern */}
              <div className="card sec">
                <h2>
                  C. Livelihood & Land Pattern <small>उपजीविका</small>
                </h2>
                <p className="help">खालील सर्व 11 उपजीविका क्षेत्रांसाठी प्राधान्य निवडणे अनिवार्य आहे. 1-High, 2-Medium किंवा 3-Low निवडा.</p>
                {occupations.map((x, i) => (
                  <div className="occ" key={x}>
                    <label className="req">{x}</label>
                    <select required name={`occupationRank_${i}`} value={v(`occupationRank_${i}`)} onChange={(e) => updateField(`occupationRank_${i}`, e.target.value)}>
                      <option value="">Select priority</option>
                      {['1-High', '2-Medium', '3-Low'].map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
                <div className="q">
                  <div className="qt">2. Families with a member working outside the district for 4+ months/year</div>
                  <div className="options">
                    {['<10', '10-25', '25-50', '50-100', '>100'].map((x) => (
                      <label key={x}>
                        <input type="radio" name="migrationFamilies" value={x} checked={v('migrationFamilies') === x} onChange={() => updateField('migrationFamilies', x)} />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
                <div className="q">
                  <div className="qt">3. Majority landholding pattern</div>
                  <div className="options">
                    {['<1 acre', '1-2.5 acre', '2.5-5 acre', '>5 acre', 'Landless'].map((x) => (
                      <label key={x}>
                        <input type="radio" name="landholding" value={x} checked={v('landholding') === x} onChange={() => updateField('landholding', x)} />
                        {x}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* D. Works Already Sanctioned / Ongoing */}
              <div className="card sec">
                <h2>
                  D. Works Already Sanctioned / Ongoing <small>दुबार प्रस्ताव टाळण्यासाठी</small>
                </h2>
                <p className="help">15th FC, MGNREGA, Jal Jeevan Mission, SBM-G, PMGSY, ZP, CSR किंवा पूर्वीच्या Smart Village grant मधील कामे नोंदवा.</p>
                <div className="tablewrap">
                  <table id="works">
                    <thead>
                      <tr>
                        <th>Scheme / Fund</th>
                        <th>Sanctioned / ongoing work</th>
                        <th>Location / Wadi</th>
                        <th>Status / Remarks</th>
                        <th className="noprint"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {(form.works || []).map((w, i) => (
                        <tr key={i}>
                          <td>
                            <select value={w.scheme || ''} onChange={(e) => updateWork(i, 'scheme', e.target.value)}>
                              <option value=""></option>
                              {schemes.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>
                            <input value={w.name || ''} onChange={(e) => updateWork(i, 'name', e.target.value)} />
                          </td>
                          <td>
                            <input value={w.location || ''} onChange={(e) => updateWork(i, 'location', e.target.value)} />
                          </td>
                          <td>
                            <input value={w.status || ''} onChange={(e) => updateWork(i, 'status', e.target.value)} />
                          </td>
                          <td className="noprint">
                            <button type="button" className="btn sm danger" onClick={() => removeWork(i)}>
                              ×
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <button type="button" className="btn sm noprint" style={{ marginTop: 10 }} onClick={addWork}>
                  + Add sanctioned work
                </button>
              </div>

              {/* E. Inception Confirmations */}
              <div className="card sec">
                <h2>
                  E. Inception Confirmations <small>सरपंच उपस्थितीत पुष्टी</small>
                </h2>
                <div className="options">
                  {[
                    'Explained: ONLY listening to problems - no technology chosen/promised',
                    'Explained: no funding, scheme or money decision promised',
                    'All wadis/hamlets listed and represented',
                    'GP budget and village facilities noted',
                    'Respondents for four groups identified from ALL wadis',
                  ].map((x) => (
                    <label key={x}>
                      <input type="checkbox" name="confirmation" value={x} checked={(v('confirmation') || []).includes(x)} onChange={() => toggleCheck('confirmation', x)} />
                      {x}
                    </label>
                  ))}
                </div>
                <div className="grid g4" style={{ marginTop: 15 }}>
                  <label>
                    Sarpanch / Gram Sevak name
                    <input name="confirmName" value={v('confirmName')} onChange={(e) => updateField('confirmName', e.target.value)} />
                  </label>
                  <label>
                    Mobile
                    <input name="confirmMobile" inputMode="tel" value={v('confirmMobile')} onChange={(e) => updateField('confirmMobile', e.target.value)} />
                  </label>
                  <label>
                    Signature obtained?
                    <select name="signatureObtained" value={v('signatureObtained')} onChange={(e) => updateField('signatureObtained', e.target.value)}>
                      <option value=""></option>
                      <option value="Yes">Yes</option>
                      <option value="No">No</option>
                    </select>
                  </label>
                  <label>
                    Signature date
                    <input type="date" name="signatureDate" value={v('signatureDate')} onChange={(e) => updateField('signatureDate', e.target.value)} />
                  </label>
                </div>
              </div>

              <div className="actions noprint">
                <button className="btn primary" type="submit">
                  {editing ? 'Saved changes' : 'Save FORM 0 entry'}
                </button>
                <button className="btn" type="button" onClick={clearForm}>
                  New / Clear form
                </button>
                <button className="btn" type="button" onClick={printForm}>
                  Print / Save PDF
                </button>
              </div>
            </form>
          </section>
        )}

        {/* RECORDS VIEW */}
        {currentView === 'records' && (
          <section id="recordsView">
            <div className="card sec">
              <h2>Saved FORM 0 Entries ({db.records.length})</h2>
              <div className="noprint">
                <input className="search" type="search" placeholder="Search VG code, village, wadi or date" value={search} onChange={(e) => setSearch(e.target.value)} />
              </div>
              <div id="recordList">
                {filteredRecords.length ? (
                  filteredRecords.map((r) => (
                    <div className="record" key={r.id}>
                      <div>
                        <b>
                          {r.villageCode || codeForVillage(r.village) || '—'} — {r.village}
                        </b>{' '}
                        · {r.taluka}, {r.district}
                        <br />
                        <small>
                          {r.date} · {r.formNo} · Population: {(r.data && r.data.population) || '-'}
                        </small>
                      </div>
                      <div>
                        <button className="btn sm" onClick={() => startEdit(r.id)}>
                          Edit
                        </button>{' '}
                        <button className="btn sm danger" onClick={() => deleteRecord(r.id)}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty">No saved FORM 0 entries.</div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* DATA VIEW */}
        {currentView === 'data' && (
          <section id="dataView">
            <div className="card sec">
              <h2>Export & Backup</h2>
              <div className="notice">
                Excel CSV मध्ये प्रत्येक Form 0 field स्वतंत्र column मध्ये export होतो. Sanctioned works JSON text स्वरूपात एका column मध्ये असतील. पूर्ण restore साठी JSON backup वापरा.
              </div>
              <div className="actions" style={{ position: 'static' }}>
                <button className="btn primary" onClick={exportCSV}>
                  Export Excel-compatible CSV
                </button>
                <button className="btn" onClick={exportJSON}>
                  Export JSON Backup
                </button>
                <button className="btn" onClick={() => jsonFileRef.current && jsonFileRef.current.click()}>
                  Import JSON Backup
                </button>
                <button className="btn danger" onClick={deleteAll}>
                  Delete all entries
                </button>
              </div>
            </div>
            <div className="card sec">
              <h2>Export Summary</h2>
              <p>
                Total records: <b>{db.records.length}</b>
              </p>
              <p>
                Villages:{' '}
                {[...new Set(db.records.map((r) => r.village))].filter(Boolean).join(', ') || 'None'}
              </p>
            </div>
            <input ref={jsonFileRef} type="file" accept="application/json" hidden onChange={importJSON} />
          </section>
        )}
      </main>
    </div>
  );
}

export default Form0;
