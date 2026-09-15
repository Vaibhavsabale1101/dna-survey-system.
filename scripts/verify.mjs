import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildTally } from '../src/lib/tally.js';

const tmp = await mkdtemp(join(tmpdir(), 'dna-api-'));
const port = 18787;
const child = spawn(process.execPath, ['server/server.mjs'], {
  cwd: fileURLToPath(new URL('..', import.meta.url)),
  env: { ...process.env, API_PORT: String(port), DNA_DATA_FILE: join(tmp, 'data.json') },
  stdio: ['ignore','pipe','pipe'],
});
const base = `http://127.0.0.1:${port}/api`;
const sleep = ms => new Promise(r=>setTimeout(r,ms));
for (let i=0;i<40;i++) {
  try { const r=await fetch(`${base}/health`); if(r.ok) break; } catch {}
  await sleep(50);
  if(i===39) throw new Error('API did not start');
}

const put = async (form,id,record) => {
  const r=await fetch(`${base}/forms/${form}/${id}`,{method:'PUT',headers:{'content-type':'application/json'},body:JSON.stringify(record)});
  if(!r.ok) throw new Error(await r.text());
};
const mk = (id,code,keep='Keep') => ({id,villageCode:'VG1',village:'मांगवली',updated:Date.now(),data:{
  ownWords:[{problem:'x',since:'2 years',loss:'₹1000',sector:'A'}],
  taiUse:[{fieldId:code,problem:'',long:true,often:true,many:false,realLoss:false,keep,tech:'Tech'}]
}});
await put('form0','z0',{id:'z0',villageCode:'VG1',village:'मांगवली',updated:Date.now(),data:{occupationRank_0:'1-High'}});
await put('formA','a1',mk('a1','P06'));
await put('formA','a2',mk('a2','P06'));
await put('formB','b1',mk('b1','P23'));
await put('formC','c1',mk('c1','P01','Drop'));
await put('formE','e1',{id:'e1',villageCode:'VG1',village:'मांगवली',updated:Date.now(),data:{stops:[{fieldId:'P06',see:'visible damage'}]}});
const bundleRes=await fetch(`${base}/villages/VG1/bundle`);
const bundle=await bundleRes.json();
if(bundle.counts.formA!==2 || bundle.counts.formB!==1 || bundle.counts.formE!==1) throw new Error('Bundle counts failed');
const tally=buildTally(bundle,{formA:true,formB:true,formC:true,formD:true,formE:true},'keep');
const p06=tally.find(x=>x.fieldId==='P06');
const p23=tally.find(x=>x.fieldId==='P23');
if(!p06 || p06.farmers!=='2' || p06.walk!=='Yes' || p06.total!=='2') throw new Error('P06 tally failed');
if(!p23 || p23.women!=='1') throw new Error('P23 tally failed');
if(tally.some(x=>x.fieldId==='P01')) throw new Error('DROP problem leaked into KEEP tally');
const status=await (await fetch(`${base}/villages/VG1/status`)).json();
if(!status.form0Ready) throw new Error('Form0 status failed');
console.log('VERIFY PASS: API save/retrieve, village status, KEEP filtering, P-code merge, stakeholder counts, and Form-E walk evidence.');
child.kill('SIGTERM');
await rm(tmp,{recursive:true,force:true});
