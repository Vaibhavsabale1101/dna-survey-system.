export const FORM_VERSION = 'DNA Forms 2026-09 Final';

export const FORM_LABELS = {
  form0: 'Form 0 — Inception & Village Profile',
  formA: 'Form A — Farmers',
  formB: 'Form B — Women & SHG',
  formC: 'Form C — Frontline Workers',
  formD: 'Form D — Youth (18–35)',
  formE: 'Form E — Village Walk Observation',
  formF: 'Form F — Compilation & Priority Scoring',
};
export const FORM_KEYS = Object.keys(FORM_LABELS);

const COMMON_ROWS = [
  ['ID.1', 'Village Code · गाव संकेतांक', 'villageCode'],
  ['ID.2', 'Village / GP · गाव', 'village'],
  ['ID.3', 'Wadi · वाडी', 'wadi'],
  ['ID.4', 'Date · दिनांक', 'date'],
  ['ID.5', 'Form No.', 'formNo'],
  ['ID.6', 'Taluka · तालुका', 'taluka'],
  ['ID.7', 'District · जिल्हा', 'district'],
  ['ID.8', 'Respondent name (optional) · नाव', 'respondent'],
  ['ID.9', 'Interviewer name · मुलाखतकार', 'interviewer'],
  ['ID.10', 'Start time', 'startTime'],
  ['ID.11', 'End time', 'endTime'],
  ['ID.12', 'Age · वय', 'age'],
  ['ID.13', 'Gender · लिंग', 'gender'],
  ['ID.14', 'Language used · वापरलेली भाषा', 'language'],
];

function commonDefinitions(formKey) {
  return COMMON_ROWS
    .filter(([, , path]) => !(formKey === 'formB' && path === 'gender'))
    .map(([no, question, path]) => ({ no, question, path, section: 'Identification' }));
}

