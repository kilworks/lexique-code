// Every gate of the site in one command, each exit code read on its own. Exit 1 if any gate fails.
//   npm run verify            build, types, tests, banned characters, lexicon parity, bundle budget
//   npm run verify -- --live  same, then checks that the deployed page serves this build's assets
import { spawnSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const SITE = join(dirname(fileURLToPath(import.meta.url)), '..');
const REPO = join(SITE, '..');
const LIVE_URL = 'https://kilworks.github.io/lexique-code/';
// gzip bytes of the entry chunks; 100746b measured 65.4 KB JS and 5.5 KB CSS. Raise only with a written reason.
const BUDGET = { js: 66_000, css: 6_000 };
// en dash, em dash, curly single and double quotes
const BANNED = new RegExp('[' + [0x2013, 0x2014, 0x2018, 0x2019, 0x201c, 0x201d].map((c) => String.fromCharCode(c)).join('') + ']');

const results = [];
const gate = (name, ok, detail) => { results.push({ name, ok, detail }); console.log(`${ok ? 'ok  ' : 'FAIL'} ${name}${detail ? `: ${detail}` : ''}`); };

function run(name, cmd, args, cwd) {
  const r = spawnSync(cmd, args, { cwd, encoding: 'utf8', shell: process.platform === 'win32' });
  const tail = `${r.stdout || ''}${r.stderr || ''}`.trim().split('\n').slice(-3).join(' | ');
  gate(name, r.status === 0, r.status === 0 ? '' : `exit ${r.status}: ${tail}`);
}

function walk(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, out);
    else if (!p.endsWith('lexicon.json')) out.push(p); // generated, checked through its sources
  }
  return out;
}

run('build (data + tsc + vite)', 'npm', ['run', 'build'], SITE);
run('tests (vitest)', 'node', ['node_modules/vitest/vitest.mjs', 'run'], SITE);

const files = [...walk(join(SITE, 'src')), ...walk(join(SITE, 'scripts')), join(SITE, 'index.html'), ...walk(join(REPO, 'enrich'))];
const hits = files.filter((f) => BANNED.test(readFileSync(f, 'utf8')));
gate('no dash or curly quote', hits.length === 0, hits.map((f) => f.slice(REPO.length + 1)).join(', '));

run('lexicon parity (check.py)', process.platform === 'win32' ? 'python' : 'python3', ['check.py'], REPO);

let built = null;
try {
  const html = readFileSync(join(SITE, 'dist', 'index.html'), 'utf8');
  built = html.match(/assets\/index-[^"]+\.(js|css)/g) || [];
  for (const kind of ['js', 'css']) {
    const asset = built.find((a) => a.endsWith(`.${kind}`));
    const size = asset ? gzipSync(readFileSync(join(SITE, 'dist', asset))).length : Infinity;
    gate(`budget ${kind}`, size <= BUDGET[kind], `${size} / ${BUDGET[kind]} gzip bytes`);
  }
} catch (e) {
  gate('budget', false, `no dist/index.html (${e.message})`);
}

if (process.argv.includes('--live')) {
  try {
    const live = (await (await fetch(LIVE_URL)).text()).match(/assets\/index-[^"]+\.(js|css)/g) || [];
    const same = built && live.length > 0 && live.every((a) => built.includes(a)) && built.every((a) => live.includes(a));
    gate('live serves this build', !!same, `live ${live.join(' ')} / local ${(built || []).join(' ')}`);
  } catch (e) {
    gate('live serves this build', false, e.message);
  }
}

const failed = results.filter((r) => !r.ok).length;
console.log(`${results.length - failed}/${results.length} gates green`);
process.exit(failed ? 1 : 0);
