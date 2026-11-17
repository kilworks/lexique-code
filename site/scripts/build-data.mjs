// Build src/data/lexicon.json from ../LEXICON.md, ../LEXIQUE.md and ../enrich/*.json.
// Fails (exit 1, message naming the problem) on any mismatch: see SPEC "Data: single source of truth".
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export class DataError extends Error {}

// Unicode names of printable ASCII punctuation, enough for symbol-only words.
// A symbol outside this table fails the build so it gets named here on purpose.
const UNICODE_NAMES = {
  '!': 'EXCLAMATION MARK', '"': 'QUOTATION MARK', '#': 'NUMBER SIGN', '$': 'DOLLAR SIGN',
  '%': 'PERCENT SIGN', '&': 'AMPERSAND', "'": 'APOSTROPHE', '(': 'LEFT PARENTHESIS',
  ')': 'RIGHT PARENTHESIS', '*': 'ASTERISK', '+': 'PLUS SIGN', ',': 'COMMA',
  '-': 'HYPHEN-MINUS', '.': 'FULL STOP', '/': 'SOLIDUS', ':': 'COLON', ';': 'SEMICOLON',
  '<': 'LESS-THAN SIGN', '=': 'EQUALS SIGN', '>': 'GREATER-THAN SIGN', '?': 'QUESTION MARK',
  '@': 'COMMERCIAL AT', '[': 'LEFT SQUARE BRACKET', '\\': 'REVERSE SOLIDUS',
  ']': 'RIGHT SQUARE BRACKET', '^': 'CIRCUMFLEX ACCENT', _: 'LOW LINE', '{': 'LEFT CURLY BRACKET',
  '|': 'VERTICAL LINE', '}': 'RIGHT CURLY BRACKET', '~': 'TILDE',
};

export function slug(text) {
  const ascii = text.normalize('NFKD').replace(/[^\x00-\x7f]/g, '').toLowerCase();
  const out = ascii.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (out) return out;
  return [...text]
    .filter((c) => c.trim() && c !== '`')
    .map((c) => {
      const name = UNICODE_NAMES[c];
      if (!name) throw new DataError(`no Unicode name known for ${JSON.stringify(c)} in word ${JSON.stringify(text)}: add it to UNICODE_NAMES`);
      return name.toLowerCase().replace(/ /g, '-');
    })
    .join('-');
}

export function parseMarkdown(src, label) {
  const sections = [];
  for (const line of src.split(/\r?\n/)) {
    if (line.startsWith('## ')) sections.push({ title: line.slice(3).trim(), header: null, rows: [] });
    else if (line.startsWith('|') && !line.startsWith('|---') && sections.length) {
      const cells = line.split('|').slice(1, -1).map((c) => c.trim());
      const sec = sections[sections.length - 1];
      if (!sec.header) sec.header = cells;
      else if (cells.length !== sec.header.length) throw new DataError(`${label}: row in "${sec.title}" has ${cells.length} cells, header has ${sec.header.length}: ${line}`);
      else sec.rows.push(cells);
    }
  }
  return sections;
}

