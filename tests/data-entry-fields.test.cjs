const test = require('node:test');
const assert = require('node:assert/strict');
const { validateDataEntryFields: validate, DataEntryValidationError, DATA_ENTRY_LIMITS: limits } = require('../lib/dataEntryFields');
const field = (overrides = {}) => ({ field_name: 'Document ID', data_type: 'text', remarks: '', ...overrides });
const fails = (input, path) => assert.throws(() => validate(input), (error) => error instanceof DataEntryValidationError && error.details.some((item) => item.path === path));

test('old payload without new properties remains valid', () => assert.deepEqual(validate({ software_used: 'Excel' }), { fields: [], remarks: '' }));
test('all three types and original order are preserved', () => {
  const result = validate({ fields: ['number', 'date', 'text'].map((data_type) => field({ data_type })) });
  assert.deepEqual(result.fields.map((f) => f.data_type), ['number', 'date', 'text']);
  assert.deepEqual(result.fields.map((f) => f.sort_order), [1, 2, 3]);
});
test('normalization trims names and strips client keys / supplied order', () => {
  assert.deepEqual(validate({ fields: [field({ field_name: '  ID  ', _key: 'local', sort_order: 99, id: 6 })] }).fields,
    [{ field_name: 'ID', data_type: 'text', remarks: '', sort_order: 1 }]);
});
test('Thai and multiline free text survive without HTML interpolation', () => {
  const note = '\u0e2b\u0e21\u0e32\u0e22\u0e40\u0e2b\u0e15\u0e38\n<script>alert(1)</script>';
  const result = validate({ fields: [field({ remarks: note })], remarks: note });
  assert.equal(result.fields[0].remarks, note);
  assert.equal(result.remarks, note);
});
test('line endings normalize but spaces and blank lines are retained', () => {
  const result = validate({ fields: [field({ remarks: ' A\r\n\r\nB\rC ' })], remarks: 'x\r\ny' });
  assert.equal(result.fields[0].remarks, ' A\n\nB\nC ');
  assert.equal(result.remarks, 'x\ny');
});
test('general remarks can be provided without any fields', () => assert.equal(validate({ remarks: 'Terms' }).remarks, 'Terms'));
test('invalid data-entry object is rejected', () => [null, undefined, [], 7, 'data'].forEach((input) => fails(input, 'data_entry_data')));
test('fields must be an array when supplied', () => [null, {}, '[]', 1].forEach((fields) => fails({ fields }, 'fields')));
test('every row must be an object', () => [null, [], 7, 'text'].forEach((value) => fails({ fields: [value] }, 'fields.0')));
test('empty, missing and whitespace-only field names are rejected', () => ['', '  \n ', null, undefined].forEach((name) => fails({ fields: [field({ field_name: name })] }, 'fields.0.field_name')));
test('names cannot be objects or numbers', () => [42, {}, []].forEach((name) => fails({ fields: [field({ field_name: name })] }, 'fields.0.field_name')));
test('unsupported and missing data types are rejected', () => ['boolean', 'Date', '', null, undefined, {}, "text'); DROP TABLE x; --"].forEach((data_type) => fails({ fields: [field({ data_type })] }, 'fields.0.data_type')));
test('remarks must be text; omitted/null remarks normalize to empty', () => {
  fails({ remarks: { text: 'x' } }, 'remarks');
  fails({ fields: [field({ remarks: 42 })] }, 'fields.0.remarks');
  assert.equal(validate({ fields: [field({ remarks: null })], remarks: null }).fields[0].remarks, '');
});
test('null bytes cannot reach PostgreSQL text columns', () => {
  fails({ remarks: 'a\0b' }, 'remarks');
  fails({ fields: [field({ field_name: 'a\0b' })] }, 'fields.0.field_name');
  fails({ fields: [field({ remarks: 'a\0b' })] }, 'fields.0.remarks');
});
test('field count accepts the boundary and rejects overflow', () => {
  assert.equal(validate({ fields: Array.from({ length: limits.fields }, () => field()) }).fields.length, limits.fields);
  fails({ fields: Array.from({ length: limits.fields + 1 }, () => field()) }, 'fields');
});
test('name length accepts the boundary and rejects overflow', () => {
  assert.equal(validate({ fields: [field({ field_name: 'a'.repeat(limits.fieldName) })] }).fields[0].field_name.length, limits.fieldName);
  fails({ fields: [field({ field_name: 'a'.repeat(limits.fieldName + 1) })] }, 'fields.0.field_name');
});
test('per-field remarks enforce their length bound', () => {
  assert.equal(validate({ fields: [field({ remarks: 'a'.repeat(limits.fieldRemarks) })] }).fields[0].remarks.length, limits.fieldRemarks);
  fails({ fields: [field({ remarks: 'a'.repeat(limits.fieldRemarks + 1) })] }, 'fields.0.remarks');
});
test('general remarks enforce their length bound', () => {
  assert.equal(validate({ remarks: 'a'.repeat(limits.remarks) }).remarks.length, limits.remarks);
  fails({ remarks: 'a'.repeat(limits.remarks + 1) }, 'remarks');
});
test('validation does not mutate its input', () => {
  const input = Object.freeze({ fields: Object.freeze([Object.freeze(field({ field_name: ' ID ' }))]) });
  validate(input);
  assert.equal(input.fields[0].field_name, ' ID ');
});
