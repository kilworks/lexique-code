import { lazy, Suspense } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from './components/data';
import { IconSprite } from './components/Icon';
import { PrefsProvider } from './components/prefs';
import { Layout } from './components/Shell';
import Glossary from './pages/Glossary';
import Home from './pages/Home';
import Learn from './pages/Learn';
import NotFound from './pages/NotFound';
import Word from './pages/Word';

// heavier pages are their own chunks: the first page does not pay for them
const WordMap = lazy(() => import('./pages/Map'));
const Cards = lazy(() => import('./pages/Cards'));
const Lesson = lazy(() => import('./pages/Lesson'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Workshop = lazy(() => import('./pages/Workshop'));
const loading = <p className="state-msg" role="status">Loading...</p>;
const wait = (el: JSX.Element) => <Suspense fallback={loading}>{el}</Suspense>;

export default function App() {
  return (
    <PrefsProvider>
      <DataProvider>
        <IconSprite />
        <HashRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="glossary" element={<Glossary />} />
              <Route path="word/:id" element={<Word />} />
              <Route path="cards" element={wait(<Cards />)} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/:section" element={wait(<Lesson />)} />
              <Route path="learn/:section/quiz" element={wait(<Quiz />)} />
              <Route path="workshop" element={wait(<Workshop />)} />
              <Route path="map" element={wait(<WordMap />)} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </DataProvider>
    </PrefsProvider>
  );
}
