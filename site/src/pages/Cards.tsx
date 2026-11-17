import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useLexicon } from '../components/data';
import { Icon } from '../components/Icon';
import { Inline } from '../components/Inline';
import { usePrefs } from '../components/prefs';
import { answer, BOXES, dueCards, nextDue, parseState, type SrsState } from '../lib/srs';
import { KEYS, read, write } from '../lib/storage';
import type { Row } from '../lib/types';
import '../styles/cards.css';

type Mode = 'word' | 'meaning' | 'action';
const MODES: { value: Mode; label: string; front: string }[] = [
  { value: 'word', label: 'Word to meaning', front: 'Word' },
  { value: 'meaning', label: 'Meaning to word', front: 'Meaning' },
  { value: 'action', label: 'Action to word', front: 'What it triggers' },
];
const MINE = 'mine';
const SESSION_MAX = 20;

interface Session {
  queue: string[];
  pos: number;
  flipped: boolean;
  /** first answer per card in this session */
  first: Record<string, boolean>;
}

const plain = (s: string) => s.replaceAll('`', '');
const loadSrs = () => parseState(read<unknown>(KEYS.srs, null));

function formatDay(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' });
}

export default function Cards() {
  const lex = useLexicon();
  const { lang, myCards } = usePrefs();
  const sections = useMemo(() => lex.sections.filter((s) => s.kind === 'words'), [lex]);
  const mine = useMemo(() => myCards.filter((id) => Object.hasOwn(lex.words, id)), [myCards, lex]);

  const [srs, setSrs] = useState<SrsState>(loadSrs);
  const [saved, setSaved] = useState(true);
  const [decks, setDecks] = useState<string[]>(() => (mine.length ? [MINE] : sections.slice(0, 1).map((s) => s.id)));
  const [mode, setMode] = useState<Mode>('word');
  const [session, setSession] = useState<Session | null>(null);
  const [done, setDone] = useState<Session | null>(null);

  const wordsOf = (deck: string) => (deck === MINE ? mine : sections.find((s) => s.id === deck)?.words ?? []);
  const deckWords = decks.flatMap(wordsOf);
  const now = new Date();
  const due = dueCards(deckWords, srs, now);

  const start = () => {
    // a quiz may have added mistakes since this page loaded; with storage blocked, memory is the only copy
    const fresh = saved ? loadSrs() : srs;
    setSrs(fresh);
    const queue = dueCards(deckWords, fresh, new Date(), SESSION_MAX);
    if (queue.length) {
      setDone(null);
      setSession({ queue, pos: 0, flipped: false, first: {} });
    }
  };

  const toggleDeck = (id: string) => setDecks((cur) => (cur.includes(id) ? cur.filter((d) => d !== id) : [...cur, id]));

  if (session) {
    return (
      <Review
        session={session}
        mode={mode}
        lang={lang}
        srs={srs}
        saved={saved}
        flip={() => setSession({ ...session, flipped: !session.flipped })}
        onAnswer={(knew) => {
          const id = session.queue[session.pos];
          const next = answer(srs, id, knew, new Date());
          setSrs(next);
          setSaved(write(KEYS.srs, next));
          const first = Object.hasOwn(session.first, id) ? session.first : { ...session.first, [id]: knew };
          const queue = knew ? session.queue : [...session.queue, id]; // a missed card comes back at the end
          const s = { queue, pos: session.pos + 1, flipped: false, first };
          if (s.pos >= queue.length) {
            setSession(null);
            setDone(s);
          } else setSession(s);
        }}
        onEnd={() => {
          setSession(null);
          setDone(Object.keys(session.first).length ? session : null);
        }}
      />
    );
  }

  return (
    <div className="page cards">
      <header className="page-head">
        <h1 className="h1">Cards</h1>
        <p className="lead">
          Five Leitner boxes. A card you know moves up a box and comes back later (tomorrow, then in 3, 7 and 16 days). A card you miss goes back to box 1 and comes back today.
        </p>
      </header>

      {done && <Summary session={done} lang={lang} />}

      <section className="cards__setup" aria-labelledby="deck-title">
        <h2 id="deck-title" className="h3">Deck</h2>
        <div className="chips" role="group" aria-label="Decks">
          <button type="button" className="chip" aria-pressed={decks.includes(MINE)} onClick={() => toggleDeck(MINE)}>
            My cards <span className="chip__count">{dueCards(mine, srs, now).length}</span>
          </button>
          {sections.map((s) => (
            <button key={s.id} type="button" className="chip" aria-pressed={decks.includes(s.id)} onClick={() => toggleDeck(s.id)}>
              <span lang={lang}>{s.title[lang].split(' (')[0]}</span> <span className="chip__count">{dueCards(s.words, srs, now).length}</span>
            </button>
          ))}
        </div>
        <p className="muted cards__hint">The number on each deck is how many cards are due today.</p>

        <h2 className="h3" id="mode-title">Card mode</h2>
        <div className="segmented" role="group" aria-labelledby="mode-title">
          {MODES.map((m) => (
            <button key={m.value} type="button" className="segmented__btn" aria-pressed={mode === m.value} onClick={() => setMode(m.value)}>
              {m.label}
            </button>
          ))}
        </div>
      </section>

      <StartPanel decks={decks} mineEmpty={mine.length === 0} deckSize={deckWords.length} due={due.length} next={nextDue(deckWords, srs, now)} onStart={start} />
    </div>
  );
}

