import { Link } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon } from '../components/Icon';
import { usePrefs } from '../components/prefs';
import { bestOf, nextLesson, pathOrder } from '../lib/quiz';
import { KEYS, read } from '../lib/storage';
import '../styles/learn.css';

export const shortTitle = (t: string) => t.split(' (')[0];

export default function Learn() {
  const lex = useLexicon();
  const { lang } = usePrefs();
  const lessons = pathOrder(lex.sections);
  const stored = read<unknown>(KEYS.quiz, null);
  const done = lessons.filter((s) => bestOf(stored, s.id)).length;
  const current = nextLesson(lex.sections, stored);

  return (
    <div className="page learn">
      <header className="page-head">
        <p className="eyebrow">Learning path</p>
        <h1 className="display">Learn the lexicon, one section at a time</h1>
        <p className="lead">
          Each lesson walks through a section in short steps: the word, what it means, what it triggers and why it matters.
          A ten question quiz closes it, and every word you miss goes to your flashcards.
        </p>
        <p className="learn__count">
          <strong>{done}</strong> of {lessons.length} quizzes taken
        </p>
        {current && (
          <Link to={`/learn/${current.id}`} className="btn btn--primary learn__cta">
            {done ? 'Continue' : 'Start'}: <span lang={lang}>{shortTitle(current.title[lang])}</span> <Icon name="chevron-right" />
          </Link>
        )}
      </header>

      <ol className="path">
        {lessons.map((s, i) => {
          const best = bestOf(stored, s.id);
          const pct = best ? Math.round((best.best / best.total) * 100) : 0;
          return (
            <li key={s.id} className={`path__item${s === current ? ' path__item--current' : ''}`} aria-current={s === current ? 'step' : undefined}>
              <span className="path__num" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="path__body">
                <h2 className="h3 path__title">
                  <Link to={`/learn/${s.id}`} lang={lang}>{shortTitle(s.title[lang])}</Link>
                </h2>
                <p className="path__meta">
                  {s.words.length} words
                  {i < 5 && <span className="path__tag">Core</span>}
                  {s === current && <span className="path__tag path__tag--current">{done ? 'Up next' : 'Start here'}</span>}
                </p>
              </div>
              <div className="path__progress">
                {best ? (
                  <>
                    <span className={`path__score${best.best >= best.total ? ' path__score--perfect' : ''}`}>
                      {best.best >= best.total && <Icon name="check" className="ico ico--sm" />}
                      Best {best.best}/{best.total}
                    </span>
                    <span className="pbar" aria-hidden="true"><span className="pbar__fill" style={{ width: `${pct}%` }} /></span>
                  </>
                ) : (
                  <span className="muted">Quiz not taken</span>
                )}
              </div>
              <div className="path__actions">
                <Link to={`/learn/${s.id}`} className="btn btn--secondary btn--sm">
                  Lesson<span className="sr-only">: {shortTitle(s.title.en)}</span>
                </Link>
                <Link to={`/learn/${s.id}/quiz`} className="btn btn--ghost btn--sm">
                  Quiz<span className="sr-only">: {shortTitle(s.title.en)}</span>
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
