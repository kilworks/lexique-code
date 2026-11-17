import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Inline';
import { usePrefs } from '../components/prefs';
import { bestOf, makeQuiz, markMistakes, mistakes, pathOrder, recordScore, today, type Best, type Question } from '../lib/quiz';
import { KEYS, read, write } from '../lib/storage';
import type { Lexicon, Lang } from '../lib/types';
import { shortTitle } from './Learn';
import NotFound from './NotFound';
import '../styles/learn.css';

const ASK: Record<Question['kind'], string> = {
  'word-for-action': 'Which word triggers this action?',
  'meaning-of-word': 'What does this word mean?',
  'action-for-word': 'Which action does this word trigger?',
  'complete-combination': 'Complete the combination',
};

const newSeed = () => (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;

function Prompt({ q, lex, lang }: { q: Question; lex: Lexicon; lang: Lang }) {
  if (q.combo) {
    const c = lex.combinations.find((x) => x.id === q.combo!.id);
    if (!c) return null;
    return (
      <div className="qprompt" lang={lang}>
        <p className="qprompt__main">
          {c.words.map((w, i) => (
            <span key={`${w}-${i}`}>
              {i > 0 && <span className="combo__plus"> + </span>}
              {i === q.combo!.blank ? (
                <span className="qblank"><span aria-hidden="true">?</span><span className="sr-only" lang="en">blank</span></span>
              ) : lex.words[w] ? <Inline text={lex.words[w][lang].word} /> : w}
            </span>
          ))}
        </p>
        <p className="qprompt__sub"><span className="eyebrow" lang="en">Gives </span><Inline text={c[lang].result} /></p>
      </div>
    );
  }
  return (
    <div className="qprompt" lang={lang}>
      <p className={q.prompt === 'word' ? 'qprompt__main qprompt__main--word' : 'qprompt__main'}>
        <Inline text={lex.words[q.answer][lang][q.prompt]} />
      </p>
    </div>
  );
}

export default function Quiz() {
  const { section: id = '' } = useParams();
  const lex = useLexicon();
  const { lang } = usePrefs();
  const [seed, setSeed] = useState(newSeed);
  const questions = useMemo(() => makeQuiz(lex, id, seed), [lex, id, seed]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [result, setResult] = useState<{ prev: Best | null; saved: boolean } | null>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const headRef = useRef<HTMLHeadingElement>(null);
  const keyRef = useRef<(e: KeyboardEvent) => void>(() => {});
  // same component, other section (history back and forth): start a fresh attempt
  const [forId, setForId] = useState(id);
  if (forId !== id) {
    setForId(id);
    setIndex(0);
    setAnswers([]);
    setResult(null);
  }
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => keyRef.current(e);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const order = pathOrder(lex.sections);
  const pos = order.findIndex((s) => s.id === id);
  const section = order[pos];
  if (!section || !questions.length) return <NotFound what="quiz" />;

  const q = questions[Math.min(index, questions.length - 1)];
  const picked = answers[index] ?? null;
  const total = questions.length;
  const score = answers.filter((a, i) => a === questions[i]?.answer).length;

  const choose = (opt: string) => {
    if (picked) return;
    const next = [...answers];
    next[index] = opt;
    setAnswers(next);
    // after React paints the feedback, put the keyboard on the way forward
    requestAnimationFrame(() => nextRef.current?.focus());
  };

  const advance = () => {
    if (index + 1 < total) {
      setIndex(index + 1);
      requestAnimationFrame(() => headRef.current?.focus());
      return;
    }
    const storedQuiz = read<unknown>(KEYS.quiz, null);
    const prev = bestOf(storedQuiz, section.id);
    const okQuiz = write(KEYS.quiz, recordScore(storedQuiz, section.id, score, total));
    const missed = mistakes(questions, answers);
    // shortcut: same {box, due: YYYY-MM-DD} shape as the flashcards; if srs.ts changes the shape, call its helper here
    const okSrs = missed.length === 0 || write(KEYS.srs, markMistakes(read<unknown>(KEYS.srs, null), missed, today()));
    setResult({ prev, saved: okQuiz && okSrs });
    requestAnimationFrame(() => headRef.current?.focus());
  };

  const retry = () => {
    setSeed(newSeed());
    setIndex(0);
    setAnswers([]);
    setResult(null);
    requestAnimationFrame(() => headRef.current?.focus());
  };

  // keys 1 to 4 pick an option while the question is open
  keyRef.current = (e) => {
    if (result || picked || e.altKey || e.ctrlKey || e.metaKey) return;
    const t = e.target as HTMLElement | null;
    if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) return;
    const n = Number(e.key);
    if (Number.isInteger(n) && n >= 1 && n <= q.options.length) {
      e.preventDefault();
      choose(q.options[n - 1]);
    }
  };

  const title = shortTitle(section.title[lang]);
  const crumbs = (
    <nav className="crumbs" aria-label="Breadcrumb">
      <Link to="/learn">Learning path</Link>
      <Icon name="chevron-right" className="ico ico--sm" />
      <Link to={`/learn/${section.id}`} lang={lang}>{title}</Link>
    </nav>
  );

  if (result) {
    const missed = questions.filter((qq, i) => answers[i] !== qq.answer);
    const nextLesson = order[pos + 1];
    const beat = !result.prev || score / total > result.prev.best / result.prev.total;
    return (
      <div className="page quiz">
        {crumbs}
        <header className="page-head">
          <h1 className="h1" ref={headRef} tabIndex={-1}>Your score: {score} of {total}</h1>
          <p className="lead">
            {score === total ? 'Perfect, every answer right.' : `${total - score} to review.`}
            {' '}
            {result.prev ? (beat ? `New best (was ${result.prev.best}/${result.prev.total}).` : `Your best is ${result.prev.best}/${result.prev.total}.`) : ''}
          </p>
          {!result.saved && (
            <p className="quiz__warn" role="status">
              <Icon name="alert-circle" className="ico ico--sm" /> Your browser blocked storage: this score and your mistakes will not be kept.
            </p>
          )}
        </header>

        {missed.length > 0 && (
          <section className="quiz__missed" aria-labelledby="missed-title">
            <h2 id="missed-title" className="h3">Added to your flashcards</h2>
            <ul className="answer-rows" lang={lang}>
              {missed.map((qq) => {
                const w = lex.words[qq.answer];
                return (
                  <li key={qq.answer} className="answer-row">
                    <Link to={`/word/${w.id}`} className="answer-row__word"><Inline text={w[lang].word} /></Link>
                    <span className="answer-row__meaning"><Inline text={w[lang].meaning} /></span>
                    <span className="answer-row__action"><Inline text={w[lang].action} /></span>
                  </li>
                );
              })}
            </ul>
          </section>
        )}

        <div className="empty__actions">
          {missed.length > 0 && <Link to="/cards" className="btn btn--primary">Review in flashcards</Link>}
          <button type="button" className={`btn ${missed.length ? 'btn--secondary' : 'btn--primary'}`} onClick={retry}>New quiz on this section</button>
          {nextLesson ? (
            <Link to={`/learn/${nextLesson.id}`} className="btn btn--secondary">Next lesson:<span lang={lang}>{shortTitle(nextLesson.title[lang])}</span></Link>
          ) : (
            <Link to="/learn" className="btn btn--secondary">Back to the path</Link>
          )}
        </div>
      </div>
    );
  }

  const right = picked === q.answer;
  const w = lex.words[q.answer];

  return (
    <div className="page quiz">
      {crumbs}
      <header className="quiz__head">
        <h1 className="eyebrow" ref={headRef} tabIndex={-1}>
          Quiz: <span lang={lang}>{title}</span>, question {index + 1} of {total}
        </h1>
        <span className="pbar" aria-hidden="true"><span className="pbar__fill" style={{ width: `${(index / total) * 100}%` }} /></span>
      </header>

      <section className="quiz__card" aria-labelledby="ask">
        <h2 id="ask" className="h2">{ASK[q.kind]}</h2>
        <Prompt q={q} lex={lex} lang={lang} />
        <ul className="qopts" lang={lang}>
          {q.options.map((o, i) => {
            const state = !picked ? '' : o === q.answer ? ' qopt--right' : o === picked ? ' qopt--wrong' : ' qopt--dim';
            return (
              <li key={o}>
                <button type="button" className={`qopt${state}`} onClick={() => choose(o)} disabled={!!picked && o !== picked && o !== q.answer} aria-disabled={!!picked}>
                  <span className="qopt__key" aria-hidden="true">{i + 1}</span>
                  <span className="qopt__text"><Inline text={lex.words[o][lang][q.show]} /></span>
                  {picked && o === q.answer && <><Icon name="check" className="ico qopt__mark" /><span className="sr-only" lang="en"> (correct answer)</span></>}
                  {picked && o === picked && o !== q.answer && <><Icon name="x" className="ico qopt__mark" /><span className="sr-only" lang="en"> (your answer)</span></>}
                </button>
              </li>
            );
          })}
        </ul>
        {!picked && <p className="muted quiz__hint">Tip: keys 1 to 4 pick an answer.</p>}

        <div role="status" aria-live="polite">
          {picked && (
            <div className={`qfeedback${right ? ' qfeedback--right' : ' qfeedback--wrong'}`}>
              <p className="qfeedback__verdict">
                <Icon name={right ? 'check' : 'x'} /> {right ? 'Right.' : 'Not this one. The answer:'}
              </p>
              <div className="answer-row" lang={lang}>
                <Link to={`/word/${w.id}`} className="answer-row__word"><Inline text={w[lang].word} /></Link>
                <span className="answer-row__meaning"><Inline text={w[lang].meaning} /></span>
                <span className="answer-row__action"><Inline text={w[lang].action} /></span>
              </div>
            </div>
          )}
        </div>

        {picked && (
          <div className="quiz__next">
            <button type="button" ref={nextRef} className="btn btn--primary" onClick={advance}>
              {index + 1 < total ? <>Next question <Icon name="chevron-right" /></> : 'See your score'}
            </button>
            <span className="muted">Score so far: {score}/{index + 1}</span>
          </div>
        )}
      </section>
    </div>
  );
}
