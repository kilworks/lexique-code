import { Link } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon, type IconName } from '../components/Icon';
import { Inline } from '../components/Inline';
import { usePrefs } from '../components/prefs';
import { dayIndex, summarize } from '../lib/progress';
import { nextLesson } from '../lib/quiz';
import { KEYS, read } from '../lib/storage';
import '../styles/home.css';

const WAYS: { to: string; icon: IconName; title: string; text: string }[] = [
  { to: '/cards', icon: 'archive', title: 'Cards', text: 'Flashcards in five Leitner boxes. A word you know comes back later, a word you miss comes back tomorrow.' },
  { to: '/learn', icon: 'dashboard', title: 'Learn', text: 'One lesson per section, in a recommended order, each closed by a ten question quiz.' },
  { to: '/workshop', icon: 'pencil', title: 'Workshop', text: 'Paste a prompt and see which words it already uses, what each one triggers, and what to add.' },
  { to: '/map', icon: 'share', title: 'Map', text: 'All the words on one map, grouped by section and linked by the combinations they form. Explore by neighbours.' },
];

export default function Home() {
  const lex = useLexicon();
  const { lang, myCards } = usePrefs();
  const ids = Object.keys(lex.words);
  const word = lex.words[ids[dayIndex(ids.length, new Date())]];
  const row = word[lang];
  const section = lex.sections.find((s) => s.id === word.section);
  const wordSections = lex.sections.filter((s) => s.kind === 'words');
  const progress = summarize(
    read<unknown>(KEYS.srs, null),
    read<unknown>(KEYS.quiz, null),
    new Set(ids),
    new Set(wordSections.map((s) => s.id)),
  );
  const started = myCards.length + progress.studied + progress.quizzes > 0;
  const next = nextLesson(lex.sections, read<unknown>(KEYS.quiz, null));
  const nextTitle = next ? next.title[lang].split(' (')[0] : '';

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero__intro">
          <h1 className="display">One word in the prompt, one behaviour in the code.</h1>
          <p className="lead">
            {ids.length} words, from <em>idempotent</em> to <em>pre-mortem</em>, each with what it means and what an agent does when you use it.
            Learn them once and your prompts get shorter and sharper.
          </p>
          <div className="hero__actions">
            {next && (
              <Link to={`/learn/${next.id}`} className="btn btn--primary">
                {progress.quizzes ? <>Continue: <span lang={lang}>{nextTitle}</span></> : 'Start the first lesson'} <Icon name="chevron-right" />
              </Link>
            )}
            <Link to="/glossary" className={`btn ${next ? 'btn--secondary' : 'btn--primary'}`}>
              <Icon name="search" /> Browse the glossary
            </Link>
          </div>
        </div>
        <aside className="wotd" aria-labelledby="wotd-title" lang={lang}>
          <h2 className="label" id="wotd-title" lang="en">Word of the day</h2>
          <p className="wotd__word"><Link to={`/word/${word.id}`}><Inline text={row.word} /></Link></p>
          <p className="wotd__meaning"><Inline text={row.meaning} /></p>
          <p className="wotd__action"><Inline text={row.action} /></p>
          {section && <p className="wotd__section">{section.title[lang]}</p>}
        </aside>
      </section>

      <section className="ways" aria-labelledby="ways-title">
        <h2 id="ways-title" className="h2">Four ways to learn</h2>
        <ol className="ways__list">
          {WAYS.map((w) => (
            <li key={w.to}>
              <Link to={w.to} className="ways__item">
                <span className="ways__title"><Icon name={w.icon} className="ico ico--sm" />{w.title}</span>
                <span className="ways__text">{w.text}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <section className="progress" aria-labelledby="progress-title">
        <h2 id="progress-title" className="h2">Your progress</h2>
        {started && (
          <dl className="stats">
            <div><dt>In my cards</dt><dd>{myCards.length}</dd></div>
            <div><dt>Words studied</dt><dd>{progress.studied} <span className="stats__of">/ {ids.length}</span></dd></div>
            <div><dt>Mastered</dt><dd>{progress.mastered}</dd></div>
            <div><dt>Quizzes taken</dt><dd>{progress.quizzes} <span className="stats__of">/ {wordSections.length}</span></dd></div>
          </dl>
        )}
        {started ? (
          <p className="muted">
            {progress.perfect > 0 && <>{progress.perfect} {progress.perfect === 1 ? 'section' : 'sections'} with a perfect quiz. </>}
            Progress stays in this browser only.
          </p>
        ) : (
          <p className="muted">
            Nothing yet. Start a <Link to="/learn">lesson</Link>, review some <Link to="/cards">cards</Link>, or add any word to your cards from its page. Progress stays in this browser only.
          </p>
        )}
      </section>

      <section className="sections" aria-labelledby="sections-title">
        <h2 id="sections-title" className="h2">Sections</h2>
        <ul className="section-index">
          {wordSections.map((s) => (
            <li key={s.id}>
              <Link to={`/glossary?s=${s.id}`} lang={lang}>{s.title[lang].split(' (')[0]}</Link>
              <span className="muted">{s.words.length}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
