import FormShell from './FormShell';
import { Card, Q, Radios, Checks, Field } from '../components/ui';

const empty = () => ({
  waterSource: '', waterFreq: '', waterTiming: '', fetchMins: '', fetchDist: '', whoFetches: '',
  shortageMonths: [], waterQuality: [], waterTreat: [], illness: '', illnessTimes: '',
  cookingFuel: [], chulhaSmoke: '', firewoodHrs: '', powerCuts: '',
  deliveryPlace: '', phcKm: '', nightTransport: '', ambulanceMin: '',
  illnesses: [], medicineStock: '', ancRemind: '',
  anganwadiMeal: '', childWeighed: '', underweight: '', underweightN: '',
  toilet: '', waste: [], drains: [], napkin: '',
  shgMember: '', shgName: '', shgMembers: '', shgYears: '', shgActivity: [], sellWhere: '', monthlyIncome: '',
  hurdle: [], bank: '', bankKm: '', loan: '', upi: '',
  streetLights: '', safeDark: '', mobileSignal: '', onlineWork: '', onlineKm: '',
  waterReach: '', diagnosticPlace: '', diagKm: '', diagCost: '', diagDays: '',
  voltageDamage: '', voltageTimes: '', voltageCost: '', infoSource: [],
});

export default function FormB({ session, setSession }) {
  return (
    <FormShell formKey="formB" formLetter="B" title="FORM B — WOMEN & SHG · महिला व बचत गट"
      copiesNote="5 in-depth · separately from men · preferably anganwadi · woman interviewer if possible"
      session={session} setSession={setSession} emptyData={empty}>
      {(form, set) => {
        const f = (k, v) => set((p) => ({ ...p, [k]: v }));
        return (
          <>
            <Card title="B1. Drinking water" sub="पिण्याचे पाणी">
              <Q title="1. Household water source"><Radios name="waterSource" options={['Tap in house', 'Public stand-post', 'Public well', 'Own well', 'Handpump', 'River / stream', 'Tanker']} value={form.waterSource} onChange={(v) => f('waterSource', v)} /></Q>
              <Q title="2. How often / timing fixed?"><Radios name="waterFreq" options={['Daily', 'Alternate day', 'Once in 3+ days']} value={form.waterFreq} onChange={(v) => f('waterFreq', v)} />
                <Radios name="waterTiming" options={['Timing fixed', 'Timing never fixed']} value={form.waterTiming} onChange={(v) => f('waterTiming', v)} /></Q>
              <Q title="3. Time fetching water"><div className="grid g3"><Field label="Minutes"><input value={form.fetchMins||''} onChange={(e)=>f('fetchMins',e.target.value)} /></Field>
                <Field label="Distance (m)"><input value={form.fetchDist||''} onChange={(e)=>f('fetchDist',e.target.value)} /></Field></div>
                <Radios name="whoFetches" options={['Woman of house', 'Girl child', 'Man', 'All']} value={form.whoFetches} onChange={(v)=>f('whoFetches',v)} /></Q>
              <Q title="4. Shortage months"><Checks name="shortageMonths" options={['Feb','Mar','Apr','May','No shortage']} value={form.shortageMonths} onChange={(v)=>f('shortageMonths',v)} /></Q>
              <Q title="5. Water quality"><Checks name="waterQuality" options={['Clean','Muddy in monsoon','Smell / taste','Worms / insects','Salty']} value={form.waterQuality} onChange={(v)=>f('waterQuality',v)} /></Q>
              <Q title="6. Tested / treated?"><Checks name="waterTreat" options={['Tested regularly','Never tested','Do not know','Boil at home','Filter','Nothing']} value={form.waterTreat} onChange={(v)=>f('waterTreat',v)} /></Q>
              <Q title="7. Illness from water last year"><Radios name="illness" options={['Yes','No']} value={form.illness} onChange={(v)=>f('illness',v)} />
                <Field label="Times"><input value={form.illnessTimes||''} onChange={(e)=>f('illnessTimes',e.target.value)} /></Field></Q>
            </Card>
            <Card title="B2. Household work, fuel & electricity">
              <Q title="8. Cooking fuel"><Checks name="cookingFuel" options={['LPG only','LPG + firewood','Firewood only']} value={form.cookingFuel} onChange={(v)=>f('cookingFuel',v)} />
                <Radios name="chulhaSmoke" options={['Chulha smoke problem — Yes','No']} value={form.chulhaSmoke} onChange={(v)=>f('chulhaSmoke',v)} /></Q>
              <Q title="9. Firewood hrs/week & power cuts"><Field label="Firewood/fodder hrs/week"><input value={form.firewoodHrs||''} onChange={(e)=>f('firewoodHrs',e.target.value)} /></Field>
                <Radios name="powerCuts" options={['No cuts','1-4 hrs','4-8 hrs','More','Cuts during monsoon for days']} value={form.powerCuts} onChange={(v)=>f('powerCuts',v)} /></Q>
            </Card>
            <Card title="B3. Health — mother, child & family">
              <Q title="10. Delivery / emergency"><Radios name="deliveryPlace" options={['Village sub-centre','PHC','Kankavli / Kudal','Kolhapur','Private']} value={form.deliveryPlace} onChange={(v)=>f('deliveryPlace',v)} />
                <Field label="PHC km"><input value={form.phcKm||''} onChange={(e)=>f('phcKm',e.target.value)} /></Field></Q>
              <Q title="11. Transport at night"><Radios name="nightTransport" options={['108 ambulance','Own / hired vehicle','No vehicle at night','Road bad, vehicle cannot come']} value={form.nightTransport} onChange={(v)=>f('nightTransport',v)} />
                <Field label="108 comes in (min)"><input value={form.ambulanceMin||''} onChange={(e)=>f('ambulanceMin',e.target.value)} /></Field></Q>
              <Q title="12. Common illnesses"><Checks name="illnesses" options={['Malaria/dengue','Leptospirosis','Fever/cold','Diabetes/BP','Anaemia','Snakebite','Skin/water-borne']} value={form.illnesses} onChange={(v)=>f('illnesses',v)} /></Q>
              <Q title="13. Medicines at sub-centre"><Radios name="medicineStock" options={['Always','Often out of stock','Have to buy outside','No sub-centre']} value={form.medicineStock} onChange={(v)=>f('medicineStock',v)} /></Q>
              <Q title="14. ANC / vaccination reminders"><Radios name="ancRemind" options={['ASHA visits','Phone call','Nobody reminds','Miss visits because no transport']} value={form.ancRemind} onChange={(v)=>f('ancRemind',v)} /></Q>
            </Card>
            <Card title="B4. Child nutrition & anganwadi">
              <Q title="15. Anganwadi meal"><Radios name="anganwadiMeal" options={['Daily','Some days missed','Supply short some months','THR not on time']} value={form.anganwadiMeal} onChange={(v)=>f('anganwadiMeal',v)} /></Q>
              <Q title="16. Child weighed monthly"><Radios name="childWeighed" options={['Yes both','Weighed but not told','Not weighed regularly','No child']} value={form.childWeighed} onChange={(v)=>f('childWeighed',v)} /></Q>
              <Q title="17. Underweight children in wadi"><Radios name="underweight" options={['Yes','No',"Don't know"]} value={form.underweight} onChange={(v)=>f('underweight',v)} />
                <Field label="Number"><input value={form.underweightN||''} onChange={(e)=>f('underweightN',e.target.value)} /></Field></Q>
            </Card>
            <Card title="B5. Sanitation, waste & drainage">
              <Q title="18. Toilet"><Radios name="toilet" options={['Yes, in use','Yes, but no water','Yes, damaged','No — open defecation']} value={form.toilet} onChange={(v)=>f('toilet',v)} /></Q>
              <Q title="19. Household waste"><Checks name="waste" options={['Collected by GP','Thrown at village edge','Burnt','Composted at home','Plastic is the main problem']} value={form.waste} onChange={(v)=>f('waste',v)} /></Q>
              <Q title="20. Waste water / drains"><Checks name="drains" options={['Closed drain','Open drain','No drain — water stands','Overflows in monsoon','Mosquito breeding']} value={form.drains} onChange={(v)=>f('drains',v)} /></Q>
              <Q title="21. Sanitary napkin disposal"><Radios name="napkin" options={['Burn','Bury','With household waste','No arrangement','Napkins not available in village']} value={form.napkin} onChange={(v)=>f('napkin',v)} /></Q>
            </Card>
            <Card title="B6. SHG, income & marketing">
              <Q title="22. SHG member?"><Radios name="shgMember" options={['Yes','No','Was, now inactive']} value={form.shgMember} onChange={(v)=>f('shgMember',v)} />
                <div className="grid g3"><Field label="Group name"><input value={form.shgName||''} onChange={(e)=>f('shgName',e.target.value)} /></Field>
                  <Field label="Members"><input value={form.shgMembers||''} onChange={(e)=>f('shgMembers',e.target.value)} /></Field>
                  <Field label="Years running"><input value={form.shgYears||''} onChange={(e)=>f('shgYears',e.target.value)} /></Field></div></Q>
              <Q title="23. What group makes/does"><Checks name="shgActivity" options={['Papad-masala','Kokum agal / syrup','Mango pulp / pickle','Cashew processing','Dry fish','Tailoring','Nursery','Only savings-lending','Nothing now']} value={form.shgActivity} onChange={(v)=>f('shgActivity',v)} /></Q>
              <Q title="24. Where sell / monthly income"><Radios name="sellWhere" options={['Only in village','Weekly market','Taluka shops','Exhibition / mela','Online','Cannot sell — no buyer']} value={form.sellWhere} onChange={(v)=>f('sellWhere',v)} />
                <Field label="Monthly income ₹"><input value={form.monthlyIncome||''} onChange={(e)=>f('monthlyIncome',e.target.value)} /></Field></Q>
              <Q title="25. Biggest hurdle"><Checks name="hurdle" options={['No buyer / market link','Packing-labelling','No machine','No working capital','No transport','No training','No place to work']} value={form.hurdle} onChange={(v)=>f('hurdle',v)} /></Q>
              <Q title="26. Bank / loan / digital"><Field label="Bank km"><input value={form.bankKm||''} onChange={(e)=>f('bankKm',e.target.value)} /></Field>
                <Checks name="loan" options={['Loan received','Loan refused','Use UPI/phone-pay','Cannot use — no network','No smartphone']} value={form.loan} onChange={(v)=>f('loan',v)} /></Q>
            </Card>
            <Card title="B7–B8. Safety, mobility, digital, water pressure, diagnostics">
              <Q title="27. Street lights"><Radios name="streetLights" options={['Working','Not working for months','No poles at all','Dark on school / bus stop road']} value={form.streetLights} onChange={(v)=>f('streetLights',v)} /></Q>
              <Q title="28. Safe after dark?"><Radios name="safeDark" options={['Yes','No — dark lane','No — wild animals','No — liquor / nuisance']} value={form.safeDark} onChange={(v)=>f('safeDark',v)} /></Q>
              <Q title="29. Mobile signal at house"><Radios name="mobileSignal" options={['Good','Only outside / on the hill','Very poor','No signal']} value={form.mobileSignal} onChange={(v)=>f('mobileSignal',v)} /></Q>
              <Q title="30. Online form / certificate"><Radios name="onlineWork" options={['CSC in village','Taluka','Relative / shop','Cannot do it at all']} value={form.onlineWork} onChange={(v)=>f('onlineWork',v)} />
                <Field label="Taluka km"><input value={form.onlineKm||''} onChange={(e)=>f('onlineKm',e.target.value)} /></Field></Q>
              <Q title="31. Water reaches house?"><Radios name="waterReach" options={['Reaches well','Weak pressure — takes very long','Reaches only few minutes','Does not reach — fetch elsewhere','Ours is the tail-end wadi']} value={form.waterReach} onChange={(v)=>f('waterReach',v)} /></Q>
              <Q title="32. Diagnostic tests"><Radios name="diagnosticPlace" options={['Sub-centre','PHC','Taluka','Private lab','Kolhapur / Goa','Avoid going because of cost or distance']} value={form.diagnosticPlace} onChange={(v)=>f('diagnosticPlace',v)} />
                <div className="grid g3"><Field label="Distance km"><input value={form.diagKm||''} onChange={(e)=>f('diagKm',e.target.value)} /></Field>
                  <Field label="Cost ₹"><input value={form.diagCost||''} onChange={(e)=>f('diagCost',e.target.value)} /></Field>
                  <Field label="Days lost"><input value={form.diagDays||''} onChange={(e)=>f('diagDays',e.target.value)} /></Field></div></Q>
              <Q title="33. Voltage damage appliances"><Radios name="voltageDamage" options={['Yes','No','Supply off for days in monsoon','No backup for lights at night']} value={form.voltageDamage} onChange={(v)=>f('voltageDamage',v)} />
                <div className="grid g2"><Field label="Times"><input value={form.voltageTimes||''} onChange={(e)=>f('voltageTimes',e.target.value)} /></Field>
                  <Field label="Cost ₹"><input value={form.voltageCost||''} onChange={(e)=>f('voltageCost',e.target.value)} /></Field></div></Q>
              <Q title="34. How get to know GP meeting / scheme"><Checks name="infoSource" options={['Notice board','Loudspeaker announcement','ASHA / AWW tells us','WhatsApp','From neighbours','Usually find out too late']} value={form.infoSource} onChange={(v)=>f('infoSource',v)} /></Q>
            </Card>
          </>
        );
      }}
    </FormShell>
  );
}
