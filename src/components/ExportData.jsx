import { useState } from 'react';
import { villageMap } from '../data/constants';
import { downloadExcel } from '../api';
import { Card, Field, Notice } from './ui';

const formOptions = [
  ['form0', 'Form 0 — Inception & Village Profile'],
  ['formA', 'Form A — Farmers'],
  ['formB', 'Form B — Women & SHG'],
  ['formC', 'Form C — Frontline Workers'],
  ['formD', 'Form D — Youth (18–35)'],
  ['formE', 'Form E — Village Walk Observation'],
  ['formF', 'Form F — Compilation & Priority Scoring'],
];

export default function ExportData({ session }) {
  const [formKey, setFormKey] = useState('form0');
  const [village, setVillage] = useState(session?.villageCode || '');
  const [screening, setScreening] = useState('all');
  const [busy, setBusy] = useState('');
  const [status, setStatus] = useState('');

  const formSupportsScreening = ['formA', 'formB', 'formC', 'formD'].includes(formKey);

  const run = async (all = false) => {
    try {
      setStatus('');
      setBusy(all ? 'all' : 'form');
      const qs = new URLSearchParams();
      if (village) qs.set('village', village);
      if (!all && formSupportsScreening && screening !== 'all') qs.set('screening', screening);
      const path = all ? `/export/all?${qs}` : `/export/${formKey}?${qs}`;
      const filename = await downloadExcel(path);
      setStatus(`✓ Export ready: ${filename}`);
    } catch (err) {
      setStatus(`Export error: ${err.message}`);
    } finally {
      setBusy('');
    }
  };

  return (
    <div>
      <div className="head">
        <div>
          <h1>Excel Export · एक्सेल निर्यात</h1>
          <p>Database-driven, form-wise export with complete question numbers, question text and selected/entered answers.</p>
        </div>
      </div>

      <Notice>
        <b>Smart export:</b> Every stored field is exported. Each form export contains a <b>Responses</b> sheet (one survey record per row) and a <b>Question_Answer</b> sheet (one question-answer pair per row). Forms A–D also include a dedicated <b>TAI_Screening</b> sheet. Problem and village masters are included for analysis.
      </Notice>

      <Card title="Export filters" sub="फॉर्म व गाव निवडा">
        <div className="grid g3">
          <Field label="Form">
            <select value={formKey} onChange={(e) => setFormKey(e.target.value)}>
              {formOptions.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
            </select>
          </Field>
          <Field label="Village">
            <select value={village} onChange={(e) => setVillage(e.target.value)}>
              <option value="">All 21 villages</option>
              {Object.entries(villageMap).map(([code, name]) => <option key={code} value={code}>{code} — {name}</option>)}
            </select>
          </Field>
          <Field label="TAI screening rows">
            <select value={screening} disabled={!formSupportsScreening} onChange={(e) => setScreening(e.target.value)}>
              <option value="all">All (KEEP + DROP)</option>
              <option value="keep">KEEP only</option>
              <option value="drop">DROP only</option>
            </select>
          </Field>
        </div>

        <div className="actions" style={{ marginTop: 16 }}>
          <button className="btn primary" type="button" disabled={!!busy} onClick={() => run(false)}>
            {busy === 'form' ? 'Generating…' : 'Export selected form (.xlsx)'}
          </button>
          <button className="btn" type="button" disabled={!!busy} onClick={() => run(true)}>
            {busy === 'all' ? 'Generating complete workbook…' : 'Export complete survey workbook'}
          </button>
        </div>
        {status && <div className={status.startsWith('✓') ? 'notice' : 'notice error'} style={{ marginTop: 12 }}>{status}</div>}
      </Card>

      <Card title="Workbook design">
        <div className="grid g2">
          <div><b>Responses</b><br /><small>One respondent/village record per row. Headers are “Question No. + Question Text”; cells contain the selected/entered answer.</small></div>
          <div><b>Question_Answer</b><br /><small>Normalized analysis sheet: Record ID, Village, Question No., Question, Selected/Entered Answer.</small></div>
          <div><b>TAI_Screening (A–D)</b><br /><small>P-code, mapped English/Marathi problem, four screening criteria, automatic KEEP/DROP and TECH/Admin.</small></div>
          <div><b>Complete Survey Workbook</b><br /><small>Separate Form_0 to Form_F sheets plus Problem_Master and Villages.</small></div>
        </div>
      </Card>
    </div>
  );
}
