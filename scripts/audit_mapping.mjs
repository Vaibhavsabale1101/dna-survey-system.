import { definitionsForRecord } from '../server/lib/formDefinitions.js';

const templates = {
  form0: { works: Array.from({length:3},()=>({scheme:'',name:'',location:'',status:''})), ...Object.fromEntries(Array.from({length:11},(_,i)=>[`occupationRank_${i}`,'1-High'])) },
  formA: {}, formB: {}, formC: {}, formD: {},
  formE: { stops: Array.from({length:16},(_,i)=>({id:`E${i+1}`,place:'',look:'',see:'',photo:'',gps:'',fieldId:''})) },
  formF: { importSources:{formA:true,formB:true,formC:true,formD:true,formE:true}, tally:[{fieldId:'',problem:'',sector:'',farmers:'',women:'',frontline:'',youth:'',walk:'',total:'',pct:'',since:'',loss:''}], ranked:Array.from({length:10},(_,i)=>({rank:i+1,problem:'',fieldId:'',severity:'',population:'',recurrence:'',feasibility:'',sustain:'',total:'',benefit:'',techCategory:''})), nonTech:Array.from({length:6},()=>({no:'',fieldId:'',type:'',problem:'',action:''})) },
};
let failed=false;
for (const [formKey,data] of Object.entries(templates)) {
  const defs=definitionsForRecord(formKey,data);
  const unmapped=defs.filter(d=>d.mapped===false);
  const duplicatePaths=defs.filter((d,i,a)=>a.findIndex(x=>x.path===d.path)!==i);
  console.log(`${formKey}: ${defs.length} mapped definitions; unmapped=${unmapped.length}; duplicatePaths=${duplicatePaths.length}`);
  if(unmapped.length||duplicatePaths.length){failed=true; console.log(unmapped,duplicatePaths);}
}
if(failed) process.exit(1);
console.log('Question mapping audit passed.');
