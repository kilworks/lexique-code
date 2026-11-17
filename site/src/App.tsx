import { HashRouter, Route, Routes } from 'react-router-dom';
import { DataProvider } from './components/data';
import { IconSprite } from './components/Icon';
import { PrefsProvider } from './components/prefs';
import { Layout } from './components/Shell';
import Cards from './pages/Cards';
import Glossary from './pages/Glossary';
import Home from './pages/Home';
import Learn from './pages/Learn';
import Lesson from './pages/Lesson';
import NotFound from './pages/NotFound';
import Quiz from './pages/Quiz';
import Word from './pages/Word';
import Workshop from './pages/Workshop';

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
              <Route path="cards" element={<Cards />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/:section" element={<Lesson />} />
              <Route path="learn/:section/quiz" element={<Quiz />} />
              <Route path="workshop" element={<Workshop />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </DataProvider>
    </PrefsProvider>
  );
}
