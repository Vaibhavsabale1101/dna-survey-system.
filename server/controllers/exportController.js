import ExcelJS from 'exceljs';
import { pool } from '../config/db.js';
import { FORM_LABELS, FORM_KEYS, FORM_VERSION, definitionsForRecord, pathGet, answerToText } from '../lib/formDefinitions.js';
import { ensureAnswerStorage } from '../lib/answerStore.js';

function excelValue(v) {
  const text = answerToText(v);
  return text === '' ? 'NOT ANSWERED' : text;
}

function safeSheetName(name) { return String(name).replace(/[\\/?*\[\]:]/g,'_').slice(0,31); }
function filenameSafe(s){return String(s).replace(/[^A-Za-z0-9_-]+/g,'_');}

function mergeDefinitions(formKey, records) {
  const out=[]; const seen=new Set();
  const source = records.length ? records : [{data:{}}];
  for (const r of source) {
    for (const d of definitionsForRecord(formKey, r.data || {})) {
      if (seen.has(d.path)) continue;
      seen.add(d.path); out.push(d);
    }
  }
  return out;
}

async function fetchRecords(formKey, village) {
  const params=[formKey]; let where='WHERE form_key = ?';
  if(village){where+=' AND village_code = ?';params.push(village);}
  const [rows]=await pool.query(`SELECT id, form_key, village_code, village_name, wadi, interviewer, respondent, survey_date, form_no, data_json, created_at, updated_at FROM survey_records ${where} ORDER BY village_code, survey_date, created_at`,params);
  return rows.map(row=>{
    let data=row.data_json;
    if(typeof data==='string'){try{data=JSON.parse(data)}catch{data={}}}
    if(!data||typeof data!=='object')data={};
    const normalized={...data,
      villageCode:row.village_code,
      village:row.village_name||data.village||'',
      wadi:row.wadi||data.wadi||'',
      date:row.survey_date ? new Date(row.survey_date).toISOString().slice(0,10) : (data.date||''),
      formNo:row.form_no||data.formNo||'',
      respondent:row.respondent||data.respondent||'',
      interviewer:row.interviewer||data.interviewer||''
    };
    if(row.form_key==='formB') delete normalized.gender;
    return {id:row.id,formKey:row.form_key,villageCode:row.village_code,village:normalized.village,data:normalized,createdAt:row.created_at,updatedAt:row.updated_at};
  });
}

function styleWorksheet(ws, freeze=1) {
  ws.views=[{state:'frozen',ySplit:freeze}];
  if (ws.columnCount) ws.autoFilter={from:{row:1,column:1},to:{row:1,column:ws.columnCount}};
  const header=ws.getRow(1);
  header.font={bold:true,color:{argb:'FFFFFFFF'}};
  header.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FF1F4E78'}};
  header.alignment={vertical:'middle',wrapText:true}; header.height=42;
  ws.columns.forEach(c=>{
    const vals=(c.values||[]).slice(1,50).map(v=>String(v??'').length);
    const max=Math.max(String(c.header||'').length,...vals,12);
    c.width=Math.min(Math.max(12,max*0.85),45);
  });
  ws.eachRow((row,ri)=>{if(ri>1){row.alignment={vertical:'top',wrapText:true};if(ri%2===0)row.fill={type:'pattern',pattern:'solid',fgColor:{argb:'FFF7FAFC'}};}});
}

function addMetadataSheet(wb, {formKey='ALL', village='', screening='all', recordCount=0}={}) {
  const ws=wb.addWorksheet(safeSheetName('Export_Metadata'));
  ws.columns=[{header:'Property',key:'p'},{header:'Value',key:'v'}];
  [
    ['Survey system','DNA Forms — Government Polytechnic Kolhapur'],
    ['Questionnaire version',FORM_VERSION],
    ['Export generated',new Date().toISOString()],
    ['Form',formKey==='ALL'?'All Forms':FORM_LABELS[formKey]],
    ['Village filter',village||'All Villages'],
    ['Screening filter',screening],
    ['Record count',recordCount],
    ['Blank-answer rule','Blank survey answers are exported as NOT ANSWERED; values are never silently omitted.'],
    ['Storage rule','Original JSON + normalized field-by-field survey_answers storage'],
  ].forEach(([p,v])=>ws.addRow({p,v}));
  styleWorksheet(ws);
}