const A = [
  ['1','Land you cultivate (own + leased), acres',['land']], ['2','Main crops grown',['crops']], ['3','How much of your land gets irrigation water?',['irrigationPct']],
  ['4','Soil testing done in last 3 years?',['soilTest']], ['5','How do you decide fertiliser amount?',['fertiliser']], ['6','Problem getting good seed / grafts / saplings',['seedProblem']], ['7','Cost of inputs vs 3 years ago & yield trend',['costYield']],
  ['8','Irrigation source',['irrigationSource']], ['9','Month water source starts failing',['waterFailsMonth']], ['10','Know water left in well/bore before pump?',['waterLevelKnown']], ['11','Pump / motor burnt or failed last 2 years?',['pumpBurnt','pumpTimes','pumpCost']], ['12','Irrigation method & water wastage',['irrigMethod','waterWasted']], ['13','Time spent watering per day (hours)',['waterHours','nightWater']],
  ['14','Where do you get weather forecast?',['weatherSource']], ['15','Is forecast useful for YOUR village?',['forecastUseful']], ['16','Crop loss due to weather last 2 years',['cropLossCauses','cropLossAmt','cropLossArea','cropLossYear']], ['17','Compensation / crop insurance',['compensation']],
  ['18','Main pest / disease',['mainPest']], ['19','By the time you NOTICE attack, damage already',['noticeDamage']], ['20','Who gives advice? Days to reach',['adviceWho','adviceDays']], ['21','Spraying on tall mango / cashew',['sprayMethod','healthAfterSpray']],
  ['22','Which animals damage crop / orchard?',['animals']], ['23','How often / what do you do?',['animalFreq','nightGuardHrs','animalLoss','animalComp']], ['24','Where do you sell?',['sellWhere']], ['25','Know market rate BEFORE you sell?',['knowRate']], ['26','Distance to market / transport',['marketKm','transportCost','transitSpoil']], ['27','Post-harvest loss',['postHarvestLoss']], ['28','Facility available in village',['facilities']],
  ['29','Animals you keep',['livestock']], ['30','Milk daily litres / sold to',['milkLitres','milkSoldTo']], ['31','Livestock problems',['livestockProblems','vetTime','animalDeaths']], ['32–33','Fisheries',['fishing','fishProblem']], ['34–35','Scheme & office burden',['talukaVisits','daysLost','moneySpent','talukaStatus','hardest']], ['36–38','Voltage, milk quality, information',['voltageDamage','voltageTimes','voltageCost','milkTest','schemeInfo']],
];
const B = [
  ['1','Household water source',['waterSource']], ['2','How often / timing fixed?',['waterFreq','waterTiming']], ['3','Time fetching water',['whoFetches','fetchMins','fetchDist']], ['4','Shortage months',['shortageMonths']], ['5','Water quality',['waterQuality']], ['6','Tested / treated?',['waterTreat']], ['7','Illness from water last year',['illness','illnessTimes']],
  ['8','Cooking fuel',['cookingFuel','chulhaSmoke']], ['9','Firewood hrs/week & power cuts',['firewoodHrs','powerCuts']], ['10','Delivery / emergency',['deliveryPlace','phcKm']], ['11','Transport at night',['nightTransport','ambulanceMin']], ['12','Common illnesses',['illnesses']], ['13','Medicines at sub-centre',['medicineStock']], ['14','ANC / vaccination reminders',['ancRemind']], ['15','Anganwadi meal',['anganwadiMeal']], ['16','Child weighed monthly',['childWeighed']], ['17','Underweight children in wadi',['underweight','underweightN']],
  ['18','Toilet',['toilet']], ['19','Household waste',['waste']], ['20','Waste water / drains',['drains']], ['21','Sanitary napkin disposal',['napkin']], ['22','SHG member?',['shgMember','shgName','shgMembers','shgYears']], ['23','What group makes/does',['shgActivity']], ['24','Where sell / monthly income',['sellWhere','monthlyIncome']], ['25','Biggest hurdle',['hurdle']], ['26','Bank / loan / digital',['loan','bankKm']], ['27','Street lights',['streetLights']], ['28','Safe after dark?',['safeDark']], ['29','Mobile signal at house',['mobileSignal']], ['30','Online form / certificate',['onlineWork','onlineKm']], ['31','Water reaches house?',['waterReach']], ['32','Diagnostic tests',['diagnosticPlace','diagKm','diagCost','diagDays']], ['33','Voltage damage appliances',['voltageDamage','voltageTimes','voltageCost']], ['34','How get to know GP meeting / scheme',['infoSource']],
];
const C = [
  ['1','Role (tick ONE)',['role','liveHere','yearsInVillage','villagesCover']], ['2','How do you keep records?',['records']], ['3','Apps / portals trouble',['appTrouble','apps']], ['4','Hours/week on registers & data entry',['hoursRegisters']], ['5','What do you find TOO LATE because of manual records?',['findTooLate']], ['6','Equipment & condition',['equipment']], ['7','Reporting — travel to submit?',['reportSubmit','reportKm','reportTimes']],
  ['8–12','Tracking & visits',['findMissed','findMissed2','coldChain','highRisk','travelBy','pregnant','under5','registersUsed','stockOutDays','homeVisits','longestWadiKm']], ['13–16','Anganwadi / child monitoring',['growthChart','scale','thr','building','enrolled','attending','underweight']], ['17–22','School / education',['staff','cannotRead','digitalAid','internetSchool','attendance','schoolFacilities','dropoutReason','students','teachers','classesHandled','dropouts']], ['23–27','GP administration / citizen services',['certificates','gpRecords','complaints','inform','cannotMonitor','typicalVisits','daysTaken','villagersAsk']], ['28–35','Coverage, advisory, water and power',['coverage','advisory','diseaseLearn','chlorination','tankKnow','powerStops','backup','attendanceMethod','notices','areaResponsible','reachMonth','pumpHrs','pumpBreakdowns','longestInterrupt']],
];
const D = [
  ['1','Present status',['status']], ['2','Highest education',['education']], ['3','If studying — distance / cost',['collegeKm','travelHrs','travelCost','transportStudy']], ['4','Internet for studies',['internetWhere']], ['5','Competitive exam prep facility',['examPrep']], ['6','Current work',['work']], ['7','Migrate for work?',['migrate','migrateMonths','migrateAge']], ['8','Why young people leave',['leaveReason']], ['9','Skill training',['skillReceived','skillNeed']], ['10','Business that could work',['business']], ['11','Biggest hurdle to start',['hurdleStart']], ['12','Mobile signal',['mobileSignal']], ['13','Missed online exam/form due to network',['missedOnline','missedTimes']], ['14','Online government work',['onlineGov','onlineKm']], ['15','Taluka office visits last year',['talukaVisits','daysLost','moneySpent','talukaStatus']], ['16','Digital payment / online selling',['digitalPay']], ['17','Roads',['roads']], ['18','ST bus',['bus','busAfter']], ['19','Street lights',['streetLights']], ['20','Sports / library',['sports']], ['21','Safety concerns',['safety']], ['22','Emergency at night',['emergency','ambulanceMin']], ['23','Help run village facility if trained?',['helpFacility']], ['24','Part of any group?',['groups','volunteer']], ['25','Power cut stopped study/work?',['powerCutStudy','powerTimes']], ['26','Where for urgent internet?',['urgentInternet']], ['27','How know about job / scheme / exam',['infoSource']],
];

