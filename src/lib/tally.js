import { PROBLEM_BY_CODE } from '../data/constants.js';

export function normalizePCode(value) {
  const code = String(value || '').trim().toUpperCase();
  return PROBLEM_BY_CODE[code] ? code : '';
}

export function compactValues(values) {
  const unique = [...new Set((values || []).map((v) => String(v || '').trim()).filter(Boolean))];
  if (unique.length <= 3) return unique.join(' | ');
  return `${unique.slice(0, 3).join(' | ')} | +${unique.length - 3} more`;
}

export function mergeBundles(remoteBundle, local, villageCode, sourceKeys = ['formA','formB','formC','formD','formE']) {
  const code = String(villageCode || '').trim().toUpperCase();
  const forms = {};
  for (const key of sourceKeys) {
    const deleted = new Set(local?.deleted?.[key] || []);
    const byId = new Map();
    for (const rec of remoteBundle?.forms?.[key] || []) if (rec?.id && !deleted.has(rec.id)) byId.set(rec.id, rec);
    for (const rec of local?.forms?.[key] || []) {
      if (!rec?.id || deleted.has(rec.id)) continue;
      const prior = byId.get(rec.id);
      if (!prior || Number(rec.updated || 0) > Number(prior.updated || 0)) byId.set(rec.id, rec);
    }
    forms[key] = [...byId.values()].filter((r) => String(r.villageCode || '').trim().toUpperCase() === code);
  }
  return { villageCode: code, forms, counts: Object.fromEntries(Object.entries(forms).map(([k,v]) => [k,v.length])) };
}

export function buildTally(bundle, selectedSources, mode = 'keep') {
  const rows = new Map();
  const denominator = ['formA','formB','formC','formD']
    .filter((key) => selectedSources[key])
    .reduce((sum,key) => sum + (bundle.forms?.[key]?.length || 0), 0);

  const ensure = (code) => {
    if (!rows.has(code)) rows.set(code, {
      fieldId: code,
      problem: PROBLEM_BY_CODE[code]?.problem || '',
      sector: '', farmers:0, women:0, frontline:0, youth:0, walk:'', total:0, pct:'',
      since:[], loss:[], sectors:[], tech:[], evidence:0,
    });
    return rows.get(code);
  };

  for (const [formKey,targetKey] of [['formA','farmers'],['formB','women'],['formC','frontline'],['formD','youth']]) {
    if (!selectedSources[formKey]) continue;
    for (const rec of bundle.forms?.[formKey] || []) {
      const data=rec.data || rec;
      const taiRows=Array.isArray(data.taiUse)?data.taiUse:[];
      const ownRows=Array.isArray(data.ownWords)?data.ownWords:[];
      const seen=new Set();
      taiRows.forEach((tai,index) => {
        const code=normalizePCode(tai?.fieldId);
        if (!code) return;
        const keep=String(tai?.keep || '').trim().toLowerCase();
        if (mode==='keep' && keep!=='keep') return;
        if (seen.has(code)) return;
        seen.add(code);
        const row=ensure(code); row[targetKey]+=1; row.evidence+=1;
        const own=ownRows[index] || {};
        if (own.since) row.since.push(own.since);
        if (own.loss) row.loss.push(own.loss);
        if (own.sector) row.sectors.push(own.sector);
        if (tai.tech) row.tech.push(tai.tech);
      });
    }
  }

  if (selectedSources.formE) {
    for (const rec of bundle.forms?.formE || []) {
      const data=rec.data || rec; const seen=new Set();
      for (const stop of Array.isArray(data.stops)?data.stops:[]) {
        const code=normalizePCode(stop?.fieldId);
        if (!code || seen.has(code)) continue;
        seen.add(code); const row=ensure(code); row.walk='Yes'; row.evidence+=1;
        if (stop?.see) row.loss.push(`Walk: ${stop.see}`);
      }
    }
  }

  return [...rows.values()].map(row => {
    const total=row.farmers+row.women+row.frontline+row.youth;
    const techCount=row.tech.filter(v=>String(v).toLowerCase()==='tech').length;
    const adminCount=row.tech.filter(v=>String(v).toLowerCase()==='admin').length;
    return {
      fieldId:row.fieldId, problem:row.problem, sector:compactValues(row.sectors),
      farmers:String(row.farmers), women:String(row.women), frontline:String(row.frontline), youth:String(row.youth),
      walk:row.walk||'No', total:String(total), pct:denominator?`${((total/denominator)*100).toFixed(1)}%`:'',
      since:compactValues(row.since), loss:compactValues(row.loss),
      classification: techCount===adminCount ? (techCount ? 'Mixed' : '') : (techCount>adminCount?'Tech':'Admin'),
      evidence:String(row.evidence),
    };
  }).sort((a,b)=>Number(b.total)-Number(a.total)||a.fieldId.localeCompare(b.fieldId));
}
