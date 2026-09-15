import { useState, useEffect } from 'react';
import { genId, villageMap, today, PROBLEM_CODES, PROBLEM_BY_CODE } from '../data/constants';
import { useStore } from '../hooks/useStore';
import { api } from '../api';
import { Card, Field, Notice, Actions } from '../components/ui';


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

const STOPS = [
  { id: 'E1', place: 'Water source — well / borewell / intake', look: 'Pump running? leak? level? guard? meter?' },
  { id: 'E2', place: 'Pump house & overhead tank (ESR)', look: 'Motor condition, panel, leak at tank base, level indicator, chlorination unit' },
  { id: 'E3', place: 'Public stand-post / tap', look: 'Tap running waste? pressure? queue? water colour in a glass' },
  { id: 'E4', place: 'Tail-end wadi household tap', look: 'Does water actually reach? timing? pressure?' },
  { id: 'E5', place: 'ZP school', look: 'Digital device working? attendance register last entry? toilet, water, compound wall' },
  { id: 'E6', place: 'Anganwadi centre', look: 'Scale working? growth chart plotted? meal cooking? building condition' },
  { id: 'E7', place: 'Sub-centre / health post', look: 'Staff present? medicine stock? vaccine fridge & temp log? delivery kit' },
  { id: 'E8', place: 'Gram Panchayat office', look: 'Computer, internet speed test (write Mbps), registers, notice board, grievance register' },
  { id: 'E9', place: 'Waste dumping point / drain', look: 'Bins? segregation? open dumping? drain choked? overflow marks' },
  { id: 'E10', place: 'Internal road & wadi approach road', look: 'Surface, mud patches, culvert, landslide-prone stretch' },
  { id: 'E11', place: 'Street light stretch (walk after 7 pm if possible)', look: 'How many poles dead? school lane / bus stop dark?' },
  { id: 'E12', place: 'Farm / orchard plot', look: 'Irrigation method, water pooling, pest damage visible on leaves-fruit, fencing' },
  { id: 'E13', place: 'Dairy / milk collection / gaushala', look: 'Collection time, testing, fodder stock, animal condition' },
  { id: 'E14', place: 'Weekly market / shop / godown', look: 'Storage, grading, price display, transport' },
  { id: 'E15', place: 'Mobile signal test — 3 points', look: 'Write operator + bars + speed at GP, at school, at farthest wadi' },
  { id: 'E16', place: 'River / ghat / flood or landslide spot', look: 'Erosion, bridge, crossing used by children, past flood mark' },
];

function emptyStops() {
  return STOPS.map((s) => ({ ...s, see: '', photo: '', gps: '', fieldId: '' }));
}

