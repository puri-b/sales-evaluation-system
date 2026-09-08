-- Read-only checks after migration. Run with the application's database role too.
SELECT current_database(), current_user;
SELECT table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'X_SalesApp'
  AND ((table_name = 'data_entry_details' AND column_name = 'remarks')
    OR table_name = 'data_entry_fields')
ORDER BY table_name, ordinal_position;

SELECT conname, pg_get_constraintdef(oid) AS definition
FROM pg_constraint
WHERE conrelid = '"X_SalesApp".data_entry_fields'::regclass;

SELECT
  has_table_privilege(current_user, '"X_SalesApp".data_entry_fields', 'SELECT') AS can_read_fields,
  has_table_privilege(current_user, '"X_SalesApp".data_entry_fields', 'INSERT') AS can_insert_fields,
  has_sequence_privilege(current_user, '"X_SalesApp".data_entry_fields_id_seq', 'USAGE') AS can_use_sequence;

-- Replace 123 with an evaluation ID saved from the new data-entry form.
-- SELECT field_name, data_type, remarks, sort_order
-- FROM "X_SalesApp".data_entry_fields
-- WHERE evaluation_id = 123 ORDER BY sort_order, id;
