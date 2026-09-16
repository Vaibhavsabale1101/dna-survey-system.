import { villageMap, PROBLEM_CODES, PROBLEM_BY_CODE } from '../data/constants';

export function Card({ title, sub, children }) {
  return (
    <div className="card sec">
      <h2>
        {title} {sub && <small>{sub}</small>}
      </h2>
      {children}
    </div>
  );
}

export function Notice({ children }) {
  return <div className="notice">{children}</div>;
}

export function Field({ label, required, children }) {
  return (
    <label className="field">
      <span>
        {label} {required && <b style={{ color: '#e53e3e' }}>*</b>}
      </span>
      {children}
    </label>
  );
}

export function Radios({ label, required, name, options, value, onChange }) {
  return (
    <div className="field">
      <span>
        {label} {required && <b style={{ color: '#e53e3e' }}>*</b>}
      </span>
      <div className="radios">
        {options.map((opt) => {
          const v = typeof opt === 'string' ? opt : opt.value;
          const l = typeof opt === 'string' ? opt : opt.label;
          return (
            <label key={v}>
              <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
              {l}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function Checks({ label, options, value, values, onChange }) {
  // All existing forms pass checkbox selections through the `value` prop.
  // Keep `values` as a backwards-compatible alias, but always normalize to an array.
  const selected = Array.isArray(value) ? value : (Array.isArray(values) ? values : []);
  const toggle = (v) => {
    const next = selected.includes(v)
      ? selected.filter((x) => x !== v)
      : [...selected, v];
    onChange?.(next);
  };
  return (
    <div className="field">
      <span>{label}</span>
      <div className="radios">
        {options.map((opt) => {
          const v = typeof opt === 'string' ? opt : opt.value;
          const l = typeof opt === 'string' ? opt : opt.label;
          return (
            <label key={v}>
              <input type="checkbox" value={v} checked={selected.includes(v)} onChange={() => toggle(v)} />
              {l}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export function Q({ title, children }) {
  return (
    <div className="q">
      <div className="qt">{title}</div>
      {children}
    </div>
  );
}

export function CommonHeader({ form, set, session, formNoLabel, hideGender = false }) {
  const setF = (k, v) => set((p) => ({ ...p, [k]: v }));
  return (
    <Card title="Form Identification" sub="फॉर्मची ओळख">
      <div className="grid g4">
        <Field label="Village Code · गाव संकेतांक" required>
          <select
            required
            value={form.villageCode || session.villageCode || ''}
            onChange={(e) => {
              const code = e.target.value;
              setF('villageCode', code);
              setF('village', villageMap[code] || '');
            }}
          >
            <option value="">Select VG Code</option>
            {Object.entries(villageMap).map(([c, n]) => (
              <option key={c} value={c}>
                {c} — {n}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Village / GP · गाव" required>
          <input readOnly value={form.village || session.village || ''} placeholder="Code निवडल्यावर नाव येईल" />
        </Field>
        <Field label="Wadi · वाडी">
          <input value={form.wadi ?? session.wadi ?? ''} onChange={(e) => setF('wadi', e.target.value)} />
        </Field>
        <Field label="Date · दिनांक" required>
          <input type="date" required value={form.date || session.date || ''} onChange={(e) => setF('date', e.target.value)} />
        </Field>
        <Field label={formNoLabel || 'Form No.'}>
          <input value={form.formNo || ''} onChange={(e) => setF('formNo', e.target.value)} />
        </Field>
        <Field label="Taluka · तालुका">
          <input value={form.taluka || session.taluka || 'Vaibhavwadi'} onChange={(e) => setF('taluka', e.target.value)} />
        </Field>
        <Field label="District · जिल्हा">
          <input value={form.district || session.district || 'Sindhudurg'} onChange={(e) => setF('district', e.target.value)} />
        </Field>
        <Field label="Respondent name (optional) · नाव">
          <input value={form.respondent || ''} onChange={(e) => setF('respondent', e.target.value)} />
        </Field>
        <Field label="Interviewer name · मुलाखतकार">
          <input value={form.interviewer || ''} onChange={(e) => setF('interviewer', e.target.value)} />
        </Field>
        <Field label="Start time">
          <input type="time" value={form.startTime || ''} onChange={(e) => setF('startTime', e.target.value)} />
        </Field>
        <Field label="End time">
          <input type="time" value={form.endTime || ''} onChange={(e) => setF('endTime', e.target.value)} />
        </Field>
      </div>
      <Q title="Age · वय">
        <Radios name="age" options={['18-35', '36-60', '60+']} value={form.age || ''} onChange={(v) => setF('age', v)} />
      </Q>
      {!hideGender && (
        <Q title="Gender · लिंग">
          <Radios name="gender" options={['M', 'F', 'Other']} value={form.gender || ''} onChange={(v) => setF('gender', v)} />
        </Q>
      )}
      <Q title="Language used · वापरलेली भाषा">
        <Checks name="language" options={['Marathi', 'Malvani']} value={form.language || []} onChange={(v) => setF('language', v)} />
      </Q>
    </Card>
  );
}

export function OwnWords({ form, set }) {
  const rows = form.ownWords || [
    { problem: '', since: '', often: '', loss: '', sector: '' },
    { problem: '', since: '', often: '', loss: '', sector: '' },
    { problem: '', since: '', often: '', loss: '', sector: '' },
  ];
  const update = (i, k, v) => {
    const next = rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r));
    set((p) => ({ ...p, ownWords: next }));
  };
  return (
    <Card title="IN THEIR OWN WORDS — top 3 problems" sub="तयांच्याच शब्दांत ३ मुख्य अडचणी">
      <p className="help">Do not paraphrase. Write verbatim (Marathi / Malvani).</p>
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Problem (own words)</th>
              <th>Since when?</th>
              <th>How often?</th>
              <th>Loss (time/money/health)</th>
              <th>Sector</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <input value={r.problem} onChange={(e) => update(i, 'problem', e.target.value)} />
                </td>
                <td>
                  <input value={r.since} onChange={(e) => update(i, 'since', e.target.value)} />
                </td>
                <td>
                  <input value={r.often} onChange={(e) => update(i, 'often', e.target.value)} />
                </td>
                <td>
                  <input value={r.loss} onChange={(e) => update(i, 'loss', e.target.value)} />
                </td>
                <td>
                  <input value={r.sector} onChange={(e) => update(i, 'sector', e.target.value)} placeholder="A/W/H/E..." />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Q title="Q. If only ONE problem could be solved this year, which one?">
        <input value={form.oneProblem || ''} onChange={(e) => set((p) => ({ ...p, oneProblem: e.target.value }))} style={{ width: '100%' }} />
      </Q>
    </Card>
  );
}

export function TaiUseOnly({ form, set }) {
  const rows = form.taiUse || [];

  const screeningResult = (row) => {
    if (!row.fieldId) return '';
    const checked = ['long', 'often', 'many', 'realLoss'].filter((key) => !!row[key]).length;
    return checked >= 2 ? 'Keep' : 'Drop';
  };

  const update = (i, k, v) => {
    const next = rows.map((r, idx) => {
      if (idx !== i) return r;
      let changed = { ...r, [k]: v };

      // Changing Field ID automatically resolves the corresponding short problem.
      if (k === 'fieldId') {
        const match = PROBLEM_BY_CODE[v];
        changed = {
          ...changed,
          problem: match?.problem || '',
        };
      }

      // KEEP/DROP is derived, never manually entered.
      changed.keep = screeningResult(changed);
      return changed;
    });
    set((p) => ({ ...p, taiUse: next }));
  };
  return (
    <Card title="FOR TAI USE ONLY" sub="fill after interview — do not ask respondent">
      <div className="tablewrap">
        <table>
          <thead>
            <tr>
              <th>Field ID</th>
              <th>Problem (short)</th>
              <th>Long &gt;1yr</th>
              <th>Often</th>
              <th>Many</th>
              <th>Real loss</th>
              <th>KEEP?</th>
              <th>Needs TECH / Admin</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>
                  <select value={r.fieldId || ''} onChange={(e) => update(i, 'fieldId', e.target.value)}>
                    <option value="">Select P-code</option>
                    {PROBLEM_CODES.map((item) => (
                      <option key={item.code} value={item.code}>{item.code}</option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    value={PROBLEM_BY_CODE[r.fieldId]?.problem || r.problem || ''}
                    readOnly
                    aria-label="Problem short (auto-filled from Field ID)"
                    title={PROBLEM_BY_CODE[r.fieldId]?.marathi || ''}
                  />
                </td>
                {['long', 'often', 'many', 'realLoss'].map((k) => (
                  <td key={k}>
                    <input type="checkbox" checked={!!r[k]} onChange={(e) => update(i, k, e.target.checked)} />
                  </td>
                ))}
                <td>
                  <input
                    value={screeningResult(r)}
                    readOnly
                    className={screeningResult(r) === 'Keep' ? 'screening-keep' : screeningResult(r) === 'Drop' ? 'screening-drop' : ''}
                    aria-label="Automatic KEEP or DROP result"
                  />
                </td>
                <td>
                  <select value={r.tech || ''} onChange={(e) => update(i, 'tech', e.target.value)}>
                    <option value=""></option>
                    <option value="Tech">Tech</option>
                    <option value="Admin">Admin</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <Field label="Signature of interviewer">
          <input value={form.interviewerSig || ''} onChange={(e) => set((p) => ({ ...p, interviewerSig: e.target.value }))} />
        </Field>
        <Field label="Checked by Team Leader">
          <input value={form.tlCheck || ''} onChange={(e) => set((p) => ({ ...p, tlCheck: e.target.value }))} />
        </Field>
      </div>
    </Card>
  );
}

export function Actions({ onSave, onClear, editing }) {
  return (
    <div className="actions noprint">
      <button className="btn primary" type="submit">
        {editing ? 'Save changes' : 'Save entry'}
      </button>
      <button className="btn" type="button" onClick={onClear}>
        New / Clear
      </button>
      <button className="btn" type="button" onClick={() => window.print()}>
        Print / PDF
      </button>
    </div>
  );
}
