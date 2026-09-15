import FormShell from './FormShell';
import { Card, Q, Radios, Checks, Field } from '../components/ui';

const empty = () => ({
  role: '', yearsInVillage: '', villagesCover: '', liveHere: '',
  records: '', apps: '', appTrouble: [], hoursRegisters: '', findTooLate: [],
  equipment: [], reportSubmit: '', reportKm: '', reportTimes: '',
  // ASHA
  pregnant: '', under5: '', registersUsed: '', findMissed: '', stockOutDays: '', coldChain: '',
  highRisk: [], homeVisits: '', longestWadiKm: '', travelBy: '',
  // Anganwadi
  enrolled: '', attending: '', underweight: '', growthChart: '', scale: '', thr: '', building: [],
  // Teacher
  students: '', teachers: '', classesHandled: '', staff: '', cannotRead: '', digitalAid: [], internetSchool: '',
  attendance: [], schoolFacilities: [], dropouts: '', dropoutReason: '',
  // Gram Sevak
  certificates: [], typicalVisits: '', daysTaken: '', villagersAsk: '', gpRecords: [], complaints: [], inform: [], cannotMonitor: [],
  // Krishi/Pashudhan/Water
  areaResponsible: '', reachMonth: '', coverage: '', advisory: '', diseaseLearn: '', pumpHrs: '', chlorination: '', tankKnow: [],
  pumpBreakdowns: '', longestInterrupt: '', elecProblem: '',
  // Common end
  powerStops: [], backup: [], longestOutage: '', equipDamaged: '', attendanceMethod: '', notices: [],
});

