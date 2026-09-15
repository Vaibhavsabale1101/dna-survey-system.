# DNA Stakeholder Questionnaire Set — React App

Sant Gadge Baba Unnat Gram Yojana · Smart & Intelligent Village Project  
TAI: Government Polytechnic, Kolhapur · Vaibhavwadi, Sindhudurg

## Forms included

| Form | Description | Copies |
|------|-------------|--------|
| **Form 0** | Inception & Village Profile | 1 per village |
| **Form A** | Farmers · शेतकरी | 5 per village |
| **Form B** | Women & SHG · महिला व बचत गट | 5 per village |
| **Form C** | Frontline Workers · क्षेत्रीय कर्मचारी | 5 per village |
| **Form D** | Youth (18–35) · युवक व युवती | 5 per village |
| **Form E** | Village Walk Observation Sheet | 1 per village |
| **Form F** | Compilation, Screening & Priority Scoring | 1 per village |

## Design choices

- **Shared session**: Village code, name, wadi, date, taluka, district, interviewer are stored once and carried across forms in the same browser.
- **Per-form localStorage**: Each form has its own store key (`tai-dna-formA`, etc.) so records do not mix.
- **Common header** on A–D: identification + age/gender/language + read-aloud text.
- **Own-words box + TAI-use-only block** on every in-depth form (A–D), as in the paper set.
- **Form E** free-text observation rows (write what you SEE).
- **Form F** tally → screen → mandate → priority score (1–5 × 5) → non-tech list → leaving checklist.
- UI/print styles match the original Form 0 look (navy/teal cards).

## Run

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Data

All data stays in the browser (`localStorage`). Export JSON/CSV from Form 0’s Export tab (other forms save entries individually; export can be extended similarly).

No backend required.

## API-backed survey storage

The project now includes a small Node.js API server with zero extra runtime dependencies.

### Run locally

Open two terminals in the project folder:

```bash
npm run api
```

and:

```bash
npm run dev
```

Vite proxies `/api` to `http://localhost:8787`. Survey records for Forms 0, A, B, C, D, E and F are stored centrally in `server/data/dna-records.json`. Browser `localStorage` remains only as an offline/cache fallback and for the current UI session.

### Main endpoints

- `GET /api/health`
- `GET /api/forms/:formKey`
- `PUT /api/forms/:formKey/:recordId`
- `DELETE /api/forms/:formKey/:recordId`
- `DELETE /api/forms/:formKey`
- `POST /api/forms/:formKey/import`
- `GET /api/villages/:villageCode/bundle` — returns all saved forms for one village, useful for future automatic Form F compilation/reporting.

Set `VITE_API_URL` when the API is deployed separately. See `.env.example`.

## P-code and automatic screening logic (Forms A-D)

The **FOR TAI USE ONLY** table in Forms A, B, C and D uses the P01-P28 master catalogue from `pos.xlsx`.

- Field ID is selected from P01-P28.
- Problem (short) is automatically filled from the selected P-code and is read-only.
- KEEP/DROP is automatically calculated from Long >1yr, Often, Many and Real loss.
- 2 or more checked criteria = Keep.
- 0 or 1 checked criterion = Drop.
- If no P-code is selected, KEEP/DROP remains blank.
- The calculated P-code, problem and KEEP/DROP value are normalized again before saving to the API/local cache.

## Form F automatic compilation
Form F can now compile saved village records from Forms A-E.

1. Select the Village Code in Form F.
2. Select the source forms A, B, C, D and/or E.
3. Choose whether to import KEEP-only problems (default) or all coded problems.
4. Click **Fetch & Build STEP 1 Tally**.

Automation rules:
- A-D are grouped by P01-P28 Field ID.
- The same P-code is counted only once per respondent form/slip.
- Farmers/Women/Frontline/Youth counts are calculated automatically.
- Form E marks `Walk? = Yes` when the same P-code is present in a walk stop.
- `Total` is A+B+C+D occurrence count.
- `%` is Total divided by the number of selected A-D respondent forms.
- Problem text is resolved from the P-code master list.
- Since/Loss/Sector are carried from the matching own-words row where available.
- The API village bundle is used first; if unavailable, the browser local cache is used.

## Stable survey workflow

1. Start API with `npm run api`.
2. Start frontend in another terminal with `npm run dev`.
3. Save exactly one Form 0 for a village first. Forms A–E enforce this prerequisite.
4. Forms A–D: select P01–P28 in TAI USE ONLY. Problem short is auto-filled; 2+ of Long/Often/Many/Real loss = KEEP, otherwise DROP.
5. Form E: map observations to P01–P28 when applicable.
6. Form F: select the village and source forms, then click **Fetch & Build STEP 1 Tally**. The tally merges identical P-codes, counts each P-code once per respondent slip, counts stakeholder groups, and marks walk evidence.
7. `npm run verify` runs a backend/compilation smoke test using temporary data.

### Data safety
The API serializes writes and saves the JSON data file atomically with a `.bak` backup. The frontend keeps an offline cache and queues offline deletes so records are not unintentionally restored after reconnection.

## Excel export (added)

The left navigation now includes **Excel Export**.

Features:
- Export Form 0, A, B, C, D, E, or F as `.xlsx`.
- Filter by one village or export all 21 villages.
- Forms A-D support All / KEEP / DROP filtering for the dedicated TAI screening sheet.
- Every form export contains a `Responses` sheet with **Question No. + Question Text** as the column header and the selected/entered answer in the row.
- Every form export also contains a normalized `Question_Answer` sheet.
- Forms A-D include `TAI_Screening` with P-code, mapped problem, screening criteria, KEEP/DROP and TECH/Admin.
- `Problem_Master` and `Villages` are included.
- **Export complete survey workbook** creates separate `Form_0` through `Form_F` sheets plus master sheets.
- Any stored field not explicitly mapped is still exported as an `Additional stored field`, so database content is not silently omitted.

After extracting this project, run `npm install` once so the ExcelJS dependency is installed, then start the API and Vite frontend as usual.
