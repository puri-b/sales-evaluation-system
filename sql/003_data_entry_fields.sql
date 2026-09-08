-- 003: Customer-requested data-entry field definitions + free-text remarks.
-- Run the WHOLE script in DBeaver against the intended database BEFORE deploying.
-- Take a backup first. Test against staging first. No existing rows are deleted.
-- Assumes evaluations.id is INTEGER, as used by the existing project migrations.
-- Execute with the schema owner; see docs/DATA_ENTRY_FIELDS.md for app-role grants.
BEGIN;
SET LOCAL lock_timeout = '5s';
SET LOCAL statement_timeout = '60s';

ALTER TABLE "X_SalesApp".data_entry_details
  ADD COLUMN IF NOT EXISTS remarks TEXT NOT NULL DEFAULT '';

CREATE TABLE IF NOT EXISTS "X_SalesApp".data_entry_fields (
  id SERIAL PRIMARY KEY,
  evaluation_id INTEGER NOT NULL
    REFERENCES "X_SalesApp".evaluations(id) ON DELETE CASCADE,
  field_name VARCHAR(200) NOT NULL
    CHECK (length(btrim(field_name)) > 0),
  data_type VARCHAR(10) NOT NULL
    CHECK (data_type IN ('number', 'date', 'text')),
  remarks TEXT NOT NULL DEFAULT ''
    CHECK (char_length(remarks) <= 2000),
  sort_order INTEGER NOT NULL
    CHECK (sort_order BETWEEN 1 AND 100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT data_entry_fields_evaluation_order_unique UNIQUE (evaluation_id, sort_order)
);
-- The UNIQUE index already supports lookups by evaluation_id and ordered reads.
COMMENT ON TABLE "X_SalesApp".data_entry_fields IS
  'Customer-requested field definitions for a data-entry evaluation; not actual customer records.';
COMMENT ON COLUMN "X_SalesApp".data_entry_details.remarks IS
  'General free-text remarks for the data-entry evaluation.';
COMMENT ON COLUMN "X_SalesApp".data_entry_fields.data_type IS
  'Agreed input type label only: number, date, text. Does not create database columns.';
COMMIT;

-- If a statement fails, stop deployment, execute ROLLBACK in this same session,
-- investigate the error, then re-run the WHOLE script. Do not continue on errors.
-- Same-schema re-runs are supported by IF NOT EXISTS. This is NOT a schema repair
-- script: if objects with these names already existed, compare their definitions.