function StartPanel({ decks, mineEmpty, deckSize, due, next, onStart }: { decks: string[]; mineEmpty: boolean; deckSize: number; due: number; next: string | null; onStart: () => void }) {
  if (decks.length === 0) {
    return <p className="empty muted" role="status">Pick at least one deck to start.</p>;
  }
  if (deckSize === 0 && decks.length === 1 && mineEmpty) {
    return (
      <div className="empty" role="status">
        <Icon name="archive" className="ico ico--lg" />
        <p className="h3">Your own deck is empty</p>
        <p className="muted">Open any word and press "Add to my cards" to collect the ones you want to drill.</p>
        <div className="empty__actions"><Link to="/glossary" className="btn btn--secondary">Browse the glossary</Link></div>
      </div>
    );
  }
  if (due === 0) {
    return (
      <div className="empty" role="status">
        <Icon name="check" className="ico ico--lg" />
        <p className="h3">Nothing due in this deck</p>
        <p className="muted">{next ? `Next review: ${formatDay(next)}.` : 'Every card is scheduled.'} Pick another deck to keep going.</p>
      </div>
    );
  }
  return (
    <div className="cards__start">
      <p role="status">
        {due} {due === 1 ? 'card' : 'cards'} due{due > SESSION_MAX ? `, this session shows the first ${SESSION_MAX}` : ''}.
      </p>
      <button type="button" className="btn btn--primary" onClick={onStart}>Start reviewing</button>
    </div>
  );
}

function Face({ mode, row }: { mode: Mode; row: Row }) {
  if (mode === 'word') return <p className="flashcard__word"><Inline text={row.word} /></p>;
  return <p className={mode === 'action' ? 'flashcard__action' : 'flashcard__text'}><Inline text={row[mode]} /></p>;
}

interface ReviewProps {
  session: Session;
  mode: Mode;
  lang: 'en' | 'fr';
  srs: SrsState;
  saved: boolean;
  flip: () => void;
  onAnswer: (knew: boolean) => void;
  onEnd: () => void;
}

