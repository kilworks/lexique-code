import { useEffect, type ReactNode } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useData } from './data';
import { Icon } from './Icon';
import { usePrefs } from './prefs';

const NAV = [
  { to: '/glossary', label: 'Glossary' },
  { to: '/cards', label: 'Cards' },
  { to: '/learn', label: 'Learn' },
  { to: '/workshop', label: 'Workshop' },
];

const THEMES = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' },
] as const;

export const REPO_URL = 'https://github.com/kilworks/lexique-code';

export function Header() {
  const { lang, setLang, theme, setTheme } = usePrefs();
  return (
    <header className="site-header">
      <div className="site-header__inner">
        <Link to="/" className="logo">Code lexicon</Link>
        <nav aria-label="Main" className="nav">
          {NAV.map((n) => (
            <NavLink key={n.to} to={n.to} className="nav__link">{n.label}</NavLink>
          ))}
        </nav>
        <div className="prefs">
          <div className="segmented" role="group" aria-label="Content language">
            {(['en', 'fr'] as const).map((l) => (
              <button key={l} type="button" className="segmented__btn" aria-pressed={lang === l} onClick={() => setLang(l)}>
                <span aria-hidden="true">{l.toUpperCase()}</span>
                <span className="sr-only">{l === 'en' ? 'English' : 'French'}</span>
              </button>
            ))}
          </div>
          <div className="segmented" role="group" aria-label="Theme">
            {THEMES.map((t) => (
              <button key={t.value} type="button" className="segmented__btn" aria-pressed={theme === t.value} onClick={() => setTheme(t.value)}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <p>Words that change how code gets written and how an agent works, in English and French.</p>
        <a href={REPO_URL} className="link-ext" rel="noreferrer" target="_blank">
          Source on GitHub <Icon name="external-link" className="ico ico--sm" />
          <span className="sr-only">(opens in a new tab)</span>
        </a>
      </div>
    </footer>
  );
}

/** Route pages need the lexicon: hold them until it has loaded. */
function DataGate({ children }: { children: ReactNode }) {
  const data = useData();
  if (data.status === 'loading') {
    return <p className="state-msg" role="status">Loading the lexicon...</p>;
  }
  if (data.status === 'error') {
    return (
      <div className="state-msg" role="alert">
        <Icon name="alert-triangle" className="ico ico--lg" />
        <h1 className="h3">The lexicon could not load</h1>
        <p className="muted">{data.message}</p>
        <button type="button" className="btn btn--secondary" onClick={() => window.location.reload()}>Reload the page</button>
      </div>
    );
  }
  return <>{children}</>;
}

export function Layout() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return (
    <>
      <a href="#main" className="skip-link" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus(); }}>
        Skip to content
      </a>
      <Header />
      <main id="main" className="site-main" tabIndex={-1}>
        <DataGate><Outlet /></DataGate>
      </main>
      <Footer />
    </>
  );
}

/** Placeholder state for routes still being built. */
export function ComingSoon({ title, text }: { title: string; text: string }) {
  return (
    <div className="page">
      <div className="state-msg">
        <Icon name="info" className="ico ico--lg" />
        <h1 className="h1">{title}</h1>
        <p className="lead">{text}</p>
        <p className="muted">This part of the site is coming soon.</p>
        <Link to="/glossary" className="btn btn--secondary">Browse the glossary meanwhile</Link>
      </div>
    </div>
  );
}