export default function FormE({ session, setSession }) {
  const { db, saveRecord, deleteRecord, saveState } = useStore('formE');
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('entry');
  const [form, setForm] = useState({
    villageCode: session.villageCode || '',
    village: session.village || '',
    date: session.date || today(),
    walkStart: '',
    walkEnd: '',
    teamMembers: '',
    stops: emptyStops(),
    otherPlace: '',
    otherSee: '',
  });

  useEffect(() => {
    if (editing) {
      const rec = db.records.find((x) => x.id === editing);
      if (rec) setForm({ ...rec.data, villageCode: rec.villageCode, village: rec.village, date: rec.date });
    }
  }, [editing, db.records]);

  const setStop = (i, k, v) => {
    setForm((p) => {
      const stops = p.stops.map((s, idx) => (idx === i ? { ...s, [k]: v } : s));
      return { ...p, stops };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.villageCode) {
      alert('Select village code');
      return;
    }
    if (!(await form0Ready(form.villageCode))) {
      alert('Form 0 is compulsory. Save Form 0 for this village before saving Form E.');
      return;
    }
    const rec = {
      id: editing || genId(),
      villageCode: form.villageCode,
      village: villageMap[form.villageCode],
      date: form.date,
      data: form,
      updated: Date.now(),
    };
    const result = await saveRecord(rec);
    if (result?.source === 'rejected') { alert(`Not saved: ${result.error || 'Server validation failed.'}`); return; }
    setEditing(rec.id);
    alert(result?.ok ? 'Form E saved to API.' : 'Form E saved locally. API unavailable; it will sync when the API reconnects.');
    setView('records');
  };

  return (
    <div>
      <div className="head">
        <div>
          <h1>FORM E — VILLAGE WALK OBSERVATION SHEET</h1>
          <p>One per village · whole team walks with Gram Sevak · write ONLY what you SEE · geo-tagged photo at every stop</p>
        </div>
        <span id="saveState">{saveState}</span>
      </div>
      <div className="noprint" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button className={'btn sm' + (view === 'entry' ? ' primary' : '')} type="button" onClick={() => setView('entry')}>Entry</button>
        <button className={'btn sm' + (view === 'records' ? ' primary' : '')} type="button" onClick={() => setView('records')}>Saved ({db.records.length})</button>
      </div>
      {view === 'entry' && (
        <form onSubmit={handleSave}>
          <Notice><b>Rule:</b> Observation carries same weight as what people said. If walk CONTRADICTS an FGD statement, write both — the contradiction itself is a finding.</Notice>
          <Card title="Walk header">
            <div className="grid g4">
              <Field label="Village Code" required>
                <select required value={form.villageCode} onChange={(e) => {
                  const c = e.target.value;
                  setForm((p) => ({ ...p, villageCode: c, village: villageMap[c] || '' }));
                  setSession((s) => ({ ...s, villageCode: c, village: villageMap[c] || '' }));
                }}>
                  <option value="">Select</option>
                  {Object.entries(villageMap).map(([c, n]) => <option key={c} value={c}>{c} — {n}</option>)}
                </select>
              </Field>
              <Field label="Village"><input readOnly value={form.village} /></Field>
              <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></Field>
              <Field label="Walk start"><input type="time" value={form.walkStart} onChange={(e) => setForm((p) => ({ ...p, walkStart: e.target.value }))} /></Field>
              <Field label="Walk end"><input type="time" value={form.walkEnd} onChange={(e) => setForm((p) => ({ ...p, walkEnd: e.target.value }))} /></Field>
              <Field label="Team members present"><input value={form.teamMembers} onChange={(e) => setForm((p) => ({ ...p, teamMembers: e.target.value }))} /></Field>
            </div>
          </Card>
          <Card title="Observation stops E1–E16">
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Stop</th>
                    <th>Place</th>
                    <th>What to look for</th>
                    <th>WHAT YOU ACTUALLY SEE</th>
                    <th>Photo file no.</th>
                    <th>GPS</th>
                    <th>Field ID</th>
                  </tr>
                </thead>
                <tbody>
                  {form.stops.map((s, i) => (
                    <tr key={s.id}>
                      <td>{s.id}</td>
                      <td><b>{s.place}</b></td>
                      <td><small>{s.look}</small></td>
                      <td><input value={s.see} onChange={(e) => setStop(i, 'see', e.target.value)} placeholder="write, do not tick" /></td>
                      <td><input value={s.photo} onChange={(e) => setStop(i, 'photo', e.target.value)} /></td>
                      <td><input value={s.gps} onChange={(e) => setStop(i, 'gps', e.target.value)} /></td>
                      <td>
                        <select value={s.fieldId || ''} onChange={(e) => setStop(i, 'fieldId', e.target.value)} title={PROBLEM_BY_CODE[s.fieldId]?.problem || ''}>
                          <option value="">Select P-code</option>
                          {PROBLEM_CODES.map((item) => <option key={item.code} value={item.code}>{item.code} — {item.problem}</option>)}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="grid g2" style={{ marginTop: 12 }}>
              <Field label="E__ any other place"><input value={form.otherPlace} onChange={(e) => setForm((p) => ({ ...p, otherPlace: e.target.value }))} /></Field>
              <Field label="What you see"><input value={form.otherSee} onChange={(e) => setForm((p) => ({ ...p, otherSee: e.target.value }))} /></Field>
            </div>
          </Card>
          <Actions onSave={handleSave} onClear={() => { setEditing(null); setForm({ villageCode: session.villageCode||'', village: session.village||'', date: today(), walkStart:'', walkEnd:'', teamMembers:'', stops: emptyStops(), otherPlace:'', otherSee:'' }); }} editing={editing} />
        </form>
      )}
      {view === 'records' && (
        <Card title={`Saved Form E (${db.records.length})`}>
          {db.records.length === 0 ? <div className="empty">No entries</div> : db.records.map((r) => (
            <div className="record" key={r.id}>
              <div><b>{r.villageCode} — {r.village}</b><br /><small>{r.date}</small></div>
              <div>
                <button className="btn sm" type="button" onClick={() => { setEditing(r.id); setView('entry'); }}>Edit</button>{' '}
                <button className="btn sm danger" type="button" onClick={() => { if (confirm('Delete?')) deleteRecord(r.id); }}>Delete</button>
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
