"""Browser smoke tests of real components with MOCKED API responses.
Usage: node tests/browser/build-harness.cjs /tmp/fields-browser
       python tests/browser/smoke.py /tmp/fields-browser /tmp/fields-qa
Requires playwright (Python), Chromium and PyMuPDF for PDF assertions.
No production DB connection. No Next.js compilation is claimed by this harness.
"""
import base64
import functools
import json
import re
import shutil
import sys
import threading
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

source = Path(sys.argv[1]).resolve()
out = Path(sys.argv[2]).resolve()
out.mkdir(parents=True, exist_ok=True)
html = (source/'index.html').read_text()
html = html.replace('<link rel="stylesheet" href="style.css">', '<style>'+(source/'style.css').read_text()+'</style>')
for filename in ['react.js','react-dom.js','bundle.js']:
    html = html.replace(f'<script src="{filename}"></script>', '<script>(()=>{'+(source/filename).read_text()+'})()</script>')
fetch_stub = """<script>
window.fetch = async (url, options={}) => {
  const payload = typeof options.body === 'string' ? JSON.parse(options.body) : null;
  const data = await window.mockApiRequest(String(url), options.method || 'GET', payload);
  return {ok:true, status:200, json:async()=>data};
};
</script>"""
html = html.replace('<div id="root"></div>', '<div id="root"></div>'+fetch_stub)

def load_page(page):
    page.goto('about:blank')
    page.set_content(html, wait_until='load')

next_text = '\u0e16\u0e31\u0e14\u0e44\u0e1b'
back_text = '\u0e22\u0e49\u0e2d\u0e19\u0e01\u0e25\u0e31\u0e1a'
view_all = '\u0e14\u0e39\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14'
view_detail = '\u0e14\u0e39\u0e23\u0e32\u0e22\u0e25\u0e30\u0e40\u0e2d\u0e35\u0e22\u0e14'
save_text = '\u0e1a\u0e31\u0e19\u0e17\u0e36\u0e01\u0e02\u0e49\u0e2d\u0e21\u0e39\u0e25'
png = base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j3ioAAAAASUVORK5CYII=')
saved = {}
payloads = []
base = {'evaluation_date': '2026-09-08', 'created_at': '2026-09-08T00:00:00Z', 'salesperson_name': 'Sales Demo', 'customer_name': 'Customer Demo', 'image_count': 0, 'images': []}
saved[900] = {**base, 'id': 900, 'service_type': 'data_entry', 'service_details': {'software_used': 'Excel', 'fields': [], 'remarks': ''}}
saved[901] = {**base, 'id': 901, 'service_type': 'scanning', 'service_details': {'doc_count': 100, 'doc_type': 'A4', 'scan_mode': 'color'}}

def mock_api(url, method, body):
    path = url.split('/api/', 1)[1]
    if path == 'evaluations' and method == 'POST':
        payloads.append(body)
        saved[321] = {**base, **{k: body[k] for k in ['service_type','evaluation_date','salesperson_name','customer_name']}, 'id':321, 'service_details':body['data_entry_data']}
        return {'success':True,'evaluation_id':321}
    if path == 'evaluations':
        return {'success':True, 'data':[saved[k] for k in sorted(saved)]}
    if re.fullmatch(r'evaluations/\d+', path):
        return {'success':True, 'data':saved[int(path.split('/')[1])]}
    if path.startswith('breakdown/'):
        return {'success':True,'data':None}
    if path == 'upload':
        return {'success':True, 'files':[{'id':1, 'name':'sample.png', 'mimetype':'image/png','size':len(png)}]}
    raise AssertionError('Unexpected API call '+path)

