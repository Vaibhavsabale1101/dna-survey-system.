import { useState, useEffect } from 'react';
import { genId, villageMap, today, STORE_PREFIX } from '../data/constants';
import { buildTally, mergeBundles } from '../lib/tally';
import { useStore } from '../hooks/useStore';
import { api } from '../api';
import { Card, Field, Notice, Radios, Checks, Actions } from '../components/ui';

const SOURCE_META = [
  { key: 'formA', label: 'Form A — Farmers', countKey: 'farmers' },
  { key: 'formB', label: 'Form B — Women', countKey: 'women' },
  { key: 'formC', label: 'Form C — Frontline', countKey: 'frontline' },
  { key: 'formD', label: 'Form D — Youth', countKey: 'youth' },
  { key: 'formE', label: 'Form E — Village Walk', countKey: 'walk' },
];

const emptyTallyRow = () => ({
  fieldId: '', problem: '', sector: '', farmers: '', women: '', frontline: '', youth: '', walk: '', total: '', pct: '', since: '', loss: '',
});

const emptyTally = () => [];

const emptyRank = () => Array.from({ length: 10 }, (_, i) => ({
  rank: i + 1, problem: '', fieldId: '', severity: '', population: '', recurrence: '', feasibility: '', sustain: '', total: '', benefit: '', techCategory: '',
}));

const emptyNonTech = () => Array.from({ length: 6 }, () => ({
  no: '', fieldId: '', type: '', problem: '', action: '',
}));

const defaultSources = () => ({ formA: true, formB: true, formC: true, formD: true, formE: true });


function hasLocalForm0(villageCode) {
  try {
    const db = JSON.parse(localStorage.getItem('tai-form0-v1'));
    return Array.isArray(db?.records) && db.records.some((r) => String(r.villageCode || '').trim().toUpperCase() === String(villageCode || '').trim().toUpperCase());
  } catch { return false; }
}

function localBundle(villageCode) {
  const forms = {};
  const deleted = {};
  for (const { key } of SOURCE_META) {
    try {
      const cached = JSON.parse(localStorage.getItem(STORE_PREFIX + key));
      forms[key] = (Array.isArray(cached?.records) ? cached.records : []).filter((r) => String(r.villageCode || '').trim().toUpperCase() === String(villageCode || '').trim().toUpperCase());
      const pending = JSON.parse(localStorage.getItem(`${STORE_PREFIX + key}-pending-deletes`));
      deleted[key] = Array.isArray(pending) ? pending : [];
    } catch {
      forms[key] = [];
      deleted[key] = [];
    }
  }
  return {
    villageCode,
    forms,
    deleted,
    counts: Object.fromEntries(Object.entries(forms).map(([key, rows]) => [key, rows.length])),
  };
}


