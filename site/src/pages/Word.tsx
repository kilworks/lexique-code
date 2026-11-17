import { Link, useParams } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Inline';
import { usePrefs } from '../components/prefs';
import type { Example, Lang } from '../lib/types';
import NotFound from './NotFound';
import '../styles/word.css';

const LANG_NAME: Record<Lang, string> = { en: 'English', fr: 'French' };

function CodeBlock({ label, code, lang }: { label: string; code: string; lang: string }) {
  return (
    <figure className="code">
      <figcaption className="code__label">{label} <span className="code__lang">{lang}</span></figcaption>
      <pre className="code__pre" tabIndex={0}><code>{code}</code></pre>
    </figure>
  );
}

function ExampleBlock({ ex }: { ex: Example }) {
  return (
    <div className="example">
      <CodeBlock label="Before" code={ex.before} lang={ex.lang} />
      <CodeBlock label="After" code={ex.after} lang={ex.lang} />
    </div>
  );
}

export default function Word() {
  const { id = '' } = useParams();
  const lex = useLexicon();
  const { lang, myCards, toggleCard, saved } = usePrefs();
  const word = Object.hasOwn(lex.words, id) ? lex.words[id] : undefined;
  if (!word) return <NotFound what="word" />;

  const other: Lang = lang === 'en' ? 'fr' : 'en';
  const row = word[lang];
  const twin = word[other];
  const enrich = word.enrich?.[lang];
  const section = lex.sections.find((s) => s.id === word.section);
  const siblings = section ? section.words : [word.id];
  const pos = siblings.indexOf(word.id);
  const prev = pos > 0 ? lex.words[siblings[pos - 1]] : undefined;
  const next = pos >= 0 && pos < siblings.length - 1 ? lex.words[siblings[pos + 1]] : undefined;
  const combos = lex.combinations.filter((c) => c.words.includes(word.id));
  // the 6 closest words in section order (3 before, 3 after, shifted at the ends)
  const others = siblings.filter((s) => s !== word.id && lex.words[s]);
  const from = Math.max(0, Math.min(Math.max(pos, 0) - 3, others.length - 6));
  const near = others.slice(from, from + 6);
  const inCards = myCards.includes(word.id);

  return (
    <article className="page word" lang={lang}>
      <nav className="crumbs" aria-label="Breadcrumb" lang="en">
        <Link to="/glossary">Glossary</Link>
        <Icon name="chevron-right" className="ico ico--sm" />
        {section ? <Link to={`/glossary?s=${section.id}`} lang={lang}>{section.title[lang].split(' (')[0]}</Link> : <span>Section</span>}
      </nav>

      <div className="word__grid">
        <div className="word__main">
          <header className="word__head">
            <h1 className="display word__title"><Inline text={row.word} /></h1>
            <p className="lead word__meaning"><Inline text={row.meaning} /></p>
          </header>

          <section className="action" aria-labelledby="action-title">
            <h2 id="action-title" className="label" lang="en">What it triggers</h2>
            <p className="action__text"><Inline text={row.action} /></p>
          </section>

          {enrich ? (
            <>
              <section className="word__block" aria-labelledby="why-title">
                <h2 id="why-title" className="h3" lang="en">Why it matters</h2>
                <p className="prose">{enrich.why}</p>
              </section>
              <section className="word__block" aria-labelledby="example-title">
                <h2 id="example-title" className="h3" lang="en">Example</h2>
                <ExampleBlock ex={enrich.example} />
              </section>
              <section className="pitfall" aria-labelledby="pitfall-title">
                <h2 id="pitfall-title" className="pitfall__title" lang="en">
                  <Icon name="alert-triangle" /> Common pitfall
                </h2>
                <p className="prose">{enrich.pitfall}</p>
              </section>
            </>
          ) : (
            <p className="muted" lang="en">No worked example for this word yet.</p>
          )}

          <div className="word__actions" lang="en">
            <button type="button" className={`btn ${inCards ? 'btn--secondary' : 'btn--primary'}`} aria-pressed={inCards} onClick={() => toggleCard(word.id)}>
              <Icon name={inCards ? 'check' : 'plus'} /> {inCards ? 'In my cards' : 'Add to my cards'}
            </button>
            {inCards && <Link to="/cards" className="btn btn--ghost">Review my cards</Link>}
            <p className="word__saved" role="status">
              {!saved && <><Icon name="alert-circle" className="ico ico--sm" /> Your browser blocked storage: cards will not be kept after this visit.</>}
            </p>
          </div>
        </div>

        <aside className="word__side">
          <section className="side-block twin" lang={other} aria-labelledby="twin-title">
            <h2 id="twin-title" className="label" lang="en">In {LANG_NAME[other]}</h2>
            <p className="twin__word"><Inline text={twin.word} /></p>
            <p className="twin__meaning"><Inline text={twin.meaning} /></p>
            <p className="twin__action"><Inline text={twin.action} /></p>
          </section>

          {combos.length > 0 && (
            <section className="side-block" aria-labelledby="combos-title">
              <h2 id="combos-title" className="label" lang="en">Combinations using it</h2>
              <ul className="combos">
                {combos.map((c) => (
                  <li key={c.id} className="combo">
                    <p className="combo__words">
                      {c.words.map((w, i) => (
                        <span key={`${w}-${i}`}>
                          {i > 0 && <span className="combo__plus" aria-hidden="true"> + </span>}
                          {i > 0 && <span className="sr-only"> plus </span>}
                          {w === word.id ? (
                            <strong><Inline text={word[lang].word} /></strong>
                          ) : lex.words[w] ? (
                            <Link to={`/word/${w}`}><Inline text={lex.words[w][lang].word} /></Link>
                          ) : (
                            <span>{w}</span>
                          )}
                        </span>
                      ))}
                    </p>
                    <p className="combo__result"><Inline text={c[lang].result} /></p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {section && siblings.length > 1 && (
            <section className="side-block" aria-labelledby="siblings-title">
              <h2 id="siblings-title" className="label" lang="en">
                Nearby in {section.title.en.split(' (')[0]}
              </h2>
              <ul className="siblings" lang={lang}>
                {near.map((s) => (
                  <li key={s}><Link to={`/word/${s}`}><Inline text={lex.words[s][lang].word} /></Link></li>
                ))}
              </ul>
              {near.length < siblings.length - 1 && (
                <Link to={`/glossary?s=${section.id}`} className="siblings__all">
                  All {siblings.length} in <span lang={lang}>{section.title[lang].split(' (')[0]}</span>
                </Link>
              )}
            </section>
          )}
        </aside>
      </div>

      <nav className="pager" aria-label="Words in this section" lang="en">
        {prev ? (
          <Link to={`/word/${prev.id}`} className="pager__link" rel="prev">
            <Icon name="chevron-left" />
            <span><span className="pager__dir">Previous</span> <span className="pager__word" lang={lang}><Inline text={prev[lang].word} /></span></span>
          </Link>
        ) : <span />}
        {next && (
          <Link to={`/word/${next.id}`} className="pager__link pager__link--next" rel="next">
            <span><span className="pager__dir">Next</span> <span className="pager__word" lang={lang}><Inline text={next[lang].word} /></span></span>
            <Icon name="chevron-right" />
          </Link>
        )}
      </nav>
    </article>
  );
}
