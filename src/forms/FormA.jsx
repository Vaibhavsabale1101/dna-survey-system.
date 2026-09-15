import FormShell from './FormShell';
import { Card, Q, Radios, Checks, Field } from '../components/ui';

const empty = () => ({
  land: '',
  crops: [],
  irrigationPct: '',
  soilTest: '',
  fertiliser: '',
  seedProblem: '',
  costYield: '',
  irrigationSource: '',
  waterFailsMonth: '',
  waterLevelKnown: '',
  pumpBurnt: '',
  pumpTimes: '',
  pumpCost: '',
  irrigMethod: [],
  waterWasted: '',
  waterHours: '',
  nightWater: '',
  weatherSource: '',
  forecastUseful: '',
  cropLossCauses: [],
  cropLossAmt: '',
  cropLossArea: '',
  cropLossYear: '',
  compensation: '',
  mainPest: '',
  noticeDamage: '',
  adviceWho: '',
  adviceDays: '',
  sprayMethod: [],
  healthAfterSpray: '',
  animals: [],
  animalFreq: '',
  nightGuardHrs: '',
  animalLoss: '',
  animalComp: '',
  sellWhere: '',
  knowRate: '',
  marketKm: '',
  transportCost: '',
  transitSpoil: '',
  postHarvestLoss: '',
  facilities: [],
  livestock: [],
  milkLitres: '',
  milkSoldTo: '',
  livestockProblems: [],
  vetTime: '',
  animalDeaths: '',
  fishing: '',
  fishProblem: [],
  talukaVisits: '',
  daysLost: '',
  moneySpent: '',
  talukaStatus: '',
  hardest: [],
  voltageDamage: '',
  voltageTimes: '',
  voltageCost: '',
  milkTest: [],
  schemeInfo: [],
});

