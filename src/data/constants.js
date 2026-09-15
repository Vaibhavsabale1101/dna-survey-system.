import { api } from '../api';

export const STORE_PREFIX = 'tai-dna-';

export const villageMap = {
  VG1: 'मांगवली',
  VG2: 'तिरवडे तर्फ खारेपाटण',
  VG3: 'ऐणारी',
  VG4: 'भुईबावडा',
  VG5: 'उंबर्डे',
  VG6: 'कुर्ली',
  VG7: 'सडुरे-शिराळे',
  VG8: 'अरुळे',
  VG9: 'निमअरुळे',
  VG10: 'एडगाव',
  VG11: 'कुसूर',
  VG12: 'सोनाळी',
  VG13: 'कुंभवडे',
  VG14: 'लोरे नं.२',
  VG15: 'आचिर्णे',
  VG16: 'खांबाळे',
  VG17: 'हेत',
  VG18: 'मौदे',
  VG19: 'आखवणे भोम',
  VG20: 'नेर्ले',
  VG21: 'उपळे',
};

// Master problem-code catalogue used in Forms A-D, sourced from pos.xlsx.
// Field ID selection automatically resolves the corresponding short problem.
export const PROBLEM_CODES = [
  { code: 'P01', problem: 'Drinking water: quantity or timing', marathi: 'पिण्याचे पाणी — प्रमाण व वेळ' },
  { code: 'P02', problem: 'Drinking water: quality, muddy, smell', marathi: 'पाण्याचा दर्जा — गढूळ, वास' },
  { code: 'P03', problem: 'Irrigation water, well or bore drying', marathi: 'सिंचन पाणी / विहीर-बोअर आटणे' },
  { code: 'P04', problem: 'Pump or motor failure', marathi: 'पंप-मोटार बिघाड' },
  { code: 'P05', problem: 'Electricity: cuts, low voltage, damage', marathi: 'वीज — खंडित, कमी दाब, नुकसान' },
  { code: 'P06', problem: 'Crop pest and disease noticed too late', marathi: 'कीड-रोग उशिरा लक्षात येणे' },
  { code: 'P07', problem: 'Weather loss: unseasonal rain, wind', marathi: 'हवामान नुकसान — अवकाळी पाऊस, वारा' },
  { code: 'P08', problem: 'Soil health, fertiliser by guess', marathi: 'जमीन आरोग्य / अंदाजाने खत' },
  { code: 'P09', problem: 'Market price not known or low rate', marathi: 'बाजारभाव माहिती नाही / कमी दर' },
  { code: 'P10', problem: 'Storage, grading, transport of produce', marathi: 'साठवण, प्रतवारी, वाहतूक' },
  { code: 'P11', problem: 'Wild animals or stray cattle damage', marathi: 'वन्यप्राणी-मोकाट जनावरांचे नुकसान' },
  { code: 'P12', problem: 'Livestock disease, no vet in time', marathi: 'जनावरांचे आजार / वेळेत डॉक्टर नाही' },
  { code: 'P13', problem: 'Milk: quality testing, rate, collection', marathi: 'दूध — तपासणी, दर, संकलन' },
  { code: 'P14', problem: 'Fish pond or fishing problem', marathi: 'मत्स्य तळे / मासेमारी अडचण' },
  { code: 'P15', problem: 'Health: no doctor, tests, medicines', marathi: 'आरोग्य — डॉक्टर, तपासण्या, औषधे नाहीत' },
  { code: 'P16', problem: 'Emergency transport at night', marathi: 'रात्री रुग्णवाहिका-वाहन नाही' },
  { code: 'P17', problem: 'Anganwadi: meal, weighing, building', marathi: 'अंगणवाडी — आहार, वजन, इमारत' },
  { code: 'P18', problem: 'School: teaching, devices, building', marathi: 'शाळा — शिकवणी, साधने, इमारत' },
  { code: 'P19', problem: 'Waste collection, open dumping', marathi: 'कचरा संकलन / उघड्यावर टाकणे' },
  { code: 'P20', problem: 'Drainage, waste water standing', marathi: 'गटार / सांडपाणी साचणे' },
  { code: 'P21', problem: 'Street lights not working, dark lanes', marathi: 'पथदिवे बंद / अंधार' },
  { code: 'P22', problem: 'Roads: broken, mud in monsoon', marathi: 'रस्ते — खराब, पावसात चिखल' },
  { code: 'P23', problem: 'Mobile network or internet', marathi: 'मोबाईल रेंज / इंटरनेट' },
  { code: 'P24', problem: 'Government office work: certificates, forms', marathi: 'शासकीय कामे — दाखले, अर्ज' },
  { code: 'P25', problem: 'Employment, migration for work', marathi: 'रोजगार / कामासाठी स्थलांतर' },
  { code: 'P26', problem: 'SHG income, selling our products', marathi: 'बचत गट उत्पन्न / माल विक्री' },
  { code: 'P27', problem: 'Safety: theft, accidents, unsafe at night', marathi: 'सुरक्षा — चोरी, अपघात, रात्री असुरक्षित' },
  { code: 'P28', problem: 'Information: notices, schemes not known', marathi: 'माहिती — सूचना-योजना कळत नाहीत' },
];

