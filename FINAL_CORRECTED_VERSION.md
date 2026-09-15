# DNA Survey — Final Corrected Data-Storage Version

This version implements the survey rules requested during development and uses the database as the source of truth.

## Data storage
- `survey_records.data_json` preserves the complete original submitted payload.
- `survey_answers` stores each questionnaire field separately with form version, section, question number, exact question text, field path, answer, answer status and mapping status.
- Blank responses are explicitly stored/exported as `NOT ANSWERED`; entered answers are never silently omitted.
- Existing v2 databases are upgraded in place at API startup without deleting survey data.

## Survey safeguards
- Form 0 is compulsory before Forms A–F can be persisted through the API.
- Only one Form 0 is allowed per village through the application/API workflow.
- All 11 Form 0 Section C livelihood priorities are compulsory and restricted to `1-High`, `2-Medium`, `3-Low`.
- Form B does not display or persist Gender.
- Village name is taken from the 21-village master using the selected village code.
- A–D TAI P-code rows are canonicalized on the server; problem text comes from the problem master and KEEP/DROP is recalculated from the four screening flags.
- Form E P-code observations are synchronized to `form_e_stops`.

## Excel export
Each individual form export includes:
- `Export_Metadata`
- `Responses` — one record per row, with `Question No. | Question Text` headers and answer values
- `Question_Answer` — normalized question/answer view
- `Data_Quality` — completeness and unmapped-field audit
- `Stored_Answers` — exactly what normalized MySQL storage contains
- `TAI_Screening` for Forms A–D
- `Problem_Master`
- `Villages`

The Complete Survey Workbook contains response, Q/A, quality and stored-answer sheets for every Form 0–F, plus TAI screening sheets for A–D and both master sheets.

## Important deployment rule
Keep `.env` only on the deployment machine; do not commit or distribute database passwords in the ZIP.
