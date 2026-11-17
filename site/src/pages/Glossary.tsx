import { useEffect, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Inline';
import { usePrefs } from '../components/prefs';
import { search } from '../lib/search';
import '../styles/glossary.css';

export default function Glossary() {
  const lex = useLexicon();
  const { lang } = usePrefs();
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const selected = (params.get('s') ?? '').split(',').filter((id) => lex.sections.some((s) => s.id === id && s.kind === 'words'));
  const input = useRef<HTMLInputElement>(null);
  const result = useMemo(() => search(lex, q, lang, selected), [lex, q, lang, selected.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  // "/" focuses search unless the user is already typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      e.preventDefault();
      input.current?.focus();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const update = (next: { q?: string; s?: string[] }) => {
    const p = new URLSearchParams(params);
    const nq = next.q ?? q;
    const ns = next.s ?? selected;
    if (nq) p.set('q', nq); else p.delete('q');
    if (ns.length) p.set('s', ns.join(',')); else p.delete('s');
    setParams(p, { replace: true });
  };
  const toggleSection = (id: string) => update({ s: selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id] });

  const wordSections = lex.sections.filter((s) => s.kind === 'words');
  const nothing = result.count === 0 && result.combinations.length === 0;

  return (
    <div className="page glossary">
      <header className="page-head">
        <h1 className="h1">Glossary</h1>
        <p className="lead">Every word, its meaning and what it triggers. Search matches the word, its other forms, the meaning and the action.</p>
      </header>

      <div className="searchbar" role="search">
        <label htmlFor="glossary-search" className="sr-only">Search the lexicon</label>
        <Icon name="search" className="ico searchbar__icon" />
        <input
          ref={input}
          id="glossary-search"
          type="search"
          className="searchbar__input"
          placeholder="Search, for example idempotent or retry"
          value={q}
          onChange={(e) => update({ q: e.target.value })}
          autoComplete="off"
          spellCheck={false}
          aria-describedby="search-hint"
        />
        <kbd className="searchbar__kbd" aria-hidden="true">/</kbd>
        <span id="search-hint" className="sr-only">Press slash anywhere on this page to come back to the search field.</span>
      </div>

      <div className="chips" role="group" aria-label="Filter by section">
        <button type="button" className="chip" aria-pressed={selected.length === 0} onClick={() => update({ s: [] })}>All sections</button>
        {wordSections.map((s) => (
          <button key={s.id} type="button" className="chip" aria-pressed={selected.includes(s.id)} onClick={() => toggleSection(s.id)} lang={lang}>
            {s.title[lang].split(' (')[0]}
          </button>
        ))}
      </div>

      <p className="count" role="status" aria-live="polite">
        {result.count} {result.count === 1 ? 'word' : 'words'}
        {result.combinations.length > 0 && `, ${result.combinations.length} ${result.combinations.length === 1 ? 'combination' : 'combinations'}`}
        {q && <> for <strong>&quot;{q}&quot;</strong></>}
      </p>

      {nothing ? (
        <div className="empty">
          <Icon name="search" className="ico ico--lg" />
          <h2 className="h3">No word matches {q ? <>&quot;{q}&quot;</> : 'this filter'}</h2>
          <p className="muted">
            Try a shorter term or another form of the word. Search looks in the {lang === 'en' ? 'English' : 'French'} text only;
            switch the language in the header to search the other one.
          </p>
          <div className="empty__actions">
            {q && <button type="button" className="btn btn--secondary" onClick={() => update({ q: '' })}><Icon name="x" /> Clear search</button>}
            {selected.length > 0 && <button type="button" className="btn btn--secondary" onClick={() => update({ s: [] })}>Show all sections</button>}
          </div>
        </div>
      ) : (
        <div className="results" lang={lang}>
          {result.groups.map((g) => (
            <section key={g.section.id} className="result-group" aria-labelledby={`g-${g.section.id}`}>
              <h2 className="result-group__title" id={`g-${g.section.id}`}>
                {g.section.title[lang]} <span className="muted">{g.words.length}</span>
              </h2>
              <ul className="word-rows">
                {g.words.map((w) => (
                  <li key={w.id} className="word-row">
                    <Link to={`/word/${w.id}`} className="word-row__word"><Inline text={w[lang].word} /></Link>
                    <span className="word-row__meaning"><Inline text={w[lang].meaning} /></span>
                    <span className="word-row__action"><Inline text={w[lang].action} /></span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          {result.combinations.length > 0 && (
            <section className="result-group" aria-labelledby="g-combinations">
              <h2 className="result-group__title" id="g-combinations">
                {lang === 'en' ? 'Combinations' : 'Combinaisons'} <span className="muted">{result.combinations.length}</span>
              </h2>
              <ul className="word-rows">
                {result.combinations.map((c) => (
                  <li key={c.id} className="word-row word-row--combo">
                    <span className="word-row__word"><Inline text={c[lang].phrase} /></span>
                    <span className="word-row__action"><Inline text={c[lang].result} /></span>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
