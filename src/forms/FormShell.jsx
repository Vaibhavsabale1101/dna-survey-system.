import { useState, useEffect } from 'react';
import { genId, villageMap, READ_ALOUD, today, PROBLEM_BY_CODE } from '../data/constants';
import { useStore } from '../hooks/useStore';
import { CommonHeader, OwnWords, TaiUseOnly, Actions, Notice, Card } from '../components/ui';
import { api } from '../api';


function hasLocalForm0(villageCode) {
  try {
    const db = JSON.parse(localStorage.getItem('tai-form0-v1'));
    return Array.isArray(db?.records) && db.records.some((r) => String(r.villageCode || '').trim().toUpperCase() === String(villageCode || '').trim().toUpperCase());
  } catch { return false; }
}

async function form0Ready(villageCode) {
  try { const s = await api.villageStatus(villageCode); return !!s.form0Ready || hasLocalForm0(villageCode); }
  catch { return hasLocalForm0(villageCode); }
}

/** Generic in-depth form shell: common header + custom body + own words + TAI use */
export default function FormShell({
  formKey,
  formLetter,
  title,
  copiesNote,
  session,
  setSession,
  children,
  emptyData,
}) {
  const { db, saveRecord, deleteRecord, saveState } = useStore(formKey);
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('entry'); // entry | records
  const [search, setSearch] = useState('');

  const baseEmpty = () => ({
    villageCode: session.villageCode || '',
    village: session.village || '',
    wadi: session.wadi || '',
    date: session.date || today(),
    formNo: `${formLetter}- of 5`,
    taluka: session.taluka || 'Vaibhavwadi',
    district: session.district || 'Sindhudurg',
    respondent: '',
    interviewer: session.interviewer || '',
    startTime: '',
    endTime: '',
    age: '',
    gender: '',
    language: [],
    ownWords: [
      { problem: '', since: '', often: '', loss: '', sector: '' },
      { problem: '', since: '', often: '', loss: '', sector: '' },
      { problem: '', since: '', often: '', loss: '', sector: '' },
    ],
    oneProblem: '',
    taiUse: [
      { fieldId: '', problem: '', long: false, often: false, many: false, realLoss: false, keep: '', tech: '' },
      { fieldId: '', problem: '', long: false, often: false, many: false, realLoss: false, keep: '', tech: '' },
      { fieldId: '', problem: '', long: false, often: false, many: false, realLoss: false, keep: '', tech: '' },
    ],
    interviewerSig: '',
    tlCheck: '',
    ...(typeof emptyData === 'function' ? emptyData() : emptyData || {}),
  });

  const [form, setForm] = useState(baseEmpty);

  useEffect(() => {
    if (editing) {
      const rec = db.records.find((x) => x.id === editing);
      if (rec) setForm({ ...baseEmpty(), ...rec.data, ...rec });
    } else {
      setForm(baseEmpty());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editing]);

  // sync session when village changes
  useEffect(() => {
    if (form.villageCode) {
      setSession((s) => ({
        ...s,
        villageCode: form.villageCode,
        village: villageMap[form.villageCode] || form.village,
        wadi: form.wadi || s.wadi,
        date: form.date || s.date,
        interviewer: form.interviewer || s.interviewer,
        taluka: form.taluka || s.taluka,
        district: form.district || s.district,
      }));
    }
  }, [form.villageCode, form.village, form.wadi, form.date, form.interviewer, form.taluka, form.district, setSession]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.villageCode || !villageMap[form.villageCode]) {
      alert('Please select a valid Village Code.');
      return;
    }
    if (!(await form0Ready(form.villageCode))) {
      alert('Form 0 is compulsory. Save Form 0 for this village before saving Forms A–D.');
      return;
    }
    // Canonicalize the TAI screening rows before persistence so API/local records
    // always contain the P-code mapping and the rule-derived KEEP/DROP result.
    const taiUse = (form.taiUse || []).map((row) => {
      const match = PROBLEM_BY_CODE[row.fieldId];
      const checked = ['long', 'often', 'many', 'realLoss'].filter((key) => !!row[key]).length;
      return {
        ...row,
        problem: match?.problem || '',
        keep: row.fieldId ? (checked >= 2 ? 'Keep' : 'Drop') : '',
      };
    });
    const normalizedForm = { ...form, taiUse };
    if (formKey === 'formB') delete normalizedForm.gender;

    const rec = {
      id: editing || genId(),
      villageCode: form.villageCode,
      village: villageMap[form.villageCode],
      wadi: form.wadi,
      date: form.date,
      formNo: form.formNo,
      taluka: form.taluka,
      district: form.district,
      respondent: form.respondent,
      interviewer: form.interviewer,
      age: form.age,
      ...(formKey === 'formB' ? {} : { gender: form.gender }),
      language: form.language,
      data: normalizedForm,
      updated: Date.now(),
    };
    const result = await saveRecord(rec);
    if (result?.source === 'rejected') {
      alert(`Not saved: ${result.error || 'Server validation failed.'}`);
      return;
    }
    setForm(normalizedForm);
    setEditing(rec.id);
    alert(result?.ok ? `${formLetter} entry saved to API.` : `${formLetter} entry saved locally. API unavailable; it will sync when the API reconnects.`);
    setView('records');
  };

  const clear = () => {
    setEditing(null);
    setForm(baseEmpty());
    window.scrollTo(0, 0);
  };

  const filtered = db.records
    .filter((r) =>
      ((r.villageCode || '') + ' ' + r.village + ' ' + (r.wadi || '') + ' ' + (r.date || ''))
        .toLowerCase()
        .includes(search.toLowerCase())
    )
    .sort((a, b) => b.updated - a.updated);

  return (
    <div>
      <div className="head">
        <div>
          <h1>{title}</h1>
          <p>{copiesNote}</p>
        </div>
        <span id="saveState">{saveState}</span>
      </div>

      <div className="noprint" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button className={'btn sm' + (view === 'entry' ? ' primary' : '')} type="button" onClick={() => setView('entry')}>
          Entry
        </button>
        <button className={'btn sm' + (view === 'records' ? ' primary' : '')} type="button" onClick={() => setView('records')}>
          Saved ({db.records.length})
        </button>
      </div>

      {view === 'entry' && (
        <form onSubmit={handleSave}>
          <Notice>
            <b>Read aloud:</b> {READ_ALOUD}
          </Notice>
          <CommonHeader form={form} set={setForm} session={session} formNoLabel={`Form No. · ${formLetter} - ___ of 5`} hideGender={formKey === 'formB'} />
          {typeof children === 'function' ? children(form, setForm) : children}
          <OwnWords form={form} set={setForm} />
          <TaiUseOnly form={form} set={setForm} />
          <Actions onSave={handleSave} onClear={clear} editing={editing} />
        </form>
      )}

      {view === 'records' && (
        <Card title={`Saved ${formLetter} entries (${db.records.length})`}>
          <input
            className="search"
            type="search"
            placeholder="Search village / wadi / date"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {filtered.length === 0 ? (
            <div className="empty">No saved entries.</div>
          ) : (
            filtered.map((r) => (
              <div className="record" key={r.id}>
                <div>
                  <b>
                    {r.villageCode} — {r.village}
                  </b>{' '}
                  · {r.formNo}
                  <br />
                  <small>
                    {r.date} · {r.respondent || '—'} · {r.age} {r.gender}
                  </small>
                </div>
                <div>
                  <button
                    className="btn sm"
                    type="button"
                    onClick={() => {
                      setEditing(r.id);
                      setView('entry');
                    }}
                  >
                    Edit
                  </button>{' '}
                  <button
                    className="btn sm danger"
                    type="button"
                    onClick={() => {
                      if (confirm('Delete?')) {
                        deleteRecord(r.id);
                        if (editing === r.id) clear();
                      }
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </Card>
      )}
    </div>
  );
}
