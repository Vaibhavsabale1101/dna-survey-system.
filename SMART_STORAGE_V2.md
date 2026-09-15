# Smart Survey Storage v2

This version strengthens survey data storage and Excel export.

## What changed

1. `survey_records.data_json` is retained as the complete source payload.
2. A new normalized `survey_answers` table mirrors every submitted field path and answer.
3. The API automatically creates/backfills `survey_answers` on startup, so existing records are preserved.
4. Every future save/import updates both JSON storage and normalized answer storage in one transaction.
5. Excel exports no longer show truly blank cells for expected questions; missing answers are labelled `Not Answered`.
6. `Question_Answer` includes question number, exact question label, field path, answer and answer status.
7. `Stored_Answers` proves what is actually stored in the database for every field.
8. `Data_Quality` reports completeness and missing question numbers per survey record.
9. Form 0 sanctioned works are exported dynamically; all added work rows are included.
10. Duplicate metadata fields such as `Gp Type.0`, `Occupation.0...10`, and `Confirmation.0` are no longer emitted as fake `Additional stored field` columns.

## Important

A genuinely unanswered question is not fabricated. It is explicitly exported as `Not Answered`, and the Data_Quality sheet flags it. This makes missing data visible instead of silently leaving empty cells.