export default function FormC({ session, setSession }) {
  return (
    <FormShell formKey="formC" formLetter="C" title="FORM C — FRONTLINE WORKERS · क्षेत्रीय कर्मचारी"
      copiesNote="5 copies · ASHA/ANM, AWW, teacher, Gram Sevak + one of Rojgar/Krishi/Pashudhan/Water"
      session={session} setSession={setSession} emptyData={empty}>
      {(form, set) => {
        const f = (k, v) => set((p) => ({ ...p, [k]: v }));
        return (
          <>
            <Card title="C0. Role" sub="तुमचे पद">
              <Q title="1. Role (tick ONE)"><Radios name="role" options={['ASHA','ANM / sub-centre','Anganwadi worker / helper','ZP school teacher','Gram Sevak','Gram Rojgar Sevak','Krishi Sahayyak','Pashudhan supervisor','Water-supply operator','Kotwal / Talathi','Other']} value={form.role} onChange={(v)=>f('role',v)} />
                <div className="grid g3"><Field label="Years in this village"><input value={form.yearsInVillage||''} onChange={(e)=>f('yearsInVillage',e.target.value)} /></Field>
                  <Field label="Villages / wadis you cover"><input value={form.villagesCover||''} onChange={(e)=>f('villagesCover',e.target.value)} /></Field>
                  <Radios name="liveHere" options={['Live in this village — Yes','No']} value={form.liveHere} onChange={(v)=>f('liveHere',v)} /></div></Q>
            </Card>
            <Card title="PART 1 — COMMON TO ALL ROLES">
              <Q title="2. How do you keep records?"><Radios name="records" options={['Paper registers only','Mobile app only','Both — same data twice','App exists but does not work']} value={form.records} onChange={(v)=>f('records',v)} /></Q>
              <Q title="3. Apps / portals trouble"><Field label="Names of apps"><input value={form.apps||''} onChange={(e)=>f('apps',e.target.value)} /></Field>
                <Checks name="appTrouble" options={['No network','App hangs / slow','No smartphone / storage','Not trained','Password-OTP problem','Have to climb a hill for range']} value={form.appTrouble} onChange={(v)=>f('appTrouble',v)} /></Q>
              <Q title="4. Hours/week on registers & data entry"><Radios name="hoursRegisters" options={['<2','2-5','5-10','>10']} value={form.hoursRegisters} onChange={(v)=>f('hoursRegisters',v)} /></Q>
              <Q title="5. What do you find TOO LATE because of manual records?"><Checks name="findTooLate" options={['Who missed a visit / dose','Which child is not gaining weight','Which student is absent repeatedly','Stock about to finish','Pump / supply failure','Nothing']} value={form.findTooLate} onChange={(v)=>f('findTooLate',v)} /></Q>
              <Q title="6. Equipment & condition"><Checks name="equipment" options={['Smartphone (own / dept.)','Tablet','Laptop-computer','Printer','Weighing scale','BP-Hb kit','None working']} value={form.equipment} onChange={(v)=>f('equipment',v)} /></Q>
              <Q title="7. Reporting — travel to submit?"><Radios name="reportSubmit" options={['Online submission','Have to go to taluka','Both']} value={form.reportSubmit} onChange={(v)=>f('reportSubmit',v)} />
                <div className="grid g2"><Field label="Distance km"><input value={form.reportKm||''} onChange={(e)=>f('reportKm',e.target.value)} /></Field>
                  <Field label="Times per month"><input value={form.reportTimes||''} onChange={(e)=>f('reportTimes',e.target.value)} /></Field></div></Q>
            </Card>
            <Card title="C1. ASHA / ANM block">
              <Q title="8–12. Tracking & visits"><div className="grid g3"><Field label="Pregnant tracked"><input value={form.pregnant||''} onChange={(e)=>f('pregnant',e.target.value)} /></Field>
                <Field label="Children under 5"><input value={form.under5||''} onChange={(e)=>f('under5',e.target.value)} /></Field>
                <Field label="Registers used"><input value={form.registersUsed||''} onChange={(e)=>f('registersUsed',e.target.value)} /></Field></div>
                <Radios name="findMissed" options={['Can tell instantly','Have to check registers','Cannot tell quickly']} value={form.findMissed} onChange={(v)=>f('findMissed',v)} />
                <Radios name="findMissed2" options={['On my next home visit','When she comes','Do not find out until late','Supervisor tells me']} value={form.findMissed2} onChange={(v)=>f('findMissed2',v)} />
                <Field label="Stock-out days/month"><input value={form.stockOutDays||''} onChange={(e)=>f('stockOutDays',e.target.value)} /></Field>
                <Radios name="coldChain" options={['Hand-written log','Automatic device','Not recorded','No fridge']} value={form.coldChain} onChange={(v)=>f('coldChain',v)} />
                <Checks name="highRisk" options={['Vehicle available','No vehicle at night','Road not motorable in monsoon','Delivery happened on the way']} value={form.highRisk} onChange={(v)=>f('highRisk',v)} />
                <div className="grid g2"><Field label="Home visits/day"><input value={form.homeVisits||''} onChange={(e)=>f('homeVisits',e.target.value)} /></Field>
                  <Field label="Longest wadi km"><input value={form.longestWadiKm||''} onChange={(e)=>f('longestWadiKm',e.target.value)} /></Field></div>
                <Radios name="travelBy" options={['Walk','Own two-wheeler','ST bus','No transport']} value={form.travelBy} onChange={(v)=>f('travelBy',v)} /></Q>
            </Card>
            <Card title="C2. Anganwadi worker block">
              <Q title="13–16"><div className="grid g3"><Field label="Children enrolled"><input value={form.enrolled||''} onChange={(e)=>f('enrolled',e.target.value)} /></Field>
                <Field label="Attending daily"><input value={form.attending||''} onChange={(e)=>f('attending',e.target.value)} /></Field>
                <Field label="Underweight SAM/MAM"><input value={form.underweight||''} onChange={(e)=>f('underweight',e.target.value)} /></Field></div>
                <Radios name="growthChart" options={['Growth chart plotted monthly','Only weight noted on paper','Cannot see the trend across months']} value={form.growthChart} onChange={(v)=>f('growthChart',v)} />
                <Radios name="scale" options={['Both working','Scale not working','No height board','Digital scale']} value={form.scale} onChange={(v)=>f('scale',v)} />
                <Radios name="thr" options={['On time','Late some months','Quantity short','Storage / rodent problem','No LPG / kitchen']} value={form.thr} onChange={(v)=>f('thr',v)} />
                <Checks name="building" options={['Own building','Rented / other','Leaking in monsoon','No toilet','No water','No electricity']} value={form.building} onChange={(v)=>f('building',v)} /></Q>
            </Card>
            <Card title="C3. Teacher block">
              <Q title="17–22"><div className="grid g3"><Field label="Students"><input value={form.students||''} onChange={(e)=>f('students',e.target.value)} /></Field>
                <Field label="Teachers"><input value={form.teachers||''} onChange={(e)=>f('teachers',e.target.value)} /></Field>
                <Field label="Classes handled same time"><input value={form.classesHandled||''} onChange={(e)=>f('classesHandled',e.target.value)} /></Field></div>
                <Radios name="staff" options={['Single teacher school','Multi-grade teaching','Adequate staff']} value={form.staff} onChange={(v)=>f('staff',v)} />
                <Radios name="cannotRead" options={['Almost none','Up to 25%','25-50%','More than half']} value={form.cannotRead} onChange={(v)=>f('cannotRead',v)} />
                <Checks name="digitalAid" options={['Smart TV / projector working','Broken / not working','Computer lab','Tablets','NONE']} value={form.digitalAid} onChange={(v)=>f('digitalAid',v)} />
                <Radios name="internetSchool" options={['Internet available — Yes','No']} value={form.internetSchool} onChange={(v)=>f('internetSchool',v)} />
                <Checks name="attendance" options={['Paper register','App','Parents informed same day','Parents not informed','WhatsApp group']} value={form.attendance} onChange={(v)=>f('attendance',v)} />
                <Checks name="schoolFacilities" options={['Compound wall broken','Toilet unusable','No drinking water','Leaking roof','No playground','No library','Stray animals enter']} value={form.schoolFacilities} onChange={(v)=>f('schoolFacilities',v)} />
                <Field label="Dropouts after Std 8/10 last 2 yrs"><input value={form.dropouts||''} onChange={(e)=>f('dropouts',e.target.value)} /></Field>
                <Radios name="dropoutReason" options={['Distance to high school','Migration with family','No interest','Financial','Girls stopped for safety']} value={form.dropoutReason} onChange={(v)=>f('dropoutReason',v)} /></Q>
            </Card>
            <Card title="C4. Gram Sevak / Rojgar Sevak">
              <Q title="23–27"><Checks name="certificates" options={['Income / caste / domicile','7-12, mutation','Pension / scheme forms','Bank / Aadhaar','Ration card']} value={form.certificates} onChange={(v)=>f('certificates',v)} />
                <div className="grid g3"><Field label="Typical visits needed"><input value={form.typicalVisits||''} onChange={(e)=>f('typicalVisits',e.target.value)} /></Field>
                  <Field label="Days taken"><input value={form.daysTaken||''} onChange={(e)=>f('daysTaken',e.target.value)} /></Field>
                  <Field label="Villagers/month asking"><input value={form.villagersAsk||''} onChange={(e)=>f('villagersAsk',e.target.value)} /></Field></div>
                <Checks name="gpRecords" options={['All registers by hand','Computer available','Internet speed poor','No operator','Property tax collected manually','No record of assets']} value={form.gpRecords} onChange={(v)=>f('gpRecords',v)} />
                <Checks name="complaints" options={['Verbally to me','Phone call','Written','Grievance register','No system — nothing is tracked']} value={form.complaints} onChange={(v)=>f('complaints',v)} />
                <Checks name="inform" options={['Temple / mosque loudspeaker','Kotwal / dawandi','WhatsApp group','Door to door','No quick way']} value={form.inform} onChange={(v)=>f('inform',v)} />
                <Checks name="cannotMonitor" options={['Street lights','Water pump','Waste vehicle','Public buildings','GP land','Water tank level']} value={form.cannotMonitor} onChange={(v)=>f('cannotMonitor',v)} /></Q>
            </Card>
            <Card title="C5–C6. Krishi / Pashudhan / Water / Power / Info">
              <Q title="28–35"><Field label="Area / animals / connections responsible"><input value={form.areaResponsible||''} onChange={(e)=>f('areaResponsible',e.target.value)} /></Field>
                <Field label="HH reachable in a month"><input value={form.reachMonth||''} onChange={(e)=>f('reachMonth',e.target.value)} /></Field>
                <Radios name="coverage" options={['Adequate','Too large to cover','No vehicle']} value={form.coverage} onChange={(v)=>f('coverage',v)} />
                <Radios name="advisory" options={['Group meeting','WhatsApp','Individual visit','Cannot reach most farmers']} value={form.advisory} onChange={(v)=>f('advisory',v)} />
                <Radios name="diseaseLearn" options={['Farmer informs late','Regular visits','Register only','No system','Ear-tag data']} value={form.diseaseLearn} onChange={(v)=>f('diseaseLearn',v)} />
                <Field label="Pump running hrs/day"><input value={form.pumpHrs||''} onChange={(e)=>f('pumpHrs',e.target.value)} /></Field>
                <Radios name="chlorination" options={['Daily','Irregular','Not done','No TCL supply']} value={form.chlorination} onChange={(v)=>f('chlorination',v)} />
                <Checks name="tankKnow" options={['Physically go and see','Villagers complain','Phone call','No way to know']} value={form.tankKnow} onChange={(v)=>f('tankKnow',v)} />
                <div className="grid g2"><Field label="Pump breakdowns last year"><input value={form.pumpBreakdowns||''} onChange={(e)=>f('pumpBreakdowns',e.target.value)} /></Field>
                  <Field label="Longest supply interrupt (days)"><input value={form.longestInterrupt||''} onChange={(e)=>f('longestInterrupt',e.target.value)} /></Field></div>
                <Checks name="powerStops" options={['Vaccine fridge / cold chain','Computer & reporting','Lights / fans','Water pump','Mobile charging','Nothing — have backup']} value={form.powerStops} onChange={(v)=>f('powerStops',v)} />
                <Checks name="backup" options={['Inverter','Solar','Generator','None']} value={form.backup} onChange={(v)=>f('backup',v)} />
                <Radios name="attendanceMethod" options={['Paper muster','Biometric','App','Not verified by anyone','Reported by supervisor on visit']} value={form.attendanceMethod} onChange={(v)=>f('attendanceMethod',v)} />
                <Checks name="notices" options={['Notice board at GP','Read out at Gram Sabha','Loudspeaker','WhatsApp','Not displayed — people ask us individually']} value={form.notices} onChange={(v)=>f('notices',v)} /></Q>
            </Card>
          </>
        );
      }}
    </FormShell>
  );
}
