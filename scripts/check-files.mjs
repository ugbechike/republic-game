import { readdir, readFile } from 'node:fs/promises';
const violations = [];
async function walk(dir) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.next', '.git', '.data'].includes(e.name)) continue;
    const p = `${dir}/${e.name}`;
    if (e.isDirectory()) await walk(p);
    else if (/\.(tsx?|mjs|css)$/.test(p)) {
      const lines = (await readFile(p, 'utf8')).trimEnd().split('\n').length;
      if (lines > 250) violations.push(`${p}: ${lines} lines`);
    }
  }
}
await walk('.');
if (violations.length) { console.error(violations.join('\n')); process.exit(1); }
console.log('All source files are at most 250 lines.');