export default function FormF({ session, setSession }) {
  const { db, saveRecord, deleteRecord, saveState } = useStore('formF');
  const [editing, setEditing] = useState(null);
  const [view, setView] = useState('entry');
  const [fetchState, setFetchState] = useState('');
  const [sourceCounts, setSourceCounts] = useState({ formA: 0, formB: 0, formC: 0, formD: 0, formE: 0 });
  const [form, setForm] = useState({
    villageCode: session.villageCode || '',
    village: session.village || '',
    date: session.date || today(),
    farmersOf: '', womenOf: '', frontlineOf: '', youthOf: '', totalOf: '',
    importSources: defaultSources(),
    importMode: 'keep',
    lastImportedAt: '',
    tally: emptyTally(),
    mandateSectors: '', mandateProblems: '', mandateWadis: '', mandateWomen: '',
    mandateSectorsMet: '', mandateProblemsMet: '', mandateWadisMet: '', mandateWomenMet: '',
    ranked: emptyRank(),
    nonTech: emptyNonTech(),
    confirms: [],
    teamLeader: '',
    tlDate: today(),
  });

  useEffect(() => {
    if (editing) {
      const rec = db.records.find((x) => x.id === editing);
      if (rec) {
        setForm((p) => ({
          ...p,
          ...rec.data,
          importSources: { ...defaultSources(), ...(rec.data?.importSources || {}) },
          villageCode: rec.villageCode,
          village: rec.village,
          date: rec.date,
        }));
      }
    }
  }, [editing, db.records]);

  const setRow = (key, i, field, v) => {
    setForm((p) => {
      const arr = p[key].map((r, idx) => (idx === i ? { ...r, [field]: v } : r));
      return { ...p, [key]: arr };
    });
  };

  const toggleSource = (key) => {
    setForm((p) => ({
      ...p,
      importSources: { ...p.importSources, [key]: !p.importSources?.[key] },
    }));
  };

  const fetchAndCompile = async () => {
    if (!form.villageCode) {
      alert('Select village code first.');
      return;
    }
    try {
      const status = await api.villageStatus(form.villageCode);
      if (!status.form0Ready && !hasLocalForm0(form.villageCode)) {
        alert('Form 0 is compulsory. Save Form 0 for this village before compiling Form F.');
        return;
      }
    } catch {
      if (!hasLocalForm0(form.villageCode)) {
        alert('Form 0 is not available in the local cache and the API cannot be reached. Save Form 0 first.');
        return;
      }
    }
    const selected = { ...defaultSources(), ...(form.importSources || {}) };
    if (!Object.values(selected).some(Boolean)) {
      alert('Select at least one source form (A–E).');
      return;
    }

    setFetchState('Fetching survey records…');
    const local = localBundle(form.villageCode);
    let bundle;
    let source = 'API + local cache';
    try {
      const remote = await api.villageBundle(form.villageCode);
      bundle = mergeBundles(remote, local, form.villageCode);
    } catch {
      bundle = local;
      source = 'local cache (API unavailable)';
    }

    const counts = {
      formA: bundle.forms?.formA?.length || 0,
      formB: bundle.forms?.formB?.length || 0,
      formC: bundle.forms?.formC?.length || 0,
      formD: bundle.forms?.formD?.length || 0,
      formE: bundle.forms?.formE?.length || 0,
    };
    setSourceCounts(counts);

    const tally = buildTally(bundle, selected, form.importMode);
    const selectedABCD = ['formA', 'formB', 'formC', 'formD'].filter((key) => selected[key]);
    const respondentTotal = selectedABCD.reduce((sum, key) => sum + counts[key], 0);
    const importedAt = new Date().toISOString();

    setForm((p) => ({
      ...p,
      farmersOf: selected.formA ? String(counts.formA) : '0',
      womenOf: selected.formB ? String(counts.formB) : '0',
      frontlineOf: selected.formC ? String(counts.formC) : '0',
      youthOf: selected.formD ? String(counts.formD) : '0',
      totalOf: String(respondentTotal),
      tally: tally.length ? tally : emptyTally(),
      lastImportedAt: importedAt,
    }));

    const selectedCounts = SOURCE_META
      .filter((src) => selected[src.key])
      .map((src) => `${src.label.split(' — ')[0]}: ${counts[src.key]}`)
      .join(' | ');
    setFetchState(`✓ Loaded from ${source} (${selectedCounts || 'none selected'}) at ${new Date(importedAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.villageCode) { alert('Select village'); return; }
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
    alert(result?.ok ? 'Form F saved to API.' : 'Form F saved locally. API unavailable; it will sync when the API reconnects.');
    setView('records');
  };

  const resetForm = () => {
    setEditing(null);
    setSourceCounts({ formA: 0, formB: 0, formC: 0, formD: 0, formE: 0 });
    setFetchState('');
    setForm({
      villageCode: session.villageCode || '', village: session.village || '', date: today(),
      farmersOf: '', womenOf: '', frontlineOf: '', youthOf: '', totalOf: '',
      importSources: defaultSources(), importMode: 'keep', lastImportedAt: '', tally: emptyTally(),
      mandateSectors: '', mandateProblems: '', mandateWadis: '', mandateWomen: '', mandateSectorsMet: '', mandateProblemsMet: '', mandateWadisMet: '', mandateWomenMet: '',
      ranked: emptyRank(), nonTech: emptyNonTech(), confirms: [], teamLeader: '', tlDate: today(),
    });
  };

  return (
    <div>
      <div className="head">
        <div>
          <h1>FORM F — COMPILATION, SCREENING & PRIORITY SCORING</h1>
          <p>One per village · Team Leader with whole team · same evening · converts forms into DNA report</p>
        </div>
        <span id="saveState">{saveState}</span>
      </div>
      <div className="noprint" style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
        <button className={'btn sm' + (view === 'entry' ? ' primary' : '')} type="button" onClick={() => setView('entry')}>Entry</button>
        <button className={'btn sm' + (view === 'records' ? ' primary' : '')} type="button" onClick={() => setView('records')}>Saved ({db.records.length})</button>
      </div>
      {view === 'entry' && (
        <form onSubmit={handleSave}>
          <Card title="Village">
            <div className="grid g4">
              <Field label="Village Code" required>
                <select required value={form.villageCode} onChange={(e) => {
                  const c = e.target.value;
                  setForm((p) => ({ ...p, villageCode: c, village: villageMap[c] || '', tally: emptyTally(), lastImportedAt: '' }));
                  setSourceCounts({ formA: 0, formB: 0, formC: 0, formD: 0, formE: 0 });
                  setFetchState('');
                  setSession((s) => ({ ...s, villageCode: c, village: villageMap[c] || '' }));
                }}>
                  <option value="">Select</option>
                  {Object.entries(villageMap).map(([c, n]) => <option key={c} value={c}>{c} — {n}</option>)}
                </select>
              </Field>
              <Field label="Village"><input readOnly value={form.village} /></Field>
              <Field label="Date"><input type="date" value={form.date} onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))} /></Field>
              <Field label="Total respondent forms"><input readOnly value={form.totalOf || ''} /></Field>
            </div>
            <div className="grid g4" style={{ marginTop: 8 }}>
              <Field label="Farmers (of __)"><input readOnly value={form.farmersOf} /></Field>
              <Field label="Women (of __)"><input readOnly value={form.womenOf} /></Field>
              <Field label="Frontline (of __)"><input readOnly value={form.frontlineOf} /></Field>
              <Field label="Youth (of __)"><input readOnly value={form.youthOf} /></Field>
            </div>
          </Card>

          <Card title="AUTOMATIC SOURCE COMPILATION" sub="Select source forms → fetch saved village records → merge identical P-codes automatically">
            <Notice>
              Form F counts each P-code at most once per respondent form/slip. Identical P-codes from different forms are merged into one tally row. Total = A+B+C+D reports. % = Total ÷ selected A–D respondent forms. Form E appears as Walk = Yes/No.
            </Notice>
            <div className="source-picker">
              {SOURCE_META.map((src) => (
                <label className="source-option" key={src.key}>
                  <input
                    type="checkbox"
                    checked={form.importSources?.[src.key] ?? true}
                    onChange={() => toggleSource(src.key)}
                  />
                  <span>{src.label}</span>
                  <b>{sourceCounts[src.key] || 0}</b>
                </label>
              ))}
            </div>
            <div className="grid g2" style={{ marginTop: 12 }}>
              <Field label="Import screening rule">
                <select value={form.importMode || 'keep'} onChange={(e) => setForm((p) => ({ ...p, importMode: e.target.value }))}>
                  <option value="keep">KEEP problems only (recommended)</option>
                  <option value="all">All coded problems (KEEP + DROP)</option>
                </select>
              </Field>
              <Field label="Last automation run">
                <input readOnly value={form.lastImportedAt ? new Date(form.lastImportedAt).toLocaleString('en-IN') : 'Not fetched yet'} />
              </Field>
            </div>
            <div className="noprint" style={{ marginTop: 12, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <button className="btn primary" type="button" onClick={fetchAndCompile}>Fetch & Build STEP 1 Tally</button>
              <span className="help"><b>{fetchState}</b></span>
            </div>
          </Card>

          <Card title="STEP 1 — TALLY" sub="Automatically merged by P-code · editable only for final verification/corrections">
            <Notice>Rows are created dynamically from the selected Forms A–E. Re-run “Fetch & Build STEP 1 Tally” whenever additional survey forms are saved.</Notice>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Field ID</th><th>Problem (own words)</th><th>Sector</th>
                    <th>Farmers</th><th>Women</th><th>Frontline</th><th>Youth</th>
                    <th>Walk?</th><th>Total</th><th>%</th><th>Since when</th><th>Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {form.tally.length === 0 ? (
                    <tr><td colSpan="12" className="empty">No tally rows yet. Select source forms and click “Fetch & Build STEP 1 Tally”.</td></tr>
                  ) : form.tally.map((r, i) => (
                    <tr key={`${r.fieldId || 'blank'}-${i}`}>
                      {['fieldId','problem','sector','farmers','women','frontline','youth','walk','total','pct','since','loss'].map((k) => (
                        <td key={k}>
                          <input
                            value={r[k] ?? ''}
                            readOnly={['problem','farmers','women','frontline','youth','walk','total','pct'].includes(k) && !!r.fieldId}
                            onChange={(e) => setRow('tally', i, k, e.target.value)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" className="btn sm" style={{ marginTop: 8 }} onClick={() => setForm((p) => ({ ...p, tally: [...p.tally, ...Array.from({ length: 4 }, emptyTallyRow)] }))}>+ Add manual rows</button>
          </Card>

          <Card title="STEP 2–3 — SCREEN & MANDATE CHECK">
            <Notice>KEEP if 2+ of LONG / OFTEN / MANY / REAL LOSS. NEEDS TECH if monitoring/data/manual delay/automation. Else → Admin/Civil/Behaviour → Part 5.</Notice>
            <div className="grid g2">
              <Field label="Distinct tech sectors (≥4)"><input value={form.mandateSectors} onChange={(e) => setForm((p) => ({ ...p, mandateSectors: e.target.value }))} /></Field>
              <Radios name="mandateSectorsMet" options={['Sectors met — Yes','No']} value={form.mandateSectorsMet} onChange={(v) => setForm((p) => ({ ...p, mandateSectorsMet: v }))} />
              <Field label="Tech problems (≥6)"><input value={form.mandateProblems} onChange={(e) => setForm((p) => ({ ...p, mandateProblems: e.target.value }))} /></Field>
              <Radios name="mandateProblemsMet" options={['Problems met — Yes','No']} value={form.mandateProblemsMet} onChange={(v) => setForm((p) => ({ ...p, mandateProblemsMet: v }))} />
              <Field label="Wadis represented"><input value={form.mandateWadis} onChange={(e) => setForm((p) => ({ ...p, mandateWadis: e.target.value }))} /></Field>
              <Radios name="mandateWadisMet" options={['Wadis met — Yes','No']} value={form.mandateWadisMet} onChange={(v) => setForm((p) => ({ ...p, mandateWadisMet: v }))} />
              <Field label="Women ≥40%"><input value={form.mandateWomen} onChange={(e) => setForm((p) => ({ ...p, mandateWomen: e.target.value }))} /></Field>
              <Radios name="mandateWomenMet" options={['Women met — Yes','No']} value={form.mandateWomenMet} onChange={(v) => setForm((p) => ({ ...p, mandateWomenMet: v }))} />
            </div>
          </Card>

          <Card title="STEP 4–5 — PRIORITY SCORING (1–5 each · total /25)" sub="Rank descending → DNA Part 4">
            <Notice>Severity · Population · Recurrence · Feasibility · Sustainability. Tech CATEGORY = function only, NO brand.</Notice>
            <div className="tablewrap">
              <table>
                <thead>
                  <tr>
                    <th>Rank</th><th>Kept problem</th><th>Field ID + Sector</th>
                    <th>Sev</th><th>Pop</th><th>Rec</th><th>Feas</th><th>Sust</th><th>Total</th>
                    <th>Benefit model</th><th>Tech CATEGORY</th>
                  </tr>
                </thead>
                <tbody>
                  {form.ranked.map((r, i) => (
                    <tr key={i}>
                      <td>{r.rank}</td>
                      {['problem','fieldId','severity','population','recurrence','feasibility','sustain','total','benefit','techCategory'].map((k) => (
                        <td key={k}><input value={r[k]} onChange={(e) => setRow('ranked', i, k, e.target.value)} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="STEP 6 — PROBLEMS THAT DO NOT NEED TECHNOLOGY" sub="DNA Part 5">
            <div className="tablewrap">
              <table>
                <thead>
                  <tr><th>No.</th><th>Field ID</th><th>Type</th><th>Problem (not tech)</th><th>What instead (scheme / dept / civil / behaviour)</th></tr>
                </thead>
                <tbody>
                  {form.nonTech.map((r, i) => (
                    <tr key={i}>
                      {['no','fieldId','type','problem','action'].map((k) => (
                        <td key={k}><input value={r[k]} onChange={(e) => setRow('nonTech', i, k, e.target.value)} placeholder={k==='type'?'Civil/Infra/Behaviour/Admin':''} /></td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          <Card title="STEP 7 — BEFORE LEAVING THE VILLAGE">
            <Checks name="confirms" options={[
              'All in-depth forms (A-D), Form S slips and walk sheet collected, numbered and complete',
              'Every problem in Part 4 can be traced to a Field ID and at least one named form',
              'No vendor / company contacted; no brand, product or price mentioned',
              'No funding, sanction or scheme approval promised',
              'Minimum 15 geo-tagged photographs taken and named with Field IDs',
              'Sarpanch / Gram Sevak acknowledgement & GP seal on DNA Part 6',
              'Problems already sanctioned (Form 0-D) excluded from Part 4',
            ]} value={form.confirms} onChange={(v) => setForm((p) => ({ ...p, confirms: v }))} />
            <div className="grid g2" style={{ marginTop: 12 }}>
              <Field label="Team Leader"><input value={form.teamLeader} onChange={(e) => setForm((p) => ({ ...p, teamLeader: e.target.value }))} /></Field>
              <Field label="Signature & date"><input type="date" value={form.tlDate} onChange={(e) => setForm((p) => ({ ...p, tlDate: e.target.value }))} /></Field>
            </div>
            <p className="help">DNA to be submitted to the District Level Committee within 7 days.</p>
          </Card>

          <Actions onSave={handleSave} onClear={resetForm} editing={editing} />
        </form>
      )}
      {view === 'records' && (
        <Card title={`Saved Form F (${db.records.length})`}>
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