function addWideSheet(wb, formKey, records, sheetName) {
  const defs=mergeDefinitions(formKey,records);
  const ws=wb.addWorksheet(safeSheetName(sheetName));
  ws.columns=[
    {header:'Record ID',key:'id'}, {header:'Questionnaire Version',key:'version'},
    {header:'Village Code',key:'vc'}, {header:'Village',key:'v'},
    {header:'Mapped Fields',key:'mapped'}, {header:'Unmapped Fields',key:'unmapped'},
    {header:'Answered Fields',key:'answered'}, {header:'Not Answered Fields',key:'blank'}, {header:'Completeness %',key:'pct'},
    ...defs.map((d,i)=>({header:`${d.no} | ${d.question}`,key:`q${i}`}))
  ];
  for(const r of records){
    const values=defs.map(d=>excelValue(pathGet(r.data,d.path)));
    const mappedDefs=defs.filter(d=>d.mapped!==false);
    const answered=mappedDefs.filter(d=>excelValue(pathGet(r.data,d.path))!=='NOT ANSWERED').length;
    const blanks=mappedDefs.length-answered;
    const row={id:r.id,version:FORM_VERSION,vc:r.villageCode,v:r.village,mapped:mappedDefs.length,unmapped:defs.length-mappedDefs.length,answered,blank:blanks,pct:mappedDefs.length?Number((answered*100/mappedDefs.length).toFixed(1)):100};
    defs.forEach((d,i)=>{row[`q${i}`]=values[i];});
    ws.addRow(row);
  }
  styleWorksheet(ws);
  return ws;
}

function addQASheet(wb, formKey, records, sheetName='Question_Answer') {
  const ws=wb.addWorksheet(safeSheetName(sheetName));
  ws.columns=[
    {header:'Record ID',key:'id'},{header:'Village Code',key:'vc'},{header:'Village',key:'v'},{header:'Form',key:'f'},
    {header:'Section',key:'sec'},{header:'Question No.',key:'n'},{header:'Question',key:'q'},{header:'Field Path',key:'p'},
    {header:'Selected / Entered Answer',key:'a'},{header:'Answer Status',key:'s'},{header:'Mapping Status',key:'m'}
  ];
  for(const r of records){
    const defs=definitionsForRecord(formKey,r.data||{});
    for(const d of defs){
      const value=excelValue(pathGet(r.data,d.path));
      ws.addRow({id:r.id,vc:r.villageCode,v:r.village,f:FORM_LABELS[formKey],sec:d.section||'',n:d.no,q:d.question,p:d.path,a:value,s:value==='NOT ANSWERED'?'NOT ANSWERED':'ANSWERED',m:d.mapped===false?'UNMAPPED':'MAPPED'});
    }
  }
  styleWorksheet(ws); return ws;
}