function Review({ session, mode, lang, srs, saved, flip, onAnswer, onEnd }: ReviewProps) {
  const lex = useLexicon();
  const controls = useRef<HTMLDivElement>(null);
  const id = session.queue[session.pos];
  const word = lex.words[id];
  const row = word[lang];
  const section = lex.sections.find((s) => s.id === word.section);
  const front = MODES.find((m) => m.value === mode)!.front;
  const box = Object.hasOwn(srs, id) ? srs[id].box : null;
  // missed cards are requeued, so count what is left rather than a total that grows
  const left = session.queue.length - session.pos;

  // keep focus on the control that matters after each flip or answer
  useEffect(() => {
    controls.current?.querySelector('button')?.focus();
  }, [session.pos, session.flipped]);

  const latest = useRef({ flipped: session.flipped, flip, onAnswer });
  latest.current = { flipped: session.flipped, flip, onAnswer };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.closest('input, textarea, select, a, [contenteditable="true"]') || (t.tagName === 'BUTTON' && !controls.current?.contains(t)))) return;
      const { flipped, flip, onAnswer } = latest.current;
      if (e.key === ' ') {
        e.preventDefault();
        flip();
      } else if (flipped && (e.key === '1' || e.key === '2')) {
        e.preventDefault();
        onAnswer(e.key === '1');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="page cards">
      <header className="cards__bar">
        <h1 className="h3">{left} {left === 1 ? 'card' : 'cards'} left</h1>
        <button type="button" className="btn btn--ghost btn--sm" onClick={onEnd}>
          <Icon name="x" className="ico ico--sm" /> End session
        </button>
      </header>

      <div className="flashcard" data-flipped={session.flipped} lang={lang}>
        <div className="flashcard__inner">
          <section className="flashcard__face" aria-hidden={session.flipped} aria-label="Question">
            <p className="label" lang="en">{front}</p>
            <Face mode={mode} row={row} />
          </section>
          <section className="flashcard__face flashcard__face--back" aria-hidden={!session.flipped} aria-label="Answer">
            {/* the front field is not repeated full size on the back; in word mode a small reference keeps the context */}
            {mode !== 'word' ? <p className="flashcard__word"><Inline text={row.word} /></p> : <p className="flashcard__ref"><Inline text={row.word} /></p>}
            {mode !== 'meaning' && <p className="flashcard__text"><Inline text={row.meaning} /></p>}
            {mode !== 'action' && <p className="flashcard__action"><Inline text={row.action} /></p>}
          </section>
        </div>
        <p className="flashcard__meta" lang="en">
          <span lang={lang}>{section?.title[lang].split(' (')[0]}</span>
          <span>{box ? `Box ${box} of ${BOXES}` : 'New card'}</span>
        </p>
      </div>

      <p className="sr-only" aria-live="polite">
        {session.flipped ? `Answer: ${plain(row.word)}. ${plain(row.meaning)}. ${plain(row.action)}` : ''}
      </p>

      <div className="cards__controls" ref={controls}>
        {session.flipped ? (
          <>
            <button type="button" className="btn btn--primary" onClick={() => onAnswer(true)}>
              <Icon name="check" /> I knew it <kbd className="cards__kbd">1</kbd>
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => onAnswer(false)}>
              Not yet <kbd className="cards__kbd">2</kbd>
            </button>
          </>
        ) : (
          <button type="button" className="btn btn--primary" onClick={flip}>
            Show answer <kbd className="cards__kbd">Space</kbd>
          </button>
        )}
      </div>
      <p className="muted cards__hint">Keyboard: Space flips the card, 1 for I knew it, 2 for Not yet.</p>
      {!saved && (
        <p className="cards__warn" role="status">
          <Icon name="alert-circle" className="ico ico--sm" /> Your browser blocked storage: progress will not be kept after this visit.
        </p>
      )}
    </div>
  );
}

function Summary({ session, lang }: { session: Session; lang: 'en' | 'fr' }) {
  const lex = useLexicon();
  const ids = Object.keys(session.first);
  const missed = ids.filter((id) => !session.first[id]);
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);
  return (
    <section className="cards__summary" aria-labelledby="summary-title">
      <h2 id="summary-title" className="h2" tabIndex={-1} ref={heading}>Session done</h2>
      <dl className="cards__stats">
        <div><dt>Cards reviewed</dt><dd>{ids.length}</dd></div>
        <div><dt>Known first time</dt><dd>{ids.length - missed.length}</dd></div>
        <div><dt>Not yet</dt><dd>{missed.length}</dd></div>
      </dl>
      {missed.length > 0 && (
        <div className="cards__missed">
          <p className="muted">Back in box 1, they come back today. Read them once more:</p>
          <ul className="cards__missed-list" lang={lang}>
            {missed.map((id) => (
              <li key={id}><Link to={`/word/${id}`}><Inline text={lex.words[id][lang].word} /></Link></li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