const strip = (s) => s.replace(/`/g, '').trim();
// Split on " / " only outside parentheses: "provenance (known / inherited)" stays one alias.
function splitOutsideParens(cell) {
  const parts = [];
  let depth = 0, cur = '';
  for (let i = 0; i < cell.length; i++) {
    const c = cell[i];
    if (c === '(') depth++;
    if (c === ')') depth = Math.max(0, depth - 1);
    if (depth === 0 && cell.startsWith(' / ', i)) { parts.push(cur); cur = ''; i += 2; continue; }
    cur += c;
  }
  parts.push(cur);
  return parts;
}

export function aliases(cell) {
  const out = new Set();
  for (const part of splitOutsideParens(cell)) {
    const p = strip(part).toLowerCase();
    if (p) out.add(p);
    const base = p.split(' (')[0].trim();
    if (base) out.add(base);
  }
  return [...out];
}

function validEnrichSide(side) {
  return side && typeof side.why === 'string' && typeof side.pitfall === 'string' && side.example
    && typeof side.example.before === 'string' && typeof side.example.after === 'string'
    && typeof side.example.kind === 'string' && typeof side.example.lang === 'string';
}

// enrich: { [sectionId]: { [wordId]: Enrich } } (only for sections that have a file)
export function buildLexicon(enSrc, frSrc, enrich = {}) {
  const en = parseMarkdown(enSrc, 'LEXICON.md');
  const fr = parseMarkdown(frSrc, 'LEXIQUE.md');
  if (en.length !== fr.length) throw new DataError(`section count mismatch: LEXICON.md has ${en.length}, LEXIQUE.md has ${fr.length}`);

  const lex = { sections: [], words: {}, combinations: [] };
  const ids = new Set();
  const log = { unresolved: [], missingEnrich: 0, sectionsWithoutEnrich: [] };
  const comboRows = [];

  en.forEach((se, i) => {
    const sf = fr[i];
    if (se.rows.length !== sf.rows.length) throw new DataError(`row count mismatch in section "${se.title}" / "${sf.title}": EN ${se.rows.length}, FR ${sf.rows.length}`);
    const kind = se.header && se.header.length === 2 ? 'combinations' : 'words';
    const sid = slug(se.title.split(' (')[0]);
    if (lex.sections.some((s) => s.id === sid)) throw new DataError(`duplicate section id "${sid}"`);
    const sec = { id: sid, title: { en: se.title, fr: sf.title }, kind, words: [] };
    lex.sections.push(sec);
    se.rows.forEach((re, j) => {
      const rf = sf.rows[j];
      const id = slug(re[0]);
      if (ids.has(id)) throw new DataError(`duplicate id "${id}" (section "${se.title}", word "${re[0]}")`);
      ids.add(id);
      if (kind === 'combinations') {
        comboRows.push({ id, en: { phrase: re[0], result: re[1] }, fr: { phrase: rf[0], result: rf[1] } });
      } else {
        sec.words.push(id);
        lex.words[id] = {
          id, section: sid,
          en: { word: re[0], meaning: re[1], action: re[2] },
          fr: { word: rf[0], meaning: rf[1], action: rf[2] },
          aliases: { en: aliases(re[0]), fr: aliases(rf[0]) },
        };
      }
    });
  });

  for (const [sid, entries] of Object.entries(enrich)) {
    const sec = lex.sections.find((s) => s.id === sid && s.kind === 'words');
    if (!sec) throw new DataError(`enrich/${sid}.json: no word section with id "${sid}"`);
    for (const [wid, value] of Object.entries(entries)) {
      if (!lex.words[wid]) throw new DataError(`enrich/${sid}.json: unknown word id "${wid}"`);
      if (lex.words[wid].section !== sid) throw new DataError(`enrich/${sid}.json: word "${wid}" belongs to section "${lex.words[wid].section}"`);
      if (!validEnrichSide(value?.en) || !validEnrichSide(value?.fr)) throw new DataError(`enrich/${sid}.json: "${wid}" lacks en/fr why, example {kind, lang, before, after} or pitfall`);
      lex.words[wid].enrich = value;
    }
    const missing = sec.words.filter((w) => !lex.words[w].enrich);
    if (missing.length) throw new DataError(`enrich/${sid}.json: missing enrichment for ${missing.length} word(s): ${missing.join(', ')}`);
  }
  for (const sec of lex.sections) {
    if (sec.kind === 'words' && !(sec.id in enrich)) {
      log.sectionsWithoutEnrich.push(sec.id);
      log.missingEnrich += sec.words.length;
    }
  }

  // Resolve combination terms: exact alias first, then an alias that starts with the term.
  // Compared as slugs so punctuation does not block a match ("parse don't validate" vs "parse, don't validate").
  const wordList = Object.values(lex.words).map((w) => ({ id: w.id, keys: [w.id, ...w.aliases.en.map(slug)] }));
  for (const c of comboRows) {
    const words = c.en.phrase.split(' + ').map((term) => {
      const t = slug(strip(term));
      const exact = wordList.find((w) => w.keys.includes(t));
      const hit = exact ?? wordList.find((w) => w.keys.some((a) => a.startsWith(t)));
      if (!hit) { log.unresolved.push(`${c.id}: "${term.trim()}"`); return term.trim(); }
      return hit.id;
    });
    lex.combinations.push({ ...c, words });
  }
  return { lexicon: lex, log };
}

export function readEnrich(dir) {
  const out = {};
  if (!existsSync(dir)) return out;
  for (const f of readdirSync(dir).filter((f) => f.endsWith('.json')).sort()) {
    try {
      out[f.slice(0, -5)] = JSON.parse(readFileSync(join(dir, f), 'utf8'));
    } catch (e) {
      throw new DataError(`enrich/${f}: invalid JSON (${e.message})`);
    }
  }
  return out;
}

function main() {
  const here = dirname(fileURLToPath(import.meta.url));
  const repo = resolve(here, '..', '..');
  const outFile = resolve(here, '..', 'src', 'data', 'lexicon.json');
  try {
    const { lexicon, log } = buildLexicon(
      readFileSync(join(repo, 'LEXICON.md'), 'utf8'),
      readFileSync(join(repo, 'LEXIQUE.md'), 'utf8'),
      readEnrich(join(repo, 'enrich')),
    );
    mkdirSync(dirname(outFile), { recursive: true });
    writeFileSync(outFile, JSON.stringify(lexicon));
    const nWords = Object.keys(lexicon.words).length;
    console.log(`build-data: ${lexicon.sections.length} sections, ${nWords} words, ${lexicon.combinations.length} combinations`);
    console.log(`build-data: ${log.missingEnrich} word(s) lack enrichment (${log.sectionsWithoutEnrich.length} section(s) without an enrich file)`);
    if (log.unresolved.length) console.log(`build-data: unresolved combination terms kept as text: ${log.unresolved.join('; ')}`);
  } catch (e) {
    console.error(`build-data FAILED: ${e.message}`);
    process.exit(1);
  }
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main();
