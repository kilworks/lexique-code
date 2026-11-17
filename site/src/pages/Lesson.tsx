import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Inline';
import { usePrefs } from '../components/prefs';
import { chunk, makeQuiz, pathOrder } from '../lib/quiz';
import type { Lang, Lexicon } from '../lib/types';
import { shortTitle } from './Learn';
import NotFound from './NotFound';
import { ASK } from './Quiz';
import '../styles/learn.css';

/** Two quick questions on the words of the previous step, asked once its cards are gone (retrieval, not copying); nothing is stored. */
function StepCheck({ lex, lang, sectionId, words, seed }: { lex: Lexicon; lang: Lang; sectionId: string; words: string[]; seed: number }) {
  const questions = makeQuiz(lex, sectionId, seed, 2, words);
  const [picks, setPicks] = useState<Record<number, string>>({});
  if (!questions.length) return null;
  return (
    <section className="check" aria-labelledby="check-title">
      <h3 id="check-title" className="label">Quick check on the last step</h3>
      {questions.map((q, n) => {
        const picked = picks[n];
        const right = picked === q.answer;
        return (
          <div key={q.answer} className="check__q">
            <p className="check__ask">
              <span lang="en">{ASK[q.kind]}</span>{' '}
              <span className={q.prompt === 'word' ? 'check__prompt check__prompt--word' : 'check__prompt'} lang={lang}><Inline text={lex.words[q.answer][lang][q.prompt]} /></span>
            </p>
            <ul className="qopts" lang={lang}>
              {q.options.map((o) => {
                const state = !picked ? '' : o === q.answer ? ' qopt--right' : o === picked ? ' qopt--wrong' : ' qopt--dim';
                return (
                  <li key={o}>
                    <button type="button" className={`qopt qopt--compact${state}`} aria-disabled={!!picked} onClick={() => !picked && setPicks({ ...picks, [n]: o })}>
                      <span className="qopt__text"><Inline text={lex.words[o][lang][q.show]} /></span>
                      {picked && o === q.answer && <><Icon name="check" className="ico qopt__mark" /><span className="sr-only" lang="en"> (correct answer)</span></>}
                      {picked && o === picked && !right && <><Icon name="x" className="ico qopt__mark" /><span className="sr-only" lang="en"> (your answer)</span></>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="check__verdict" role="status" lang="en">
              {picked && (right ? 'Right.' : <>Not quite: the answer is <strong lang={lang}><Inline text={lex.words[q.answer][lang].word} /></strong>.</>)}
            </p>
          </div>
        );
      })}
    </section>
  );
}

export default function Lesson() {
  const { section: id = '' } = useParams();
  const lex = useLexicon();
  const { lang } = usePrefs();
  const [params, setParams] = useSearchParams();
  const headRef = useRef<HTMLHeadingElement>(null);

  const order = pathOrder(lex.sections);
  const pos = order.findIndex((s) => s.id === id);
  const section = order[pos];
  const steps = section ? chunk(section.words.filter((w) => Object.hasOwn(lex.words, w))) : [];
  const raw = Number(params.get('step'));
  const step = Number.isInteger(raw) && raw >= 1 && raw <= steps.length ? raw : 1;

  const shown = useRef<number | null>(null);
  // read before the effect below updates it: the step we come from gives the direction of the entrance
  const from = shown.current;
  const enter = from === null || from === step ? undefined : step > from ? 'next' : 'back';
  // on a step change (not the first paint), bring the reader to the new step
  useEffect(() => {
    const before = shown.current;
    shown.current = step;
    if (before === null || before === step) return;
    window.scrollTo(0, 0);
    headRef.current?.focus();
  }, [step]);

  if (!section || !steps.length) return <NotFound what="lesson" />;

  const go = (n: number) => setParams(n === 1 ? {} : { step: String(n) });
  const words = steps[step - 1];
  const last = step === steps.length;
  const nextLesson = order[pos + 1];

  return (
    <div className="page lesson">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/learn">Learning path</Link>
        <Icon name="chevron-right" className="ico ico--sm" />
        <span lang={lang}>{shortTitle(section.title[lang])}</span>
      </nav>

      <header className="page-head">
        <h1 className="h1" lang={lang}>{shortTitle(section.title[lang])}</h1>
        <p className="muted">{section.words.length} words in {steps.length} steps, then a quiz.</p>
      </header>

      <div className="steps" aria-hidden="true">
        {steps.map((_, i) => <span key={i} className={`steps__dot${i + 1 <= step ? ' steps__dot--done' : ''}`} />)}
      </div>

      <section key={step} className="lesson__step" data-enter={enter} aria-labelledby="step-title">
        <h2 id="step-title" className="label" ref={headRef} tabIndex={-1}>
          Step {step} of {steps.length}
        </h2>
        {step > 1 && <StepCheck key={`${section.id}-${step}-${lang}`} lex={lex} lang={lang} sectionId={section.id} words={steps[step - 2]} seed={pos * 100 + step} />}
        <ol className="lesson__words" lang={lang}>
          {words.map((wid) => {
            const w = lex.words[wid];
            const why = w.enrich?.[lang].why;
            return (
              <li key={wid} className="lcard">
                <h3 className="lcard__word">
                  <Link to={`/word/${wid}`}><Inline text={w[lang].word} /></Link>
                </h3>
                <p className="lcard__meaning"><Inline text={w[lang].meaning} /></p>
                <p className="lcard__action">
                  <span className="lcard__label" lang="en">Triggers</span>
                  <span><Inline text={w[lang].action} /></span>
                </p>
                {why && <p className="lcard__why prose">{why}</p>}
              </li>
            );
          })}
        </ol>
      </section>

      <nav className="lesson__nav" aria-label="Lesson steps">
        {step > 1 ? (
          <button type="button" className="btn btn--secondary" onClick={() => go(step - 1)}>
            <Icon name="chevron-left" /> Previous step
          </button>
        ) : <span />}
        {last ? (
          <Link to={`/learn/${section.id}/quiz`} className="btn btn--primary">
            Take the quiz <Icon name="chevron-right" />
          </Link>
        ) : (
          <button type="button" className="btn btn--primary" onClick={() => go(step + 1)}>
            Next step <Icon name="chevron-right" />
          </button>
        )}
      </nav>

      {last && nextLesson && (
        <p className="muted lesson__after">
          Next lesson: <Link to={`/learn/${nextLesson.id}`} lang={lang}>{shortTitle(nextLesson.title[lang])}</Link>
        </p>
      )}
    </div>
  );
}