export const PROBLEM_BY_CODE = Object.fromEntries(PROBLEM_CODES.map((item) => [item.code, item]));

// Dynamic background synchronization with MySQL master data
if (typeof window !== 'undefined') {
  api.getVillages().then((res) => {
    if (Array.isArray(res?.villages)) {
      res.villages.forEach((v) => {
        villageMap[v.village_code] = v.village_name;
      });
    }
  }).catch(() => {});

  api.getProblems().then((res) => {
    if (Array.isArray(res?.problems) && res.problems.length > 0) {
      res.problems.forEach((p, idx) => {
        const item = {
          code: p.code,
          problem: p.problem_en,
          marathi: p.problem_mr,
        };
        PROBLEM_CODES[idx] = item;
        PROBLEM_BY_CODE[p.code] = item;
      });
    }
  }).catch(() => {});
}

export function useMasterData() {
  return { villageMap, problemCodes: PROBLEM_CODES, problemByCode: PROBLEM_BY_CODE };
}

export const SECTORS = ['A', 'W', 'H', 'E', 'AH', 'G', 'S', 'L', 'R', 'F'];

export const READ_ALOUD =
  'आम्ही शासनाच्या स्मार्ट व्हिलेज योजनेसाठी फक्त तुमच्या अडचणी ऐकायला आलो आहोत. आम्ही कोणतेही तंत्रज्ञान, वस्तू, पैसा किंवा योजना मंजूर करण्याचे आश्वासन दिले जाणार नाही. तुमचे नाव लिहिणे बंधनकारक नाही.';

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function genId() {
  return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 7);
}

export function codeForVillage(name) {
  return Object.keys(villageMap).find((c) => villageMap[c] === name) || '';
}

export const FORMS_META = [
  { id: '0', code: 'Form0', title: 'FORM 0 — Inception & Village Profile', short: 'Form 0', copies: '1 per village' },
  { id: 'A', code: 'FormA', title: 'FORM A — Farmers · शेतकरी', short: 'Form A', copies: '5 per village' },
  { id: 'B', code: 'FormB', title: 'FORM B — Women & SHG · महिला व बचत गट', short: 'Form B', copies: '5 per village' },
  { id: 'C', code: 'FormC', title: 'FORM C — Frontline Workers · क्षेत्रीय कर्मचारी', short: 'Form C', copies: '5 per village' },
  { id: 'D', code: 'FormD', title: 'FORM D — Youth (18–35) · युवक व युवती', short: 'Form D', copies: '5 per village' },
  { id: 'E', code: 'FormE', title: 'FORM E — Village Walk Observation', short: 'Form E', copies: '1 per village' },
  { id: 'F', code: 'FormF', title: 'FORM F — Compilation & Priority Scoring', short: 'Form F', copies: '1 per village' },
];
