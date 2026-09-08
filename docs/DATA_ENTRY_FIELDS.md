# Customer-requested data-entry fields

## Scope

This update adds an optional list of field definitions to data-entry evaluations.
It does not collect actual customer records and does not dynamically create SQL
columns. The original overall `data_type` selector is retained. Scanning forms,
image requirements and breakdown calculations keep their existing behavior.

Each added row requires a field name and an explicit `number`, `date`, or `text`
selection. Each row also has optional free-text remarks. A separate optional
remarks box applies to the whole data-entry evaluation. Rows can be added and
removed before saving. Editing an already saved evaluation is not part of this
update; the original application has no update endpoint for that workflow.

The same read-only table is used in the pre-save summary and the saved report.
Use the existing **Print** button in the saved evaluation detail. Long notes wrap,
line breaks are preserved, controls are hidden, and table headers repeat in print.
There is no new unsaved-report Print button and no change to the breakdown Excel
export. Field definitions are printed with the evaluation, not the cost export.

## Data model

```text
"X_SalesApp".evaluations.id
    |
    +-- data_entry_details.evaluation_id  [existing detail relation]
    |       remarks TEXT NOT NULL DEFAULT ''  [new column]
    |
    +-- data_entry_fields.evaluation_id   [new FK, ON DELETE CASCADE]
            id SERIAL PRIMARY KEY
            field_name VARCHAR(200)
            data_type VARCHAR(10)  CHECK IN ('number','date','text')
            remarks TEXT
            sort_order INTEGER
            created_at TIMESTAMPTZ
```

`UNIQUE (evaluation_id, sort_order)` enforces one position per evaluation and
also indexes ordered evaluation lookups. The API assigns consecutive positions
based on the submitted array, not client-supplied IDs or sort orders. Names and
remarks are bound as query parameters; names are never interpolated into SQL.
Existing detail-to-evaluation relationships are not modified by this migration.

### Validation and compatibility

- Maximum 100 definitions per evaluation; 200 characters per name.
- Maximum 2,000 characters per field remark; 5,000 for general remarks.
- Browser/API character limits use JavaScript string length (UTF-16 units).
- New rows need a nonblank name and a supported type. Incomplete rows must be
  completed or removed. Duplicate names are not prohibited by this update.
- Missing `fields` and `remarks` remain valid for requests from the old UI.
- Older evaluations return an empty list and show an explicit empty-state row.
- Invalid API input returns HTTP 400 before a database connection is acquired.
- A missing new schema object produces an actionable error, not silent loss of
  the agreed field definitions. Deploy the migration before the application.

## Deployment gate: not yet verified against a live PostgreSQL database

No production credentials were used and no live SQL/deployment was performed.
The supplied ER image does not provide column types or permissions in full.
The migration assumes `evaluations.id` is INTEGER, consistent with the existing
project migration `001_breakdown_feature.sql`. Confirm this below; if the real
key is BIGINT, review/change the new `evaluation_id` to BIGINT before running.
Objects already using the proposed names must be compared before proceeding.

```sql
SELECT current_database(), current_user;
SELECT table_name, column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'X_SalesApp'
  AND ((table_name = 'evaluations' AND column_name = 'id')
    OR table_name = 'data_entry_fields'
    OR (table_name = 'data_entry_details' AND column_name = 'remarks'))
ORDER BY table_name, ordinal_position;
```

### 1. Prepare and test on staging

Back up the database/schema and confirm the restore procedure. Create a feature
branch and compare the delivered patch against the current repository, rather
than overwriting any newer work. The application root is `sales-evaluation-system/`,
not the unrelated nested `readflow-ocr/` project retained in the full archive.

Use a separate staging PostgreSQL database with a copy of the existing schema.
In DBeaver verify the database and schema, then execute the WHOLE file
`sql/003_data_entry_fields.sql` as a script. Do not rerun migrations 001/002 merely
to add this feature to a database where those features already exist.

The script uses a transaction, `lock_timeout = '5s'` and
`statement_timeout = '60s'`. Additive DDL can still briefly take locks; these
settings are not a guarantee of zero service impact. If any statement fails,
stop, execute `ROLLBACK;` in the same session if needed, investigate, and rerun
the whole script. Do not ignore errors or continue deployment after a failure.
`IF NOT EXISTS` permits an ordinary rerun of this migration; it does not validate
or repair unrelated preexisting objects with the same names.

Run `sql/003_verify_data_entry_fields.sql`. If the migration is run by a role
different from the application role, verify privileges as the app role as well.
Substitute the actual `DB_USER` role for `app_role` in the following example;
do not grant new privileges to PUBLIC:

