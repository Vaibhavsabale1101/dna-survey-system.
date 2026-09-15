import FormShell from './FormShell';
import { Card, Q, Radios, Checks, Field } from '../components/ui';

const empty = () => ({
  status: '', education: '', collegeKm: '', travelHrs: '', travelCost: '', transportStudy: '',
  internetWhere: '', examPrep: [], work: '', migrate: '', migrateWhere: '', migrateMonths: '', migrateAge: '',
  leaveReason: [], skillReceived: '', skillNeed: [], business: [], hurdleStart: [],
  mobileSignal: '', missedOnline: '', missedTimes: '', onlineGov: '', onlineKm: '',
  talukaVisits: '', daysLost: '', moneySpent: '', talukaStatus: '', digitalPay: '',
  roads: '', bus: '', busAfter: '', streetLights: '', sports: [], safety: [],
  emergency: '', ambulanceMin: '', helpFacility: '', groups: [], volunteer: '',
  powerCutStudy: '', powerTimes: '', urgentInternet: '', infoSource: [],
});

export default function FormD({ session, setSession }) {
  return (
    <FormShell formKey="formD" formLetter="D" title="FORM D — YOUTH (18–35) · युवक व युवती"
      copiesNote="5 copies · at least 2 young women · studying / unemployed / self-employed / seasonal migrants"
      session={session} setSession={setSession} emptyData={empty}>
      {(form, set) => {
        const f = (k, v) => set((p) => ({ ...p, [k]: v }));
        return (
          <>
            <Card title="D1. Education status" sub="शिक्षण">
              <Q title="1. Present status"><Radios name="status" options={['Studying','Studying + working','Working','Unemployed / looking','Family farm','Migrated, home for now']} value={form.status} onChange={(v)=>f('status',v)} /></Q>
              <Q title="2. Highest education"><Radios name="education" options={['Below 10th','10th','12th','ITI / Diploma','Degree','PG']} value={form.education} onChange={(v)=>f('education',v)} /></Q>
              <Q title="3. If studying — distance / cost"><div className="grid g3"><Field label="College km"><input value={form.collegeKm||''} onChange={(e)=>f('collegeKm',e.target.value)} /></Field>
                <Field label="Daily travel hrs"><input value={form.travelHrs||''} onChange={(e)=>f('travelHrs',e.target.value)} /></Field>
                <Field label="Cost ₹/month"><input value={form.travelCost||''} onChange={(e)=>f('travelCost',e.target.value)} /></Field></div>
                <Radios name="transportStudy" options={['ST bus','Own vehicle','Stay outside village','No transport at return time']} value={form.transportStudy} onChange={(v)=>f('transportStudy',v)} /></Q>
              <Q title="4. Internet for studies"><Radios name="internetWhere" options={['At home','Only at one spot in the village','Have to go to the road / hill','Taluka cyber café','Cannot get it']} value={form.internetWhere} onChange={(v)=>f('internetWhere',v)} /></Q>
              <Q title="5. Competitive exam prep facility"><Checks name="examPrep" options={['Library / study room','Reading room in GP','Online classes','Guidance from someone','NOTHING in village']} value={form.examPrep} onChange={(v)=>f('examPrep',v)} /></Q>
            </Card>
            <Card title="D2. Work, income & migration">
              <Q title="6. Current work"><Radios name="work" options={['Farm / own orchard','Daily wage / MGNREGA','Shop / small business','Private job','Govt job','Driver / transport','Fishing','Tourism / homestay','No work']} value={form.work} onChange={(v)=>f('work',v)} /></Q>
              <Q title="7. Migrate for work?"><Radios name="migrate" options={['Mumbai','Pune','Goa','Kolhapur','Gulf / ship','Do not migrate']} value={form.migrate} onChange={(v)=>f('migrate',v)} />
                <div className="grid g2"><Field label="Months/year"><input value={form.migrateMonths||''} onChange={(e)=>f('migrateMonths',e.target.value)} /></Field>
                  <Field label="Since age"><input value={form.migrateAge||''} onChange={(e)=>f('migrateAge',e.target.value)} /></Field></div></Q>
              <Q title="8. Why young people leave"><Checks name="leaveReason" options={['No jobs here','Income too low','No higher education','Farming not profitable','Better city facilities','Wild animals / farming risk']} value={form.leaveReason} onChange={(v)=>f('leaveReason',v)} /></Q>
              <Q title="9. Skill training"><Field label="Received"><input value={form.skillReceived||''} onChange={(e)=>f('skillReceived',e.target.value)} /></Field>
                <Checks name="skillNeed" options={['Need: computer / IT','Need: electrician-plumber-welding','Need: driving','Need: food processing','Need: nursing / paramedic','Need: hospitality-tourism','None available near by']} value={form.skillNeed} onChange={(v)=>f('skillNeed',v)} /></Q>
              <Q title="10. Business that could work"><Checks name="business" options={['Mango-cashew processing','Dairy / poultry','Homestay-tourism','Nursery','Repair / service centre','Transport','Online / freelance work']} value={form.business} onChange={(v)=>f('business',v)} /></Q>
              <Q title="11. Biggest hurdle to start"><Checks name="hurdleStart" options={['Capital / loan','Skill','Market linkage','Electricity / network','Land / space','No guidance']} value={form.hurdleStart} onChange={(v)=>f('hurdleStart',v)} /></Q>
            </Card>
            <Card title="D3. Connectivity & digital services">
              <Q title="12. Mobile signal"><Radios name="mobileSignal" options={['4G everywhere','4G only in parts','2G only','Signal drops during calls','No signal in some wadis']} value={form.mobileSignal} onChange={(v)=>f('mobileSignal',v)} /></Q>
              <Q title="13. Missed online exam/form due to network"><Radios name="missedOnline" options={['Yes','No']} value={form.missedOnline} onChange={(v)=>f('missedOnline',v)} />
                <Field label="Times"><input value={form.missedTimes||''} onChange={(e)=>f('missedTimes',e.target.value)} /></Field></Q>
              <Q title="14. Online government work"><Radios name="onlineGov" options={['CSC / Aaple Sarkar in village','Taluka','Do it myself on phone','Cannot do it']} value={form.onlineGov} onChange={(v)=>f('onlineGov',v)} />
                <Field label="Taluka km"><input value={form.onlineKm||''} onChange={(e)=>f('onlineKm',e.target.value)} /></Field></Q>
              <Q title="15. Taluka office visits last year"><div className="grid g3"><Field label="Visits"><input value={form.talukaVisits||''} onChange={(e)=>f('talukaVisits',e.target.value)} /></Field>
                <Field label="Days lost"><input value={form.daysLost||''} onChange={(e)=>f('daysLost',e.target.value)} /></Field>
                <Field label="Money ₹"><input value={form.moneySpent||''} onChange={(e)=>f('moneySpent',e.target.value)} /></Field></div>
                <Radios name="talukaStatus" options={['Work completed','Still pending']} value={form.talukaStatus} onChange={(v)=>f('talukaStatus',v)} /></Q>
              <Q title="16. Digital payment / online selling"><Radios name="digitalPay" options={['UPI daily','Sometimes','No — network','No — do not know how','Sell produce online']} value={form.digitalPay} onChange={(v)=>f('digitalPay',v)} /></Q>
            </Card>
            <Card title="D4–D6. Amenities, safety, willingness, electricity">
              <Q title="17. Roads"><Radios name="roads" options={['Good','Broken in stretches','Mud / impassable in monsoon','Wadi has no road at all','Landslide / flooding spot']} value={form.roads} onChange={(v)=>f('roads',v)} /></Q>
              <Q title="18. ST bus"><Radios name="bus" options={['Enough trips','Too few','No bus after pm','Bus does not reach our wadi','No bus stop shelter']} value={form.bus} onChange={(v)=>f('bus',v)} />
                <Field label="No bus after (pm)"><input value={form.busAfter||''} onChange={(e)=>f('busAfter',e.target.value)} /></Field></Q>
              <Q title="19. Street lights"><Radios name="streetLights" options={['Working','Many dead for months','No lights on main lane','Nobody knows whom to inform']} value={form.streetLights} onChange={(v)=>f('streetLights',v)} /></Q>
              <Q title="20. Sports / library"><Checks name="sports" options={['Playground','Gym / vyayamshala','Library','Community hall','Nothing']} value={form.sports} onChange={(v)=>f('sports',v)} /></Q>
              <Q title="21. Safety concerns"><Checks name="safety" options={['Dark roads','Wild animals on the road','Theft','Liquor / addiction','Accidents on the highway','Girls unsafe returning at night','Drowning / river points']} value={form.safety} onChange={(v)=>f('safety',v)} /></Q>
              <Q title="22. Emergency at night"><Radios name="emergency" options={['108 called','Private vehicle arranged','Nobody to inform quickly','Network fails at that moment']} value={form.emergency} onChange={(v)=>f('emergency',v)} />
                <Field label="108 comes in min"><input value={form.ambulanceMin||''} onChange={(e)=>f('ambulanceMin',e.target.value)} /></Field></Q>
              <Q title="23. Help run village facility if trained?"><Radios name="helpFacility" options={['Yes','Maybe','No']} value={form.helpFacility} onChange={(v)=>f('helpFacility',v)} /></Q>
              <Q title="24. Part of any group?"><Checks name="groups" options={['Yuvak mandal','Sports club','SHG','FPO / farmer group','Gram panchayat committee','None']} value={form.groups} onChange={(v)=>f('groups',v)} />
                <Field label="Volunteer name & mobile (optional)"><input value={form.volunteer||''} onChange={(e)=>f('volunteer',e.target.value)} /></Field></Q>
              <Q title="25. Power cut stopped study/work?"><Radios name="powerCutStudy" options={['Yes','No','Power off for days in monsoon','Devices damaged by voltage']} value={form.powerCutStudy} onChange={(v)=>f('powerCutStudy',v)} />
                <Field label="Times last year"><input value={form.powerTimes||''} onChange={(e)=>f('powerTimes',e.target.value)} /></Field></Q>
              <Q title="26. Where for urgent internet?"><Radios name="urgentInternet" options={['One spot in the village','The road / a hill','A shop or CSC','Taluka','Nowhere — the work waits']} value={form.urgentInternet} onChange={(v)=>f('urgentInternet',v)} /></Q>
              <Q title="27. How know about job / scheme / exam"><Checks name="infoSource" options={['GP notice board','WhatsApp group','Friends','Newspaper','Online myself','Usually find out late or never']} value={form.infoSource} onChange={(v)=>f('infoSource',v)} /></Q>
            </Card>
          </>
        );
      }}
    </FormShell>
  );
}