const SUB_LABELS = {
  pumpTimes:'How many times', pumpCost:'Repair cost ₹', waterWasted:'Water clearly wasted', waterHours:'Hours/day', nightWater:'Stay awake at night', cropLossAmt:'Approx loss ₹', cropLossArea:'Area affected (acre)', cropLossYear:'Year', adviceDays:'Days to reach', healthAfterSpray:'Health problem after spraying', nightGuardHrs:'Night guard hrs', animalLoss:'Loss last year ₹', animalComp:'Compensation', marketKm:'Market km', transportCost:'Transport cost ₹', transitSpoil:'Spoils in transit', milkLitres:'Milk litres/day', milkSoldTo:'Milk sold to', vetTime:'Vet response time', animalDeaths:'Animal deaths', talukaVisits:'Taluka visits', daysLost:'Days lost', moneySpent:'Money spent ₹', voltageTimes:'Times', voltageCost:'Cost ₹',
  waterTiming:'Water timing', whoFetches:'Who fetches', fetchMins:'Minutes fetching', fetchDist:'Distance fetching', illnessTimes:'Times ill', chulhaSmoke:'Chulha smoke', firewoodHrs:'Firewood hrs/week', phcKm:'PHC km', ambulanceMin:'108/ambulance minutes', underweightN:'Number underweight', shgName:'SHG name', shgMembers:'SHG members', shgYears:'SHG years', monthlyIncome:'Monthly income', bankKm:'Bank km', onlineKm:'Taluka/online service km', diagKm:'Diagnostic km', diagCost:'Diagnostic cost', diagDays:'Diagnostic days',
  liveHere:'Lives here', yearsInVillage:'Years in village', villagesCover:'Villages covered', apps:'Apps/portals', reportKm:'Reporting km', reportTimes:'Reporting trips', pregnant:'Pregnant women covered', under5:'Under-5 children', stockOutDays:'Stock-out days', homeVisits:'Home visits', longestWadiKm:'Longest wadi km', enrolled:'Enrolled', attending:'Attending', underweight:'Underweight', students:'Students', teachers:'Teachers', classesHandled:'Classes handled', dropouts:'Dropouts', typicalVisits:'Typical office visits', daysTaken:'Days taken', areaResponsible:'Area responsible', reachMonth:'Reach month', pumpHrs:'Pump hrs', pumpBreakdowns:'Pump breakdowns', longestInterrupt:'Longest interruption',
  collegeKm:'College km', travelHrs:'Daily travel hrs', travelCost:'Travel cost ₹/month', transportStudy:'Transport for study', migrateMonths:'Months/year', migrateAge:'Since age', skillReceived:'Training received', missedTimes:'Times missed', busAfter:'No bus after (pm)', volunteer:'Volunteer name & mobile', powerTimes:'Times last year',
};

