# Excel Export Feature

## Data source
Exports are generated server-side directly from MySQL (`survey_records`, `tai_screenings`, `problem_catalog`, `villages`). The browser cache is not treated as the export source of truth.

## Form-wise workbook
- Responses: one survey record per row; headers contain question number + question text.
- Question_Answer: normalized one-question-per-row representation.
- TAI_Screening: Forms A-D only.
- Problem_Master
- Villages

## Complete workbook
- Form_0
- Form_A
- Form_B
- Form_C
- Form_D
- Form_E
- Form_F
- Problem_Master
- Villages

## API
- `GET /api/export/:formKey?village=VG1&screening=keep`
- `GET /api/export/all?village=VG1`

`village` is optional. `screening` is optional and applies to the Forms A-D TAI screening worksheet.
