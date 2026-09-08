const test = require('node:test');
const assert = require('node:assert/strict');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { load } = require('./support/load.cjs');
const { DATA_ENTRY_TEXT: t } = require('../lib/dataEntryFields');
const Table = load('components/DataEntryFieldsTable.js').default;
test('printed table contains four columns, all types and multiline notes', () => {
  const html = renderToStaticMarkup(React.createElement(Table, { fields: ['number','date','text'].map((data_type, i) => ({ field_name: 'Field '+i, data_type, remarks: 'Line one\nLine two' })), remarks: 'General\nTerms' }));
  assert.equal((html.match(/<th /g) || []).length, 4);
  for (const type of ['number','date','text']) assert.ok(html.includes(t[type]));
  assert.ok(html.includes('Line one\nLine two')); assert.ok(html.includes('General\nTerms'));
});
test('table escapes malicious HTML as text', () => {
  const html = renderToStaticMarkup(React.createElement(Table, { fields: [{ field_name: '<img src=x onerror=alert(1)>', data_type: 'text', remarks: '<script>bad()</script>' }], remarks: '<b>plain text</b>' }));
  assert.ok(!html.includes('<script>')); assert.ok(!html.includes('<img src=x'));
  assert.ok(html.includes('&lt;script&gt;')); assert.ok(html.includes('&lt;b&gt;plain text&lt;/b&gt;'));
});
test('legacy empty table displays an explicit empty state', () => {
  const html = renderToStaticMarkup(React.createElement(Table));
  assert.ok(html.includes(t.empty)); assert.ok(html.includes('colSpan="4"') || html.includes('colspan="4"'));
});