async function addStoredAnswersSheet(wb, formKey, village, sheetName='Stored_Answers') {
  await ensureAnswerStorage(pool);
  const params=[formKey]; let where='WHERE a.form_key=?';
  if(village){where+=' AND a.village_code=?';params.push(village);}
  const [rows]=await pool.query(`SELECT a.record_id,a.village_code,s.village_name,a.form_version,a.display_order,a.section_name,a.question_no,a.question_text,a.field_path,a.answer_value,a.answer_status,a.is_mapped,a.updated_at
    FROM survey_answers a JOIN survey_records s ON s.id=a.record_id ${where}
    ORDER BY a.village_code,a.record_id,a.display_order,a.id`, params);
  const ws=wb.addWorksheet(safeSheetName(sheetName));
  ws.columns=[
    {header:'Record ID',key:'id'},{header:'Village Code',key:'vc'},{header:'Village',key:'v'},{header:'Form Version',key:'fv'},
    {header:'Section',key:'sec'},{header:'Question No.',key:'n'},{header:'Question',key:'q'},{header:'Stored Field Path',key:'p'},
    {header:'Stored Answer',key:'a'},{header:'Answer Status',key:'s'},{header:'Mapping Status',key:'m'},{header:'Last Updated',key:'u'}
  ];
  rows.forEach(r=>ws.addRow({id:r.record_id,vc:r.village_code,v:r.village_name,fv:r.form_version,sec:r.section_name||'',n:r.question_no||'',q:r.question_text||'',p:r.field_path,a:r.answer_status==='NOT_ANSWERED'?'NOT ANSWERED':(r.answer_value||'NOT ANSWERED'),s:r.answer_status,m:r.is_mapped?'MAPPED':'UNMAPPED',u:r.updated_at}));
  styleWorksheet(ws); return ws;
}

function addDataQualitySheet(wb, formKey, records, sheetName='Data_Quality') {
  const ws=wb.addWorksheet(safeSheetName(sheetName));
  ws.columns=[
    {header:'Record ID',key:'id'},{header:'Village Code',key:'vc'},{header:'Village',key:'v'},
    {header:'Mapped Questions',key:'t'},{header:'Answered',key:'a'},{header:'Not Answered',key:'b'},{header:'Completeness %',key:'pct'},
    {header:'Unmapped Stored Fields',key:'u'},{header:'Missing Question Nos.',key:'m'},{header:'Quality Flag',key:'flag'}
  ];
  for(const r of records){
    const defs=definitionsForRecord(formKey,r.data||{}); const mapped=defs.filter(d=>d.mapped!==false); const unmapped=defs.filter(d=>d.mapped===false);
    const missing=mapped.filter(d=>excelValue(pathGet(r.data,d.path))==='NOT ANSWERED'); const answered=mapped.length-missing.length;
    ws.addRow({id:r.id,vc:r.villageCode,v:r.village,t:mapped.length,a:answered,b:missing.length,pct:mapped.length?Number((answered*100/mapped.length).toFixed(1)):100,u:unmapped.length,m:missing.map(d=>d.no).join(', ')||'None',flag:unmapped.length?'CHECK UNMAPPED FIELDS':(missing.length?'INCOMPLETE':'COMPLETE')});
  }
  styleWorksheet(ws); return ws;
}

async function addTaiSheet(wb, formKey, village, screening='all', sheetName='TAI_Screening') {
  if(!['formA','formB','formC','formD'].includes(formKey)) return;
  const params=[formKey]; let where='WHERE t.form_key=?';
  if(village){where+=' AND t.village_code=?';params.push(village);}
  if(screening==='keep'||screening==='drop'){where+=' AND t.keep_drop=?';params.push(screening==='keep'?'Keep':'Drop');}
  const [rows]=await pool.query(`SELECT t.record_id,t.village_code,s.village_name,s.respondent,t.p_code,p.problem_en,p.problem_mr,t.long_term,t.often,t.many,t.real_loss,t.keep_drop,t.tech_type FROM tai_screenings t JOIN survey_records s ON s.id=t.record_id LEFT JOIN problem_catalog p ON p.code=t.p_code ${where} ORDER BY t.village_code,t.record_id,t.id`,params);
  const ws=wb.addWorksheet(safeSheetName(sheetName));
  ws.columns=['Record ID','Village Code','Village','Respondent','P-Code','Mapped Problem (English)','Mapped Problem (Marathi)','Long >1yr','Often','Many','Real loss','KEEP/DROP','TECH/Admin'].map((h,i)=>({header:h,key:`c${i}`}));
  rows.forEach(r=>ws.addRow(Object.fromEntries([r.record_id,r.village_code,r.village_name,r.respondent,r.p_code,r.problem_en,r.problem_mr,r.long_term?'Yes':'No',r.often?'Yes':'No',r.many?'Yes':'No',r.real_loss?'Yes':'No',r.keep_drop,r.tech_type].map((v,i)=>[`c${i}`,v??'NOT ANSWERED']))));
  styleWorksheet(ws);
}

