// Transpile the project's existing ES modules / JSX with Next's bundled Babel.
// No production DB module is loaded: API tests MUST provide a db mock.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { createRequire } = require('node:module');
const babel = require('next/dist/compiled/babel/core');
const root = path.resolve(__dirname, '../..');
const compiled = new Map();
function load(relative, mocks = {}) {
  const cache = new Map();
  function read(file) {
    file = path.resolve(file);
    const key = path.relative(root, file).replaceAll(path.sep, '/');
    if (Object.hasOwn(mocks, key)) return mocks[key];
    if (file === path.join(root, 'lib/db.js')) throw new Error('Production database access is prohibited in tests.');
    if (cache.has(file)) return cache.get(file).exports;
    if (file.includes(`${path.sep}node_modules${path.sep}`) || file.endsWith('lib/dataEntryFields.js')) return require(file);
    const m = { exports: {} };
    cache.set(file, m);
    if (!compiled.has(file)) {
      compiled.set(file, babel.transformSync(fs.readFileSync(file, 'utf8'), {
        filename: file, configFile: false, babelrc: false,
        presets: [[require.resolve('next/dist/compiled/babel/preset-react'), { runtime: 'automatic' }]],
        plugins: [require.resolve('next/dist/compiled/babel/plugin-transform-modules-commonjs')],
      }).code);
    }
    const nativeRequire = createRequire(file);
    const localRequire = (name) => name.startsWith('.') ? read(nativeRequire.resolve(name)) : nativeRequire(name);
    const fn = vm.runInThisContext(`(function(require,module,exports,__filename,__dirname,console){${compiled.get(file)}\n})`, { filename: file });
    fn(localRequire, m, m.exports, file, path.dirname(file), { ...console, error() {} });
    return m.exports;
  }
  return read(path.join(root, relative));
}
module.exports = { load };
