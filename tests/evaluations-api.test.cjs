const test = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./support/load.cjs');
const { DATA_ENTRY_TEXT } = require('../lib/dataEntryFields');
function response() {
  return { code: 200, headers: {}, status(value) { this.code = value; return this; }, json(value) { this.body = value; return this; }, setHeader(k,v) { this.headers[k]=v; }, end(value) { this.body=value; } };
}
function dbMock({ failOn, failCode, rowsFor, connectionError } = {}) {
  const calls = []; let connected = 0; let released = 0;
  async function query(sql, params) {
    calls.push({ sql, params });
    if (failOn && sql.includes(failOn)) throw Object.assign(new Error('private failure detail'), { code: failCode || 'XX000' });
    if (rowsFor) return { rows: rowsFor(sql, params) || [] };
    if (sql.includes('INSERT INTO "X_SalesApp".evaluations')) return { rows: [{ id: 321 }] };
    if (sql.includes('SELECT filename, mime_type, file_data')) return { rows: [{ filename: 'test.png', mime_type: 'image/png', file_data: 'test' }] };
    return { rows: [] };
  }
  const db = { query, pool: { async connect() { connected++; if (connectionError) throw new Error('private password'); return { query, release() { released++; } }; } } };
  return { db, calls, get connected() { return connected; }, get released() { return released; } };
}
const entry = (extra = {}) => ({ service_type: 'data_entry', evaluation_date: '2026-09-08', salesperson_name: 'Test', customer_name: 'Demo', data_entry_data: { software_used: 'Excel', fields: [{ field_name: 'Amount', data_type: 'number', remarks: 'Two decimal places' }, { field_name: 'Date', data_type: 'date', remarks: 'DD/MM/YYYY' }], remarks: 'Agreed\nNotes' }, images: [], ...extra });
async function post(body, options = {}) {
  const mock = dbMock(options), res = response();
  await load('pages/api/evaluations.js', { 'lib/db.js': mock.db }).default({ method: 'POST', body }, res);
  return { mock, res };
}
test('POST saves details, ordered fields and general remarks before one commit', async () => {
  const { mock, res } = await post(entry());
  assert.equal(res.code, 200); assert.equal(res.body.evaluation_id, 321);
  assert.equal(mock.connected, 1); assert.equal(mock.released, 1);
  assert.equal(mock.calls[0].sql, 'BEGIN'); assert.equal(mock.calls.at(-1).sql, 'COMMIT');
  const details = mock.calls.find((c) => c.sql.includes('INSERT INTO "X_SalesApp".data_entry_details'));
  assert.equal(details.params.length, 14); assert.equal(details.params[13], 'Agreed\nNotes');
  const fields = mock.calls.find((c) => c.sql.includes('INSERT INTO "X_SalesApp".data_entry_fields'));
  assert.equal(fields.params[0], 321);
  assert.deepEqual(JSON.parse(fields.params[1]).map((f) => f.sort_order), [1,2]);
});
test('field names and remarks are bound parameters, never SQL identifiers', async () => {
  const malicious = "Robert'); DROP TABLE evaluations; --";
  const { mock, res } = await post(entry({ data_entry_data: { fields: [{ field_name: malicious, data_type: 'text', remarks: malicious }] } }));
  assert.equal(res.code, 200);
  assert.ok(mock.calls.every((c) => !c.sql.includes(malicious)));
  assert.equal(JSON.parse(mock.calls.find((c) => c.sql.includes('jsonb_to_recordset')).params[1])[0].field_name, malicious);
});
test('old data-entry payload inserts empty remarks and no child fields', async () => {
  const { mock, res } = await post(entry({ data_entry_data: { software_used: 'Excel' } }));
  assert.equal(res.code, 200);
  assert.ok(!mock.calls.some((c) => c.sql.includes('data_entry_fields')));
  assert.equal(mock.calls.find((c) => c.sql.includes('data_entry_details')).params[13], '');
});
test('scan request uses its original detail path only', async () => {
  const { mock, res } = await post(entry({ service_type: 'scanning', data_entry_data: null, scanning_data: { document_sizes: [{ doc_type: 'A4', doc_count: '100' }, { doc_type: 'A3', doc_count: '25' }], scan_mode: 'color' } }));
  assert.equal(res.code, 200);
  assert.ok(!mock.calls.some((c) => c.sql.includes('data_entry')));
  assert.equal(mock.calls.find((c) => c.sql.includes('scanning_details')).params[1], 125);
});
test('malformed fields fail with 400 before any database connection', async () => {
  const { mock, res } = await post(entry({ data_entry_data: { fields: [{ field_name: '', data_type: 'boolean' }] } }));
  assert.equal(res.code, 400); assert.equal(mock.connected, 0); assert.ok(res.body.errors.length >= 2);
});
test('malformed body / missing details / unknown service do not write rows', async () => {
  for (const body of [null, [], 'text', entry({ data_entry_data: null }), entry({ service_type: 'unknown' })]) {
    const { mock, res } = await post(body);
    assert.equal(res.code, 400); assert.equal(mock.connected, 0);
  }
});
test('a field insert failure rolls back the parent and releases the client', async () => {
  const { mock, res } = await post(entry(), { failOn: 'INSERT INTO "X_SalesApp".data_entry_fields' });
  assert.equal(res.code, 500); assert.equal(mock.calls.at(-1).sql, 'ROLLBACK');
  assert.ok(!mock.calls.some((c) => c.sql === 'COMMIT')); assert.equal(mock.released, 1);
  assert.ok(!JSON.stringify(res.body).includes('private failure'));
});
test('a later image failure also rolls back field definitions', async () => {
  const { mock, res } = await post(entry({ images: [{ id: 1 }] }), { failOn: 'INSERT INTO "X_SalesApp".evaluation_images' });
  assert.equal(res.code, 500); assert.ok(mock.calls.some((c) => c.sql.includes('jsonb_to_recordset')));
  assert.equal(mock.calls.at(-1).sql, 'ROLLBACK'); assert.equal(mock.released, 1);
});
test('successful image transfer stays inside the same transaction', async () => {
  const { mock, res } = await post(entry({ images: [{ id: 1 }] }));
  assert.equal(res.code, 200); assert.equal(mock.connected, 1); assert.equal(mock.calls.at(-1).sql, 'COMMIT');
  assert.ok(mock.calls.some((c) => c.sql.includes('DELETE FROM "X_SalesApp".temp_images')));
});
test('missing migration returns actionable 503 and rolls back', async () => {
  for (const failCode of ['42P01','42703']) {
    const { mock, res } = await post(entry(), { failOn: 'data_entry_details', failCode });
    assert.equal(res.code, 503); assert.equal(res.body.message, DATA_ENTRY_TEXT.migrationRequired);
    assert.equal(mock.calls.at(-1).sql, 'ROLLBACK');
  }
});
test('connection failures return a safe message', async () => {
  const { res } = await post(entry(), { connectionError: true });
  assert.equal(res.code, 500); assert.ok(!JSON.stringify(res.body).includes('private password'));
});
async function detail({ service = 'data_entry', fields = [], exists = true, failOn, failCode } = {}) {
  const mock = dbMock({ failOn, failCode, rowsFor(sql) {
    if (sql.includes('FROM "X_SalesApp".evaluations')) return exists ? [{ id: 321, service_type: service }] : [];
    if (sql.includes('FROM "X_SalesApp".data_entry_fields')) return fields;
    if (sql.includes('FROM "X_SalesApp".data_entry_details')) return [{ software_used: 'Excel', remarks: 'Agreed' }];
    if (sql.includes('FROM "X_SalesApp".scanning_details')) return [{ doc_count: 100 }];
    return [];
  } });
  const res = response();
  await load('pages/api/evaluations/[id].js', { 'lib/db.js': mock.db }).default({ method: 'GET', query: { id: '321' } }, res);
  return { mock, res };
}
test('GET returns stored fields and explicitly orders by sort_order and id', async () => {
  const fields = [{ id: 7, field_name: 'ID', data_type: 'text', remarks: '', sort_order: 1 }];
  const { mock, res } = await detail({ fields });
  assert.equal(res.code, 200); assert.deepEqual(res.body.data.service_details.fields, fields);
  assert.equal(res.body.data.service_details.remarks, 'Agreed');
  const read = mock.calls.find((c) => c.sql.includes('data_entry_fields'));
  assert.match(read.sql, /ORDER BY sort_order ASC, id ASC/); assert.deepEqual(read.params, ['321']);
});
test('GET old evaluation returns empty list, not an error', async () => {
  const { res } = await detail(); assert.deepEqual(res.body.data.service_details.fields, []);
});
test('GET scan evaluation does not query the new table', async () => {
  const { mock, res } = await detail({ service: 'scanning' });
  assert.equal(res.code, 200); assert.ok(!mock.calls.some((c) => c.sql.includes('data_entry')));
});
test('GET unknown evaluation remains 404', async () => {
  const { mock, res } = await detail({ exists: false }); assert.equal(res.code, 404); assert.equal(mock.calls.length, 1);
});
test('GET missing fields table fails clearly rather than printing an empty agreement', async () => {
  const { res } = await detail({ failOn: 'data_entry_fields', failCode: '42P01' });
  assert.equal(res.code, 503); assert.equal(res.body.message, DATA_ENTRY_TEXT.migrationRequired);
});
test('unsupported methods remain 405 without DB access', async () => {
  for (const file of ['pages/api/evaluations.js', 'pages/api/evaluations/[id].js']) {
    const mock = dbMock(), res = response();
    await load(file, { 'lib/db.js': mock.db }).default({ method: 'DELETE', query: { id: '321' } }, res);
    assert.equal(res.code, 405); assert.equal(mock.calls.length, 0);
  }
});
