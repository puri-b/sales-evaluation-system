// Offline browser QA of real React components. Does NOT replace a Next.js build.
// API calls are intercepted by smoke.py; never connects to the production DB.
const fs = require('node:fs');
const path = require('node:path');
const babel = require('next/dist/compiled/babel/core');
const root = path.resolve(__dirname, '../..');
const out = path.resolve(process.argv[2] || path.join(root, '.qa-browser'));
fs.mkdirSync(out, { recursive: true });
const files = ['pages/index.js', 'styles/glass.js', 'lib/dataEntryFields.js', 'lib/breakdownCalculator.js',
  ...fs.readdirSync(path.join(root, 'components')).filter((f) => f.endsWith('.js')).map((f) => `components/${f}`)];
let bundle = 'const modules = {}; const cache = {};\n';
for (const file of files) {
  const code = babel.transformSync(fs.readFileSync(path.join(root,file),'utf8'), {
    filename: path.join(root,file), configFile:false, babelrc:false,
    presets: [[require.resolve('next/dist/compiled/babel/preset-react'), { runtime:'classic' }]],
    plugins: [require.resolve('next/dist/compiled/babel/plugin-transform-modules-commonjs')],
  }).code;
  bundle += `modules[${JSON.stringify(file)}] = function(require, module, exports) {\n${code}\n};\n`;
}
bundle += `
function load(name, parent='') {
  if (name === 'react') return window.React;
  if (name.startsWith('.')) {
    const parts = parent.split('/'); parts.pop();
    for (const p of name.split('/')) { if(p === '..') parts.pop(); else if (p !== '.') parts.push(p); }
    name = parts.join('/');
    if (!name.endsWith('.js')) name += '.js';
  }
  if (cache[name]) return cache[name].exports;
  if (!modules[name]) throw new Error('Missing module: '+name);
  const module = { exports: {} }; cache[name] = module;
  modules[name]((target) => load(target, name), module, module.exports);
  return module.exports;
}
window.fieldText = load('lib/dataEntryFields.js').DATA_ENTRY_TEXT;
window.printCalls = 0; window.print = () => { window.printCalls++; };
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(React.createElement(load('pages/index.js').default));
`;
fs.writeFileSync(path.join(out, 'bundle.js'), bundle);
fs.copyFileSync(path.join(root,'node_modules/react/umd/react.development.js'), path.join(out,'react.js'));
fs.copyFileSync(path.join(root,'node_modules/react-dom/umd/react-dom.development.js'), path.join(out,'react-dom.js'));
fs.writeFileSync(path.join(out,'style.css'), ['styles/globals.css','styles/print.css'].map((file) => fs.readFileSync(path.join(root,file),'utf8')).join('\n'));
fs.writeFileSync(path.join(out,'index.html'), '<!doctype html><html lang="th"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><link rel="stylesheet" href="style.css"><title>Local component QA - mocked API</title></head><body><div id="root"></div><script src="react.js"></script><script src="react-dom.js"></script><script src="bundle.js"></script></body></html>');
console.log(out);