```sql
GRANT USAGE ON SCHEMA "X_SalesApp" TO "app_role";
GRANT SELECT, INSERT ON TABLE "X_SalesApp".data_entry_fields TO "app_role";
GRANT USAGE, SELECT ON SEQUENCE "X_SalesApp".data_entry_fields_id_seq TO "app_role";
```

Existing table-level SELECT/INSERT grants on `data_entry_details` normally cover
its added column. Review column-specific grants separately if your role uses
those instead of table-level privileges.

```bash
npm ci
npm test
npm run build
```

Use Vercel Preview for the feature branch. Preview environment variables MUST
point to staging, not production: `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`,
`DB_PASSWORD`. A Preview URL alone does not isolate writes when it shares the
production database credentials. Keep the existing production values unchanged.
No additional environment variables are required by this feature.

### 2. Acceptance checks against actual PostgreSQL

Create a data-entry evaluation with three definitions covering text, date and
number, multiline per-field remarks and multiline general remarks. Add/delete
a row, navigate back and forward, attach an image as required by the existing
workflow, review the summary and save. Reopen via the list and Print. Confirm
all field definitions, their order and both kinds of remarks match.

Using its saved evaluation ID, confirm database contents:

```sql
SELECT field_name, data_type, remarks, sort_order
FROM "X_SalesApp".data_entry_fields
WHERE evaluation_id = 123
ORDER BY sort_order, id;

SELECT remarks
FROM "X_SalesApp".data_entry_details
WHERE evaluation_id = 123;
```

Also reopen an older evaluation with no fields, create a scanning evaluation,
confirm images and cost breakdown still work, and check a long printed report.
Test migration reruns, foreign-key/check/unique constraints, actual rollback
behavior and app-role grants on staging. Those SQL-engine checks have not been
executed in the supplied local test environment.

### 3. Production rollout

After staging acceptance and a successful production build: back up production,
run migration 003 there during an appropriate low-traffic window, verify it and
the application role, THEN deploy the application. Keep the schema and
application changes in this order; deploying first causes new data-entry
requests to fail until the migration is present. Perform a controlled post-deploy
smoke test without introducing real customer-sensitive content into test records.

### Rollback without deleting new agreement data

Restore/redeploy the previous application version but KEEP the new table and
remarks column. The prior code uses explicit INSERT column lists, so the added
column's default allows the earlier write path to continue; the earlier UI simply
does not display new definitions. Do not drop the table/column as a routine
rollback, because saved definitions and remarks would be lost. Back up/export
these data and plan a separate reviewed cleanup only if genuinely necessary.

## Testing supplied with the package

`npm test` runs 39 automated tests with Node's built-in test runner. Tests cover
validation, limits, whitespace/line breaks, safe rendered text, legacy payloads,
ordered child reads, parameter binding, transaction statement ordering, rollback
calls on failures, image-transfer transaction ordering and unsupported methods.
API tests mock the database; they do not execute PostgreSQL SQL.

Offline browser QA uses the actual React components, transpiled with Next's
bundled Babel, and mocked fetch results. It passed 11 scenarios, including a
390px-wide editor and a 100-field report with a long note printed over 7 A4 pages.
All 100 row labels were extracted from the PDF; headers repeat across pages.
This harness is not a Next.js routing, deployment or real-database integration test.

```bash
node tests/browser/build-harness.cjs /tmp/fields-browser
python tests/browser/smoke.py /tmp/fields-browser /tmp/fields-qa
```

The optional browser QA needs Python Playwright, Chromium and PyMuPDF. These are
not added as application dependencies. `docs/TEST_RESULTS.md` records the test
scope and the production-build limitation.

## Boundaries and security notes

No package versions were upgraded: Next.js remains 14.0.0 and React remains
18.2.0, as in the uploaded project. This change is not a dependency/security
upgrade. Review current official advisories and test upgrades separately.
Existing authentication/authorization and TLS settings are unchanged and were
not audited. No promise of production readiness or deployment is made by these
local tests. Protect access to the existing evaluation APIs using your project's
normal controls before exposing customer-sensitive information.

The delivered archives omit `.env.local`, `node_modules`, `.next`, `.git`, macOS
metadata and compiled/native dependencies. `.env.example` contains placeholders
only. Never commit real credentials. Do not replace your production values with
the placeholders.

## Official references

- PostgreSQL ALTER TABLE: https://www.postgresql.org/docs/current/sql-altertable.html
- PostgreSQL constraints: https://www.postgresql.org/docs/current/ddl-constraints.html
- node-postgres transactions: https://node-postgres.com/features/transactions
- node-postgres parameterized queries: https://node-postgres.com/features/queries
- Vercel environments: https://vercel.com/docs/deployments/environments
- Next.js API routes: https://nextjs.org/docs/14/pages/building-your-application/routing/api-routes