export function humanize(s) { return String(s).replace(/_/g,' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./, c => c.toUpperCase()); }

function expandGrouped(list, section='Questionnaire') {
  return list.flatMap(([no, question, keys]) => keys.map((path, idx) => ({
    no: keys.length > 1 ? `${no}.${idx + 1}` : no,
    question: keys.length > 1 ? `${question} — ${SUB_LABELS[path] || humanize(path)}` : question,
    path,
    section,
  })));
}

function form0Definitions(data={}) {
  const d = [...commonDefinitions('form0'),
    {no:'0.1',question:'TAI / Institute',path:'tai',section:'Team'}, {no:'0.2',question:'Visit date',path:'visitDate',section:'Team'}, {no:'0.3',question:'Report date',path:'reportDate',section:'Team'}, {no:'0.4',question:'Team Leader',path:'teamLeader',section:'Team'}, {no:'0.5',question:'Technical Expert',path:'technicalExpert',section:'Team'}, {no:'0.6',question:'Technical Expert Mobile',path:'technicalMobile',section:'Team'}, {no:'0.7',question:'Government Officer',path:'govtOfficer',section:'Team'}, {no:'0.8',question:'Government Officer Mobile',path:'govtMobile',section:'Team'}, {no:'0.9',question:'Sarpanch Name',path:'sarpanchName',section:'Team'}, {no:'0.10',question:'Sarpanch Mobile',path:'sarpanchMobile',section:'Team'}, {no:'0.11',question:'Gram Sevak Name',path:'gramSevakName',section:'Team'}, {no:'0.12',question:'Gram Sevak Mobile',path:'gramSevakMobile',section:'Team'}, {no:'0.13',question:'Field Coordinator',path:'fieldCoordinator',section:'Team'},
    {no:'B.1',question:'Population',path:'population',section:'Village Profile'}, {no:'B.2',question:'Households',path:'households',section:'Village Profile'}, {no:'B.3',question:'Wadi count',path:'wadiCount',section:'Village Profile'}, {no:'B.4',question:'Revenue villages',path:'revenueVillages',section:'Village Profile'}, {no:'B.5',question:'Latitude',path:'latitude',section:'Village Profile'}, {no:'B.6',question:'Longitude',path:'longitude',section:'Village Profile'}, {no:'B.7',question:'Electricity hours/day',path:'electricityHours',section:'Village Profile'}, {no:'B.8',question:'Annual GP budget',path:'annualBudget',section:'Village Profile'}, {no:'B.9',question:'Distance to taluka (km)',path:'talukaDistance',section:'Village Profile'}, {no:'B.10',question:'Bus trips/day',path:'busTrips',section:'Village Profile'}, {no:'B.11',question:'Population band',path:'populationBand',section:'Village Profile'}, {no:'B.12',question:'GP type',path:'gpType',section:'Village Profile'}, {no:'B.13',question:'Mobile signal',path:'mobileSignal',section:'Village Profile'},
  ];
  const facilities = ['ZP / Primary school','Secondary school / Jr. college','Anganwadi centres','Sub-centre / PHC / Ayurvedic','Veterinary dispensary','Dairy / milk collection centre','Bank / ATM / CSC-Aaple Sarkar','SHGs (active) / FPO / Sanstha','Piped water schemes','Public wells / borewells','Overhead tanks (ESR)','Public stand-posts','Street lights (total / dead)','CCTV / PA system','Computer + internet at GP','Weekly market / godown'];
  facilities.forEach((q,i) => { d.push({no:`B.F${i+1}.1`,question:`Facility: ${q} — Number/Availability`,path:`facility_${i}_number`,section:'Facilities'}); d.push({no:`B.F${i+1}.2`,question:`Facility: ${q} — Remarks`,path:`facility_${i}_remarks`,section:'Facilities'}); });
  const occ=['Paddy (भात)','Mango orchard (आंबा)','Cashew (काजू)','Kokum / coconut / areca (कोकम/नारळ/सुपारी)','Dairy & livestock (दुग्ध व पशुधन)','Fishing - river/sea (मत्स्यव्यवसाय)','Forest produce (वनउत्पादन)','Wage labour / MGNREGA (मजुरी/मनरेगा)','Service / job outside (बाहेरील नोकरी)','Tourism / homestay (पर्यटन)','Migration to Mumbai-Goa-Pune (स्थलांतर)'];
  occ.forEach((q,i)=>d.push({no:`C.${i+1}`,question:`Livelihood & land pattern priority — ${q}`,path:`occupationRank_${i}`,section:'Livelihood'}));
  d.push({no:'C.12',question:'Migration families',path:'migrationFamilies',section:'Livelihood'},{no:'C.13',question:'Landholding pattern',path:'landholding',section:'Livelihood'});
  const works = Math.max(3, Array.isArray(data?.works) ? data.works.length : 0);
  for (let i=0;i<works;i++) ['scheme','name','location','status'].forEach((k,j)=>d.push({no:`D.${i+1}.${j+1}`,question:`Major work ${i+1} — ${humanize(k)}`,path:`works.${i}.${k}`,section:'Sanctioned Works'}));
  d.push({no:'E.1',question:'Confirmation checklist',path:'confirmation',section:'Confirmation'},{no:'E.2',question:'Confirming person name',path:'confirmName',section:'Confirmation'},{no:'E.3',question:'Confirming person mobile',path:'confirmMobile',section:'Confirmation'},{no:'E.4',question:'Signature obtained',path:'signatureObtained',section:'Confirmation'},{no:'E.5',question:'Signature date',path:'signatureDate',section:'Confirmation'});
  return d;
}

function formEDefinitions() {
  const d=[{no:'E.ID1',question:'Village Code',path:'villageCode',section:'Identification'},{no:'E.ID2',question:'Village',path:'village',section:'Identification'},{no:'E.ID3',question:'Date',path:'date',section:'Identification'},{no:'E.ID4',question:'Walk start',path:'walkStart',section:'Walk Header'},{no:'E.ID5',question:'Walk end',path:'walkEnd',section:'Walk Header'},{no:'E.ID6',question:'Team members present',path:'teamMembers',section:'Walk Header'}];
  for(let i=0;i<16;i++) ['id','place','look','see','photo','gps','fieldId'].forEach((k,j)=>d.push({no:`E${i+1}.${j+1}`,question:`Stop E${i+1} — ${({id:'Stop ID',place:'Place',look:'What to look for',see:'What you actually see',photo:'Photo file no.',gps:'GPS',fieldId:'P-code / Field ID'})[k]}`,path:`stops.${i}.${k}`,section:'Village Walk'}));
  d.push({no:'E17.1',question:'Any other place',path:'otherPlace',section:'Village Walk'},{no:'E17.2',question:'What you see at other place',path:'otherSee',section:'Village Walk'}); return d;
}

function formFDefinitions(data={}) {
  const d=[{no:'F.ID1',question:'Village Code',path:'villageCode',section:'Identification'},{no:'F.ID2',question:'Village',path:'village',section:'Identification'},{no:'F.ID3',question:'Date',path:'date',section:'Identification'},{no:'F.1',question:'Farmers forms counted',path:'farmersOf',section:'Compilation'},{no:'F.2',question:'Women forms counted',path:'womenOf',section:'Compilation'},{no:'F.3',question:'Frontline forms counted',path:'frontlineOf',section:'Compilation'},{no:'F.4',question:'Youth forms counted',path:'youthOf',section:'Compilation'},{no:'F.5',question:'Total respondent forms',path:'totalOf',section:'Compilation'},{no:'F.6',question:'Import screening rule',path:'importMode',section:'Compilation'},{no:'F.7',question:'Last automation run',path:'lastImportedAt',section:'Compilation'}];
  ['formA','formB','formC','formD','formE'].forEach((k,i)=>d.push({no:`F.S${i+1}`,question:`Source selected — ${k}`,path:`importSources.${k}`,section:'Compilation'}));
  const tallyKeys=['fieldId','problem','sector','farmers','women','frontline','youth','walk','total','pct','since','loss'];
  const tallyN=Math.max(0,Array.isArray(data?.tally)?data.tally.length:0);
  for(let i=0;i<tallyN;i++) tallyKeys.forEach((k,j)=>d.push({no:`F.T${i+1}.${j+1}`,question:`Tally row ${i+1} — ${humanize(k)}`,path:`tally.${i}.${k}`,section:'Step 1 Tally'}));
  d.push({no:'F.M1',question:'Distinct tech sectors (≥4)',path:'mandateSectors',section:'Mandate'},{no:'F.M2',question:'Sectors met',path:'mandateSectorsMet',section:'Mandate'},{no:'F.M3',question:'Tech problems (≥6)',path:'mandateProblems',section:'Mandate'},{no:'F.M4',question:'Problems met',path:'mandateProblemsMet',section:'Mandate'},{no:'F.M5',question:'Wadis represented',path:'mandateWadis',section:'Mandate'},{no:'F.M6',question:'Wadis met',path:'mandateWadisMet',section:'Mandate'},{no:'F.M7',question:'Women ≥40%',path:'mandateWomen',section:'Mandate'},{no:'F.M8',question:'Women met',path:'mandateWomenMet',section:'Mandate'});
  const rankKeys=['rank','problem','fieldId','severity','population','recurrence','feasibility','sustain','total','benefit','techCategory'];
  const rankN=Math.max(10,Array.isArray(data?.ranked)?data.ranked.length:0);
  for(let i=0;i<rankN;i++) rankKeys.forEach((k,j)=>d.push({no:`F.R${i+1}.${j+1}`,question:`Priority rank row ${i+1} — ${humanize(k)}`,path:`ranked.${i}.${k}`,section:'Priority Ranking'}));
  const nt=['no','fieldId','type','problem','action']; const ntN=Math.max(6,Array.isArray(data?.nonTech)?data.nonTech.length:0); for(let i=0;i<ntN;i++) nt.forEach((k,j)=>d.push({no:`F.N${i+1}.${j+1}`,question:`Non-tech row ${i+1} — ${humanize(k)}`,path:`nonTech.${i}.${k}`,section:'Non-Tech'}));
  d.push({no:'F.C1',question:'Confirmation checklist',path:'confirms',section:'Confirmation'},{no:'F.C2',question:'Team Leader',path:'teamLeader',section:'Confirmation'},{no:'F.C3',question:'Signature & date',path:'tlDate',section:'Confirmation'}); return d;
}

function extraADDefinitions() {
  const out=[];
  for(let i=0;i<3;i++) {
    ['problem','since','often','loss','sector'].forEach((k,j)=>out.push({no:`OW${i+1}.${j+1}`,question:`Own words problem ${i+1} — ${humanize(k)}`,path:`ownWords.${i}.${k}`,section:'Own Words'}));
    ['fieldId','problem','long','often','many','realLoss','keep','tech'].forEach((k,j)=>out.push({no:`TAI${i+1}.${j+1}`,question:`TAI screening ${i+1} — ${humanize(k)}`,path:`taiUse.${i}.${k}`,section:'TAI Screening'}));
  }
  out.push({no:'OW4',question:'If only ONE problem could be solved this year, which one?',path:'oneProblem',section:'Own Words'},{no:'TAI.S1',question:'Signature of interviewer',path:'interviewerSig',section:'TAI Screening'},{no:'TAI.S2',question:'Checked by Team Leader',path:'tlCheck',section:'TAI Screening'});
  return out;
}

function collectLeafPaths(obj, prefix='', out=[]) {
  if (obj === null || obj === undefined) { if (prefix) out.push(prefix); return out; }
  if (Array.isArray(obj)) {
    if (!obj.length) { if (prefix) out.push(prefix); return out; }
    const primitiveOnly = obj.every(v => v === null || ['string','number','boolean'].includes(typeof v));
    if (primitiveOnly) { if (prefix) out.push(prefix); return out; }
    obj.forEach((v,i)=>collectLeafPaths(v, `${prefix}${prefix?'.':''}${i}`, out));
    return out;
  }
  if (typeof obj === 'object') {
    const entries=Object.entries(obj);
    if (!entries.length) { if(prefix) out.push(prefix); return out; }
    entries.forEach(([k,v])=>collectLeafPaths(v, `${prefix}${prefix?'.':''}${k}`, out));
    return out;
  }
  if(prefix) out.push(prefix);
  return out;
}

export function definitionsForRecord(formKey, data={}) {
  let defs=[];
  if(formKey==='form0') defs=form0Definitions(data);
  else if(formKey==='formA') defs=[...commonDefinitions(formKey),...expandGrouped(A),...extraADDefinitions()];
  else if(formKey==='formB') defs=[...commonDefinitions(formKey),...expandGrouped(B),...extraADDefinitions()];
  else if(formKey==='formC') defs=[...commonDefinitions(formKey),...expandGrouped(C),...extraADDefinitions()];
  else if(formKey==='formD') defs=[...commonDefinitions(formKey),...expandGrouped(D),...extraADDefinitions()];
  else if(formKey==='formE') defs=formEDefinitions();
  else if(formKey==='formF') defs=formFDefinitions(data);
  const known=new Set(defs.map(d=>d.path));
  const ignored=new Set(['updated','occupation','formKey']);
  const leaves=collectLeafPaths(data,'',[]);
  let unknown=1;
  for(const p of leaves) {
    if(!p || known.has(p) || ignored.has(p) || (formKey==='formB' && p==='gender')) continue;
    defs.push({no:`UNMAPPED.${unknown++}`,question:`Unmapped stored field — ${humanize(p)}`,path:p,section:'Unmapped',mapped:false});
  }
  const seen=new Set();
  return defs.filter(d=>{if(seen.has(d.path))return false;seen.add(d.path);return true;}).map((d,i)=>({...d,mapped:d.mapped!==false,order:i+1}));
}

export function pathGet(obj, path) {
  if (!path) return undefined;
  return String(path).split('.').reduce((a,k) => a == null ? undefined : a[k], obj);
}

export function answerToText(v) {
  if (v === null || v === undefined || v === '') return '';
  if (typeof v === 'boolean') return v ? 'Yes' : 'No';
  if (Array.isArray(v)) return v.map(answerToText).filter(Boolean).join('; ');
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}
