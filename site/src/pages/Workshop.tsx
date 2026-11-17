import { useDeferredValue, useId, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Inline';
import { usePrefs } from '../components/prefs';
import type { Lexicon } from '../lib/types';
import { buildMatcher, detect, detectedWords, suggest } from '../lib/workshop';
import '../styles/workshop.css';

const SAMPLES = [
  {
    label: 'Deploy script (EN)',
    text: 'Write a migration script for the staging database. It must be idempotent and atomic, and support a dry-run flag so I can review the plan without changing anything.',
  },
  {
    label: 'Flaky test (EN)',
    text: 'The checkout test fails about one run in ten. Plan first: find the root cause without touching the code yet, write a minimal repro, then add a regression test so it cannot come back.',
  },
  {
    label: 'Import CSV (FR)',
    text: "Refais l'import CSV des commandes : il doit être reprenable si ça plante en cours de route, borné en mémoire, et mettre en quarantaine les lignes invalides au lieu de tout arrêter.",
  },
  {
    label: 'Mise en prod (FR)',
    text: "Pour livrer la nouvelle page de paiement, fais un pre-mortem, estime le blast radius et prévois un rollback derrière un feature flag. Conclusion d'abord dans ta réponse.",
  },
];

// One matcher per loaded lexicon: building it folds ~1300 aliases.
let cache: { lex: Lexicon; matcher: ReturnType<typeof buildMatcher> } | undefined;
function matcherFor(lex: Lexicon) {
  if (cache?.lex !== lex) cache = { lex, matcher: buildMatcher(lex) };
  return cache.matcher;
}

export default function Workshop() {
  const lex = useLexicon();
  const { lang } = usePrefs();
  const [text, setText] = useState('');
  const deferred = useDeferredValue(text);
  const inputId = useId();

  const { found, hitCount, suggestions } = useMemo(() => {
    const hits = detect(deferred, matcherFor(lex));
    const ids = detectedWords(hits);
    const seen = new Map<string, string[]>();
    for (const h of hits) {
      const snippet = deferred.slice(h.start, h.end);
      for (const w of h.words) {
        const list = seen.get(w) ?? [];
        if (!list.includes(snippet)) list.push(snippet);
        seen.set(w, list);
      }
    }
    return {
      found: ids.filter((id) => lex.words[id]).map((id) => ({ word: lex.words[id], snippets: seen.get(id) ?? [] })),
      hitCount: hits.length,
      suggestions: suggest(lex, ids),
    };
  }, [deferred, lex]);

  const name = (id: string) => (lex.words[id] ? <Inline text={lex.words[id][lang].word} /> : id);

  return (
    <div className="page workshop">
      <header className="page-head">
        <h1 className="h1">Check a prompt against the lexicon</h1>
        <p className="lead">Paste or write a prompt. Every lexicon word it uses (English or French) shows up with what it triggers, and the combinations it could complete.</p>
      </header>

      <div className="workshop__grid">
        <section className="workshop__input" aria-label="Prompt">
          <label htmlFor={inputId} className="h3">Your prompt</label>
          <textarea
            id={inputId}
            className="workshop__textarea"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={10}
            spellCheck
            placeholder="Make the import resumable and idempotent, find the root cause first..."
          />
          <div className="workshop__tools">
            <span className="muted workshop__try" id={`${inputId}-samples`}>Try a sample:</span>
            <div className="chips" role="group" aria-labelledby={`${inputId}-samples`}>
              {SAMPLES.map((s) => (
                <button key={s.label} type="button" className="chip" onClick={() => setText(s.text)}>{s.label}</button>
              ))}
            </div>
            {text && (
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => setText('')}>
                <Icon name="x" className="ico ico--sm" /> Clear
              </button>
            )}
          </div>
          <p className="workshop__note muted">
            <Icon name="info" className="ico ico--sm" /> Detection runs in your browser. Nothing you type is sent or stored.
          </p>
        </section>

        <div className="workshop__results">
          <p className={`workshop__count${deferred.trim() ? '' : ' workshop__count--empty'}`} role="status">
            {!deferred.trim()
              ? 'Start typing, or try a sample, to see the words your prompt uses.'
              : found.length === 0
                ? 'No lexicon word found yet.'
                : `${found.length} ${found.length === 1 ? 'word' : 'words'} found (${hitCount} ${hitCount === 1 ? 'use' : 'uses'})`}
          </p>

          {found.length > 0 && (
            <section aria-labelledby="hits-title" className="workshop__block">
              <h2 id="hits-title" className="label">Words in your prompt</h2>
              <ul className="hits" lang={lang}>
                {found.map(({ word, snippets }) => (
                  <li key={word.id} className="hit">
                    <p className="hit__head">
                      <Link to={`/word/${word.id}`} className="hit__word"><Inline text={word[lang].word} /></Link>
                      <span className="hit__seen" lang="und">
                        <span className="sr-only">matched as </span>
                        {snippets.map((s) => <mark key={s} className="hit__mark">{s}</mark>)}
                      </span>
                    </p>
                    <p className="hit__action"><Inline text={word[lang].action} /></p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {suggestions.length > 0 && (
            <section aria-labelledby="sugg-title" className="workshop__block">
              <h2 id="sugg-title" className="label">Combinations to complete</h2>
              <ul className="suggs" lang={lang}>
                {suggestions.map(({ combination: c, present, missing }) => (
                  <li key={c.id} className="sugg">
                    <p className="sugg__phrase"><Inline text={c[lang].phrase} /></p>
                    <p className="sugg__result"><Inline text={c[lang].result} /></p>
                    {missing.length === 0 ? (
                      <p className="sugg__done"><Icon name="check" className="ico ico--sm" /> <span lang="en">Your prompt already has all of it.</span></p>
                    ) : (
                      <p className="sugg__missing">
                        <span lang="en">Add: </span>
                        {missing.map((w, i) => (
                          <span key={w}>
                            {i > 0 && ', '}
                            {lex.words[w] ? <Link to={`/word/${w}`}>{name(w)}</Link> : <span>{w}</span>}
                          </span>
                        ))}
                        <span className="sr-only"> (already there: {present.map((w) => (lex.words[w] ? lex.words[w][lang].word.replace(/`/g, '') : w)).join(', ')})</span>
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