async function addMasterSheets(wb) {
  const [problems]=await pool.query('SELECT code, problem_en, problem_mr FROM problem_catalog ORDER BY code');
  const ps=wb.addWorksheet('Problem_Master'); ps.columns=[{header:'P-Code',key:'c'},{header:'Problem (English)',key:'e'},{header:'Problem (Marathi)',key:'m'}]; problems.forEach(p=>ps.addRow({c:p.code,e:p.problem_en,m:p.problem_mr})); styleWorksheet(ps);
  const [villages]=await pool.query('SELECT village_code,village_name,taluka,district,state FROM villages ORDER BY CAST(SUBSTRING(village_code,3) AS UNSIGNED)');
  const vs=wb.addWorksheet('Villages'); vs.columns=[{header:'Village Code',key:'c'},{header:'Village Name',key:'n'},{header:'Taluka',key:'t'},{header:'District',key:'d'},{header:'State',key:'s'}]; villages.forEach(v=>vs.addRow({c:v.village_code,n:v.village_name,t:v.taluka,d:v.district,s:v.state})); styleWorksheet(vs);
}

export async function exportForm(req,res,next){
  try {
    const formKey=req.params.formKey; if(!FORM_KEYS.includes(formKey)) return res.status(400).json({error:'Invalid form key'});
    const village=String(req.query.village||'').trim().toUpperCase(); const screening=String(req.query.screening||'all').toLowerCase();
    const records=await fetchRecords(formKey,village); const wb=new ExcelJS.Workbook(); wb.creator='DNA Forms'; wb.created=new Date();
    addMetadataSheet(wb,{formKey,village,screening,recordCount:records.length});
    addWideSheet(wb,formKey,records,'Responses'); addQASheet(wb,formKey,records); addDataQualitySheet(wb,formKey,records); await addStoredAnswersSheet(wb,formKey,village); await addTaiSheet(wb,formKey,village,screening); await addMasterSheets(wb);
    const name=`DNA_${filenameSafe(formKey)}_${village||'ALL'}_${new Date().toISOString().slice(0,10)}.xlsx`;
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); res.setHeader('Content-Disposition',`attachment; filename="${name}"`); await wb.xlsx.write(res); res.end();
  } catch(err){next(err);}
}

export async function exportAll(req,res,next){
  try {
    const village=String(req.query.village||'').trim().toUpperCase(); const wb=new ExcelJS.Workbook(); wb.creator='DNA Forms'; wb.created=new Date();
    let total=0; const cache={};
    for(const fk of FORM_KEYS){cache[fk]=await fetchRecords(fk,village);total+=cache[fk].length;}
    addMetadataSheet(wb,{formKey:'ALL',village,recordCount:total});
    for(const fk of FORM_KEYS){
      const tag=fk.replace('form','F'); const records=cache[fk];
      addWideSheet(wb,fk,records,`${tag}_Responses`); addQASheet(wb,fk,records,`${tag}_Question_Answer`); addDataQualitySheet(wb,fk,records,`${tag}_Data_Quality`); await addStoredAnswersSheet(wb,fk,village,`${tag}_Stored_Answers`); await addTaiSheet(wb,fk,village,'all',`${tag}_TAI_Screening`);
    }
    await addMasterSheets(wb);
    const name=`DNA_Complete_Survey_${village||'ALL'}_${new Date().toISOString().slice(0,10)}.xlsx`;
    res.setHeader('Content-Type','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'); res.setHeader('Content-Disposition',`attachment; filename="${name}"`); await wb.xlsx.write(res); res.end();
  } catch(err){next(err);}
}