export default function FormA({ session, setSession }) {
  return (
    <FormShell
      formKey="formA"
      formLetter="A"
      title="FORM A — FARMERS · शेतकरी"
      copiesNote="5 in-depth copies per village · women, small/marginal/tenant, orchard owners · 15–20 min"
      session={session}
      setSession={setSession}
      emptyData={empty}
    >
      {(form, set) => {
        const f = (k, v) => set((p) => ({ ...p, [k]: v }));
        return (
          <>
            <Card title="A1. Land & crops" sub="जमीन व पिके">
              <Q title="1. Land you cultivate (own + leased), acres">
                <Radios name="land" options={['<1', '1-2.5', '2.5-5', '>5', 'Landless / tenant']} value={form.land} onChange={(v) => f('land', v)} />
              </Q>
              <Q title="2. Main crops grown">
                <Checks name="crops" options={['Paddy', 'Mango-Hapus', 'Cashew', 'Kokum', 'Coconut/Areca', 'Nachani', 'Vegetables', 'Rubber', 'Other']} value={form.crops} onChange={(v) => f('crops', v)} />
              </Q>
              <Q title="3. How much of your land gets irrigation water?">
                <Radios name="irrigationPct" options={['None – fully rainfed', '<25%', '25-50%', '>50%']} value={form.irrigationPct} onChange={(v) => f('irrigationPct', v)} />
              </Q>
            </Card>

            <Card title="A2. Soil & inputs" sub="माती व निविष्टा">
              <Q title="4. Soil testing done in last 3 years?">
                <Radios name="soilTest" options={['Yes, card received', 'Yes, no card', 'No', "Don't know what it is"]} value={form.soilTest} onChange={(v) => f('soilTest', v)} />
              </Q>
              <Q title="5. How do you decide fertiliser amount?">
                <Radios name="fertiliser" options={['Own guess / tradition', 'Shop keeper says', 'Krishi Sahayyak', 'Mobile app / YouTube', 'Neighbour']} value={form.fertiliser} onChange={(v) => f('fertiliser', v)} />
              </Q>
              <Q title="6. Problem getting good seed / grafts / saplings">
                <Radios name="seedProblem" options={['Easily available', 'Costly', 'Have to go to taluka/other district', 'Fake or poor material received']} value={form.seedProblem} onChange={(v) => f('seedProblem', v)} />
              </Q>
              <Q title="7. Cost of inputs vs 3 years ago & yield trend">
                <Radios name="costYield" options={['Cost up, yield same', 'Cost up, yield down', 'Both same', 'Yield up']} value={form.costYield} onChange={(v) => f('costYield', v)} />
              </Q>
            </Card>

            <Card title="A3. Water & irrigation" sub="पाणी व सिंचन">
              <Q title="8. Irrigation source">
                <Radios name="irrigationSource" options={['Open well', 'Borewell', 'River / nallah', 'KT weir / bandhara', 'Lift irrigation', 'Rain only']} value={form.irrigationSource} onChange={(v) => f('irrigationSource', v)} />
              </Q>
              <Q title="9. Month water source starts failing">
                <Radios name="waterFailsMonth" options={['January', 'February', 'March', 'April', 'May', 'Never fails']} value={form.waterFailsMonth} onChange={(v) => f('waterFailsMonth', v)} />
              </Q>
              <Q title="10. Know water left in well/bore before pump?">
                <Radios name="waterLevelKnown" options={['Yes, by looking', 'No — no way to know', 'Guess only']} value={form.waterLevelKnown} onChange={(v) => f('waterLevelKnown', v)} />
              </Q>
              <Q title="11. Pump / motor burnt or failed last 2 years?">
                <Radios name="pumpBurnt" options={['No', 'Yes — dry running', 'Yes — voltage / single phasing', 'Yes — other']} value={form.pumpBurnt} onChange={(v) => f('pumpBurnt', v)} />
                <div className="grid g2" style={{ marginTop: 8 }}>
                  <Field label="How many times">
                    <input value={form.pumpTimes || ''} onChange={(e) => f('pumpTimes', e.target.value)} />
                  </Field>
                  <Field label="Repair cost ₹">
                    <input value={form.pumpCost || ''} onChange={(e) => f('pumpCost', e.target.value)} />
                  </Field>
                </div>
              </Q>
              <Q title="12. Irrigation method & water wastage">
                <Checks name="irrigMethod" options={['Flood / open channel', 'Drip', 'Sprinkler', 'Hose by hand']} value={form.irrigMethod} onChange={(v) => f('irrigMethod', v)} />
                <Radios name="waterWasted" options={['Water clearly wasted — Yes', 'Water clearly wasted — No']} value={form.waterWasted} onChange={(v) => f('waterWasted', v)} />
              </Q>
              <Q title="13. Time spent watering per day (hours)">
                <input value={form.waterHours || ''} onChange={(e) => f('waterHours', e.target.value)} />
                <Radios name="nightWater" options={['Stay awake at night for water/electricity — Yes', 'No']} value={form.nightWater} onChange={(v) => f('nightWater', v)} />
              </Q>
            </Card>

            <Card title="A4. Weather & crop loss" sub="हवामान व नुकसान">
              <Q title="14. Where do you get weather forecast?">
                <Radios name="weatherSource" options={['TV', 'Mobile app', 'WhatsApp group', 'Newspaper', 'Nowhere']} value={form.weatherSource} onChange={(v) => f('weatherSource', v)} />
              </Q>
              <Q title="15. Is forecast useful for YOUR village?">
                <Radios name="forecastUseful" options={['Yes, accurate', 'Too general / district level', 'Comes too late', 'Never see it']} value={form.forecastUseful} onChange={(v) => f('forecastUseful', v)} />
              </Q>
              <Q title="16. Crop loss due to weather last 2 years">
                <Checks name="cropLossCauses" options={['Heavy rain / flood', 'Unseasonal rain', 'Fog / dew on mango flowering', 'Cyclone / strong wind', 'Heat / no rain', 'Landslide']} value={form.cropLossCauses} onChange={(v) => f('cropLossCauses', v)} />
                <div className="grid g3" style={{ marginTop: 8 }}>
                  <Field label="Approx loss ₹">
                    <input value={form.cropLossAmt || ''} onChange={(e) => f('cropLossAmt', e.target.value)} />
                  </Field>
                  <Field label="Area affected (acre)">
                    <input value={form.cropLossArea || ''} onChange={(e) => f('cropLossArea', e.target.value)} />
                  </Field>
                  <Field label="Year">
                    <input value={form.cropLossYear || ''} onChange={(e) => f('cropLossYear', e.target.value)} />
                  </Field>
                </div>
              </Q>
              <Q title="17. Compensation / crop insurance">
                <Radios name="compensation" options={['Yes, full', 'Yes, part', 'Applied — not received', 'Did not apply', 'Do not know how to apply']} value={form.compensation} onChange={(v) => f('compensation', v)} />
              </Q>
            </Card>

            <Card title="A5. Pest & disease" sub="कीड व रोग">
              <Q title="18. Main pest / disease">
                <Radios name="mainPest" options={['Mango hopper-thrips', 'Fruit fly', 'Cashew tea-mosquito', 'Powdery mildew', 'Paddy stem borer / karpa', 'Fungal in monsoon', 'Other']} value={form.mainPest} onChange={(v) => f('mainPest', v)} />
              </Q>
              <Q title="19. By the time you NOTICE attack, damage already">
                <Radios name="noticeDamage" options={['Notice immediately', 'After 10-25% damage', 'After 25-50% damage', 'After more than half is lost']} value={form.noticeDamage} onChange={(v) => f('noticeDamage', v)} />
              </Q>
              <Q title="20. Who gives advice? Days to reach">
                <Radios name="adviceWho" options={['Agri officer / KVK', 'Input shop', 'Neighbour', 'Mobile / YouTube', 'Nobody']} value={form.adviceWho} onChange={(v) => f('adviceWho', v)} />
                <Radios name="adviceDays" options={['same day', '2-7 days', 'more than a week', 'never comes']} value={form.adviceDays} onChange={(v) => f('adviceDays', v)} />
              </Q>
              <Q title="21. Spraying on tall mango / cashew">
                <Checks name="sprayMethod" options={['Own HTP pump', 'Hired labour + pump', 'Very difficult / unsafe', 'Cannot spray at all']} value={form.sprayMethod} onChange={(v) => f('sprayMethod', v)} />
                <Radios name="healthAfterSpray" options={['Health problem after spraying — Yes', 'No']} value={form.healthAfterSpray} onChange={(v) => f('healthAfterSpray', v)} />
              </Q>
            </Card>

            <Card title="A6. Wild animal & stray damage" sub="वन्यप्राणी व मोकट जनावरांचे नुकसान">
              <Q title="22. Which animals damage crop / orchard?">
                <Checks name="animals" options={['Monkey', 'Wild boar', 'Gawa / bison', 'Porcupine', 'Peacock', 'Stray cattle', 'Elephant']} value={form.animals} onChange={(v) => f('animals', v)} />
              </Q>
              <Q title="23. How often / what do you do?">
                <Radios name="animalFreq" options={['Daily', 'Weekly', 'Only in season', 'Night guarding', 'Fencing', 'Nothing possible']} value={form.animalFreq} onChange={(v) => f('animalFreq', v)} />
                <div className="grid g2" style={{ marginTop: 8 }}>
                  <Field label="Night guard hrs">
                    <input value={form.nightGuardHrs || ''} onChange={(e) => f('nightGuardHrs', e.target.value)} />
                  </Field>
                  <Field label="Loss last year ₹">
                    <input value={form.animalLoss || ''} onChange={(e) => f('animalLoss', e.target.value)} />
                  </Field>
                </div>
                <Radios name="animalComp" options={['Compensation — Yes', 'Applied, pending', 'No']} value={form.animalComp} onChange={(v) => f('animalComp', v)} />
              </Q>
            </Card>

            <Card title="A7. Harvest, storage & market" sub="काढणी, साठवण व बाजार">
              <Q title="24. Where do you sell?">
                <Radios name="sellWhere" options={['Village trader', 'Kankavli / Kudal market', 'Vashi / Mumbai', 'Direct customer / courier', 'FPO / Sanstha', 'Online']} value={form.sellWhere} onChange={(v) => f('sellWhere', v)} />
              </Q>
              <Q title="25. Know market rate BEFORE you sell?">
                <Radios name="knowRate" options={['Yes', 'No', 'Only what the trader says']} value={form.knowRate} onChange={(v) => f('knowRate', v)} />
              </Q>
              <Q title="26. Distance to market / transport">
                <div className="grid g2">
                  <Field label="Distance (km)">
                    <input value={form.marketKm || ''} onChange={(e) => f('marketKm', e.target.value)} />
                  </Field>
                  <Field label="Transport cost ₹">
                    <input value={form.transportCost || ''} onChange={(e) => f('transportCost', e.target.value)} />
                  </Field>
                </div>
                <Radios name="transitSpoil" options={['Produce spoiled in transit — Yes', 'No', 'Sometimes']} value={form.transitSpoil} onChange={(v) => f('transitSpoil', v)} />
              </Q>
              <Q title="27. Post-harvest loss">
                <Radios name="postHarvestLoss" options={['None', '<10%', '10-25%', '>25%']} value={form.postHarvestLoss} onChange={(v) => f('postHarvestLoss', v)} />
              </Q>
              <Q title="28. Facility available in village">
                <Checks name="facilities" options={['Grading / packing', 'Ripening chamber', 'Cold storage', 'Cashew processing', 'Drying yard', 'Godown', 'NONE']} value={form.facilities} onChange={(v) => f('facilities', v)} />
              </Q>
            </Card>

            <Card title="A8–A11. Livestock, fisheries, schemes, electricity">
              <Q title="29. Animals you keep">
                <Checks name="livestock" options={['Cow', 'Buffalo', 'Goat', 'Poultry', 'None']} value={form.livestock} onChange={(v) => f('livestock', v)} />
              </Q>
              <Q title="30. Milk daily litres / sold to">
                <Field label="Litres/day">
                  <input value={form.milkLitres || ''} onChange={(e) => f('milkLitres', e.target.value)} />
                </Field>
                <Radios name="milkSoldTo" options={['Dairy / collection centre', 'Village sale', 'Own use only']} value={form.milkSoldTo} onChange={(v) => f('milkSoldTo', v)} />
              </Q>
              <Q title="31. Livestock problems">
                <Checks name="livestockProblems" options={['Disease noticed late', 'Vet far / comes late', 'No AI / breeding', 'Heat missed', 'Fodder shortage', 'No health records', 'Snakebite / wild attack']} value={form.livestockProblems} onChange={(v) => f('livestockProblems', v)} />
                <Radios name="vetTime" options={['Vet same day', '1-2 days', 'more', 'no vet']} value={form.vetTime} onChange={(v) => f('vetTime', v)} />
                <Field label="Animal deaths last year">
                  <input value={form.animalDeaths || ''} onChange={(e) => f('animalDeaths', e.target.value)} />
                </Field>
              </Q>
              <Q title="32–33. Fisheries">
                <Radios name="fishing" options={['No', 'Pond', 'River', 'Sea']} value={form.fishing} onChange={(v) => f('fishing', v)} />
                <Checks name="fishProblem" options={['Fish mortality', 'Water quality / low oxygen', 'No ice / cold storage', 'No market linkage', 'Weather warning not received', 'Boat / net cost']} value={form.fishProblem} onChange={(v) => f('fishProblem', v)} />
              </Q>
              <Q title="34–35. Scheme & office burden">
                <div className="grid g3">
                  <Field label="Taluka visits last year">
                    <input value={form.talukaVisits || ''} onChange={(e) => f('talukaVisits', e.target.value)} />
                  </Field>
                  <Field label="Days work lost">
                    <input value={form.daysLost || ''} onChange={(e) => f('daysLost', e.target.value)} />
                  </Field>
                  <Field label="Money spent ₹">
                    <input value={form.moneySpent || ''} onChange={(e) => f('moneySpent', e.target.value)} />
                  </Field>
                </div>
                <Radios name="talukaStatus" options={['Work done', 'Still pending', 'Gave up']} value={form.talukaStatus} onChange={(v) => f('talukaStatus', v)} />
                <Checks name="hardest" options={['Getting documents', 'Knowing which scheme applies', 'Filling online forms', 'No network to apply', 'No one to guide']} value={form.hardest} onChange={(v) => f('hardest', v)} />
              </Q>
              <Q title="36–38. Voltage, milk quality, information">
                <Radios name="voltageDamage" options={['Yes — voltage damaged motor/appliances', 'No', 'Pump does not start some hours', 'Supply fails monsoon days']} value={form.voltageDamage} onChange={(v) => f('voltageDamage', v)} />
                <div className="grid g2">
                  <Field label="Times last 2 yrs">
                    <input value={form.voltageTimes || ''} onChange={(e) => f('voltageTimes', e.target.value)} />
                  </Field>
                  <Field label="Cost ₹">
                    <input value={form.voltageCost || ''} onChange={(e) => f('voltageCost', e.target.value)} />
                  </Field>
                </div>
                <Checks name="milkTest" options={['Tested by machine', 'Tested by hand / estimate', 'Not tested', 'Dispute over rate', 'Milk rejected sometimes', 'Do not sell milk']} value={form.milkTest} onChange={(v) => f('milkTest', v)} />
                <Checks name="schemeInfo" options={['GP notice board', 'Announcement / loudspeaker', 'WhatsApp group', 'Krishi Sahayyak', 'Neighbour', 'Do not get to know in time']} value={form.schemeInfo} onChange={(v) => f('schemeInfo', v)} />
              </Q>
            </Card>
          </>
        );
      }}
    </FormShell>
  );
}
