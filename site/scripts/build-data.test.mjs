import { readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { aliases, buildLexicon, DataError, slug } from './build-data.mjs';

const repo = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..');
const EN = readFileSync(join(repo, 'LEXICON.md'), 'utf8');
const FR = readFileSync(join(repo, 'LEXIQUE.md'), 'utf8');

// Sample of the reference ids computed independently (scratchpad words.json, 24 sections, 555 rows).
const REFERENCE = {
  sections: ['agent-steering', 'method', 'decision-and-priority', 'debugging', 'reporting-and-communication', 'robustness', 'concurrency-and-time', 'data-and-formats', 'storage-and-databases', 'clarity', 'architecture', 'verification', 'performance', 'security', 'shell-and-scripts', 'system-and-processes', 'networking-and-distributed-systems', 'interfaces', 'user-interface', 'ai-and-llms-in-code', 'git', 'code-evolution', 'operations', 'combinations'],
  words: ['ultrathink', 'effort', 'skim-quick', 'autonomous-don-t-ask', 'provenance-known-inherited', 'pareto-80-20', 'hyphen-minus-hyphen-minus', 'dollar-sign-left-parenthesis-full-stop-full-stop-full-stop-right-parenthesis', 'print0-0', 'printf-echo', 'lc-all-c', 'force-with-lease', 'git-c', 'complexity-o-n', 'i-o-bound-cpu-bound', 'tolerant-reader-postel-s-law', 'heartbeat-dead-man-s-switch', 'utc-iso-8601', 'transaction', 'hot-backup'],
  combinations: ['idempotent-atomic-dry-run', 'transient-permanent-backoff-circuit-breaker', 'tested-backup-3-2-1-rpo-rto', 'ultrathink-pre-mortem-steelman'],
};

describe('slug', () => {
  it('follows the contract', () => {
    expect(slug("autonomous / don't ask")).toBe('autonomous-don-t-ask');
    expect(slug('Évolution du code')).toBe('evolution-du-code');
    expect(slug('`--`')).toBe('hyphen-minus-hyphen-minus');
    expect(slug('`$(...)`')).toBe('dollar-sign-left-parenthesis-full-stop-full-stop-full-stop-right-parenthesis');
  });
  it('fails on a symbol it cannot name', () => {
    expect(() => slug('→')).toThrow(DataError);
  });
});

describe('aliases', () => {
  it('splits on " / " and adds the part before " ("', () => {
    expect(aliases('skim / quick')).toEqual(['skim', 'quick']);
    expect(aliases('Pareto (80/20)')).toEqual(['pareto (80/20)', 'pareto']);
    expect(aliases('`-print0` / `-0`')).toEqual(['-print0', '-0']);
    expect(aliases('provenance (known / inherited)')).toEqual(['provenance (known / inherited)', 'provenance']);
  });
});

describe('buildLexicon on the real files', () => {
  const { lexicon, log } = buildLexicon(EN, FR, {});
  it('produces the reference ids', () => {
    expect(lexicon.sections.map((s) => s.id)).toEqual(REFERENCE.sections);
    for (const id of REFERENCE.words) expect(lexicon.words[id], id).toBeDefined();
    for (const id of REFERENCE.combinations) expect(lexicon.combinations.some((c) => c.id === id), id).toBe(true);
    expect(Object.keys(lexicon.words).length + lexicon.combinations.length).toBe(555);
  });
  it('resolves combination terms, including prefix and punctuation-insensitive matches', () => {
    const c = (id) => lexicon.combinations.find((x) => x.id === id).words;
    expect(c('transient-permanent-backoff-circuit-breaker')).toEqual(['transient-permanent', 'backoff-jitter', 'circuit-breaker']);
    expect(c('parse-don-t-validate-trust-boundary-fail-fast')[0]).toBe('parse-don-t-validate');
    expect(log.missingEnrich).toBe(528);
  });
});

describe('buildLexicon failure cases', () => {
  const md = (rows) => `## Sec (x)\n\n| W | M | A |\n|---|---|---|\n${rows.map((r) => `| ${r.join(' | ')} |`).join('\n')}\n`;
  const en = md([['alpha', 'a', 'b'], ['beta', 'c', 'd']]);
  const fr = md([['alpha', 'a', 'b'], ['beta', 'c', 'd']]);
  const side = { why: 'w', pitfall: 'p', example: { kind: 'code', lang: 'ts', before: 'x', after: 'y' } };
  const full = { alpha: { en: side, fr: side }, beta: { en: side, fr: side } };

  it('row count mismatch', () => {
    expect(() => buildLexicon(en, md([['alpha', 'a', 'b']]))).toThrow(/row count mismatch/);
  });
  it('section count mismatch', () => {
    expect(() => buildLexicon(en + md([['g', 'h', 'i']]), fr)).toThrow(/section count mismatch/);
  });
  it('duplicate id', () => {
    const dup = md([['alpha', 'a', 'b'], ['Alpha', 'c', 'd']]);
    expect(() => buildLexicon(dup, dup)).toThrow(/duplicate id "alpha"/);
  });
  it('enrichment for an unknown id', () => {
    expect(() => buildLexicon(en, fr, { sec: { ...full, gamma: { en: side, fr: side } } })).toThrow(/unknown word id "gamma"/);
  });
  it('missing enrichment once the section has a file', () => {
    expect(() => buildLexicon(en, fr, { sec: { alpha: full.alpha } })).toThrow(/missing enrichment for 1 word\(s\): beta/);
  });
  it('accepts a complete section and attaches enrich', () => {
    const { lexicon, log } = buildLexicon(en, fr, { sec: full });
    expect(lexicon.words.alpha.enrich).toEqual(full.alpha);
    expect(log.missingEnrich).toBe(0);
  });
});