checks = []
with sync_playwright() as p:
    browser = p.chromium.launch(executable_path=shutil.which('chromium'), headless=True, args=['--no-sandbox'])
    page = browser.new_page(viewport={'width':1280, 'height':1000}, locale='th-TH')
    page_errors = []
    page.on('pageerror', lambda e: page_errors.append(str(e)))
    page.expose_function('mockApiRequest', mock_api)
    load_page(page)
    page.locator('h4').nth(1).click()
    page.locator('input[type=date]').fill('2026-09-08')
    page.get_by_role('button').nth(1).click()
    page.locator('input[type=text]').nth(0).fill('Sales Demo')
    page.locator('input[type=text]').nth(1).fill('Customer Demo')
    page.locator('select').nth(0).select_option('Excel')
    page.locator('select').nth(1).select_option(index=1)
    page.locator('input[type=number]').nth(0).fill('10')
    page.locator('input[type=number]').nth(1).fill('1000')
    for index in [2,3,4]: page.locator('select').nth(index).select_option(index=1)
    t = page.evaluate('window.fieldText')
    add = page.get_by_role('button', name=t['add'], exact=True)
    add.click()
    page.get_by_role('button', name=next_text, exact=True).click()
    expect(page.get_by_role('alert')).to_be_visible()
    expect(page.locator('.data-entry-field-row')).to_have_count(1)
    checks.append('blank added row blocks Next with inline validation')

    names = ['\u0e40\u0e25\u0e02\u0e17\u0e35\u0e48\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23', '\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e40\u0e2d\u0e01\u0e2a\u0e32\u0e23', '\u0e08\u0e33\u0e19\u0e27\u0e19\u0e40\u0e07\u0e34\u0e19']
    types = ['text','date','number']
    notes = ['Keep leading zeros, e.g. 00125', 'DD/MM/YYYY\nCalendar: AD', 'Two decimal places']
    for i in range(3):
        if i: add.click()
        row=page.locator('.data-entry-field-row').nth(i)
        row.locator('input').fill(names[i])
        row.locator('select').select_option(types[i])
        row.locator('textarea').fill(notes[i])
    add.click()
    page.locator('.data-entry-field-row').nth(3).locator('input').fill('Temporary row')
    page.locator('.data-entry-field-row').nth(3).locator('button').click()
    expect(page.locator('.data-entry-field-row')).to_have_count(3)
    for i in range(3):
        expect(page.locator('.data-entry-field-row').nth(i).locator('input')).to_have_value(names[i])
    checks.append('add/remove preserves remaining row values and order')
    general = 'Customer-reviewed field definitions\nDo not infer unreadable values.'
    page.locator('.data-entry-general-remarks textarea').fill(general)
    page.locator('.data-entry-fields-editor').screenshot(path=str(out/'form-desktop.png'))
    page.set_viewport_size({'width':390,'height':844})
    page.locator('.data-entry-fields-editor').screenshot(path=str(out/'form-mobile.png'))
    assert page.locator('.data-entry-field-row').first.evaluate('(e)=>e.scrollWidth<=e.clientWidth+2')
    checks.append('field editor fits a 390px mobile viewport')
    page.set_viewport_size({'width':1280,'height':1000})
    page.get_by_role('button', name=next_text, exact=True).click()
    page.get_by_role('button', name=back_text, exact=True).click()
    expect(page.locator('.data-entry-field-row')).to_have_count(3)
    expect(page.locator('.data-entry-general-remarks textarea')).to_have_value(general)
    checks.append('field definitions and remarks survive back/next navigation')
    page.get_by_role('button', name=next_text, exact=True).click()
    page.locator('input[type=file]').set_input_files({'name':'sample.png','mimeType':'image/png','buffer':png})
    expect(page.locator('img')).to_have_count(1)
    page.get_by_role('button', name=next_text, exact=True).click()
    expect(page.locator('.data-entry-fields-table tbody tr')).to_have_count(3)
    expect(page.locator('.data-entry-fields-report')).to_contain_text(general)
    checks.append('pre-save summary renders the same field definitions and remarks')
    page.get_by_role('button', name=save_text, exact=True).click()
    expect(page.get_by_role('button', name=view_all, exact=True)).to_be_visible()
    assert len(payloads) == 1
    assert [f['data_type'] for f in payloads[0]['data_entry_data']['fields']] == types
    assert all('_key' not in f for f in payloads[0]['data_entry_data']['fields'])
    checks.append('save payload includes all fields/remarks but no React keys')
    page.get_by_role('button', name=view_all, exact=True).click()
    page.get_by_role('button', name=view_detail, exact=True).first.click()
    expect(page.locator('.data-entry-fields-table tbody tr')).to_have_count(3)
    page.get_by_role('button', name=re.compile('Print')).click()
    assert page.evaluate('window.printCalls') == 1
    page.emulate_media(media='print')
    expect(page.get_by_role('button', name=re.compile('Print'))).to_be_hidden()
    assert page.locator('.data-entry-fields-table thead').evaluate('(e)=>getComputedStyle(e).display') == 'table-header-group'
    page.pdf(path=str(out/'print-sample.pdf'), format='A4', margin={'top':'12mm','bottom':'12mm','left':'12mm','right':'12mm'})
    checks.append('saved detail calls Print, hides controls and keeps the table in print output')

    # Large-report PDF: all rows must survive multi-page printing.
    saved[321]['service_details']['fields'] = [
        {'field_name':f'Field {i:03d}', 'data_type':types[i % 3], 'remarks':'Line one\nLine two', 'sort_order':i}
        for i in range(1,101)
    ]
    saved[321]['service_details']['fields'][40]['remarks'] = ('Long note wrapping. ' * 100).strip()
    page.emulate_media(media='screen')
    load_page(page)
    page.get_by_role('button', name=view_all, exact=True).click()
    page.get_by_role('button', name=view_detail, exact=True).first.click()
    expect(page.locator('.data-entry-fields-table tbody tr')).to_have_count(100)
    page.emulate_media(media='print')
    page.pdf(path=str(out/'print-100-fields.pdf'), format='A4', margin={'top':'12mm','bottom':'12mm','left':'12mm','right':'12mm'})
    import fitz
    doc = fitz.open(out/'print-100-fields.pdf')
    all_text = '\n'.join(page_.get_text() for page_ in doc)
    for i in range(1,101): assert f'Field {i:03d}' in all_text, f'Missing printed row {i}'
    assert len(doc) > 1
    for page_ in doc:
        if 'Field ' in page_.get_text(): assert 'Data Type' in page_.get_text()
    for i in [0,1,len(doc)-1]:
        doc[i].get_pixmap(matrix=fitz.Matrix(1.25,1.25)).save(out/f'print-100-page-{i+1}.png')
    checks.append(f'100 fields and a long note survive {len(doc)} PDF pages with repeated headers')
    pages = len(doc)
    doc.close()
    doc=fitz.open(out/'print-sample.pdf')
    doc[0].get_pixmap(matrix=fitz.Matrix(1.5,1.5)).save(out/'print-sample-page-1.png')
    doc.close()

    # Old data-entry and scanning records still render separately.
    page.emulate_media(media='screen')
    load_page(page)
    page.get_by_role('button', name=view_all, exact=True).click()
    page.get_by_role('button', name=view_detail, exact=True).nth(1).click()
    expect(page.locator('.data-entry-fields-table')).to_contain_text(t['empty'])
    checks.append('legacy data-entry record displays an explicit empty field list')
    load_page(page)
    page.get_by_role('button', name=view_all, exact=True).click()
    page.get_by_role('button', name=view_detail, exact=True).nth(2).click()
    expect(page.locator('.print-report-root')).to_be_visible()
    expect(page.locator('.data-entry-fields-table')).to_have_count(0)
    checks.append('scanning detail does not display data-entry field definitions')
    assert not page_errors, page_errors
    checks.append('no browser runtime exceptions')
    browser.close()
result={'environment':'Chromium / React component harness; API mocked; no production DB', 'checks':checks, 'passed':len(checks), 'print_pages_100_fields':pages}
(out/'browser-results.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
