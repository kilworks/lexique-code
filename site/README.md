# Learning site

The site at https://kilworks.github.io/lexique-code/ teaches the 528 words of `LEXICON.md` / `LEXIQUE.md` to humans. This file is the map of what exists and the rules it was built under. Read it before changing anything: extend what is here, do not rebuild it.

## Run it

```
cd site
npm ci
npm run dev        # rebuilds src/data/lexicon.json, then serves with hot reload
npm run verify     # every gate, see "Gates"
npm run verify -- --live   # same, plus: does the deployed page serve this build?
```

On a Windows machine where a shell proxy breaks `npx vite`, call the tools directly: `node node_modules/vite/bin/vite.js`, `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/vitest/vitest.mjs run`.

## Stack and fixed decisions

- Vite + React 18 + TypeScript. Runtime dependencies: `react`, `react-dom`, `react-router-dom`, nothing else. A new dependency needs a written reason (gzip size, alternative rejected).
- `HashRouter` (GitHub Pages has no SPA fallback), Vite `base: '/lexique-code/'`.
- No backend, no account. Progress lives in `localStorage` through `lib/storage.ts`, which never throws: the site works with storage blocked.
- UI chrome in English. Content language EN / FR, default EN, remembered.
- Plain CSS with design tokens as custom properties (`src/styles/tokens.css`, read the design brief at its top). No Tailwind, no UI kit. Icons are lucide paths in an SVG sprite (`components/Icon.tsx`), never hand drawn, never emoji.
- Light and dark themes (system default, manual switch in the footer), WCAG 2.2 AA contrast, keyboard navigable, no horizontal scroll at 360 px, `prefers-reduced-motion` respected.
- No en dash, em dash or curly quote anywhere, content included (checked by `npm run verify`).

## Data: one source of truth

`scripts/build-data.mjs` (Node, no dependency) runs before `dev` and `build`. It reads `../LEXICON.md`, `../LEXIQUE.md` and `../enrich/*.json`, and writes `src/data/lexicon.json` (git ignored). It fails with a message naming the problem on: section or row count mismatch between EN and FR, duplicate id, a row with the wrong cell count, enrichment for an unknown word or for a word of another section, an enrich entry missing `why` / `example` / `pitfall` in either language, a word without enrichment, invalid JSON.

Consequence: adding a word to the lexicon now requires its `enrich/<section>.json` entry in the same change, or the site build and the deploy fail.

- Word id: slug of the English word (NFKD, ASCII only, lowercase, non `[a-z0-9]` runs become `-`). Symbol-only words such as `--` use the Unicode names of their characters (`hyphen-minus-hyphen-minus`).
- Aliases: the word cell split on ` / `, plus the part before ` (`. They drive search, the workshop and combination links.
- Combinations: each `+` term resolves to a word by exact alias, then by alias prefix; unresolved terms stay as text and are logged.
- `lexicon.json` is its own chunk (about 330 KB gzip), loaded after the shell paints (`components/data.tsx`).

Enrichment shape, one file per word section (23 files, none for combinations):

```json
{ "<word-id>": {
    "en": { "why": "2 to 3 sentences", "example": { "kind": "code|prompt|command", "lang": "python", "before": "...", "after": "..." }, "pitfall": "one sentence" },
    "fr": { "...": "same content in natural French, code identical except comments and strings" } } }
```

All 528 entries were written by one writer per section and checked by a separate skeptical reviewer who fixed wrong claims, invented flags, examples that did not contrast and French calques.

## Pages

| Route | File | What it does | Storage |
|---|---|---|---|
| `/` | `pages/Home.tsx` | pitch, word of the day (deterministic from the date), four ways to learn, progress summary, sections | reads `srs`, `quiz` |
| `/glossary` | `pages/Glossary.tsx` | accent-insensitive search over word, aliases, meaning and action, section chips, grouped results, `/` focuses search | |
| `/word/:id` | `pages/Word.tsx` | meaning, action (highlighted), why, before/after example, pitfall, twin in the other language, nearby words, combinations, diagram when one exists, add to my cards | writes `mycards` |
| `/cards` | `pages/Cards.tsx` | Leitner flashcards, 5 boxes, intervals 0/1/3/7/16 days, deck by section or my cards, 3 modes (word, meaning, action), swipe right/left or keys Space, 1, 2 | `srs`, `mycards` |
| `/learn` | `pages/Learn.tsx` | path: Method, Robustness, Verification, Security, Operations first, then the rest, progress per section | reads `quiz` |
| `/learn/:section` | `pages/Lesson.tsx` | the section in steps of about 6 words, with a quick check | |
| `/learn/:section/quiz` | `pages/Quiz.tsx` | 10 seeded questions (word for action, meaning of word, action for word, complete the combination), feedback explains the wrong pick, mistakes go to the cards | writes `quiz`, `srs` |
| `/workshop` | `pages/Workshop.tsx` | paste a prompt, see which lexicon words it uses (EN and FR) and which combinations it could complete; nothing leaves the browser | |
| `/map` | `pages/Map.tsx` | all words clustered by section, 82 combination links, hover or focus shows neighbours, search, section filter, zoom and pan, keys: arrows move, Enter opens, Shift+arrows pan, + / - zoom, 0 resets, Esc clears; list view as the accessible alternative | |
| `*` | `pages/NotFound.tsx` | unknown route or word id | |

Cards, Lesson, Quiz, Workshop and Map are lazy loaded (`React.lazy` in `App.tsx`), which keeps the entry chunk small.

## Libraries (`src/lib`, pure, each with Vitest tests)

| File | Role |
|---|---|
| `normalize.ts` | accent and case folding, query terms |
| `search.ts` | glossary search, keeps lexicon order |
| `storage.ts` | safe `read` / `write`, the `KEYS` list, validators |
| `srs.ts` | Leitner logic, local calendar days via `Date.UTC` (DST safe), `markMistakes` |
| `quiz.ts` | seeded quiz generator, path order, best scores |
| `progress.ts` | home summary, trusts nothing it reads |
| `workshop.ts` | alias matcher (longest match first, word boundaries, symbol words), suggestions; `STOP` lists halves of `a / b` words that are everyday words |
| `swipe.ts` | flashcard swipe state machine: tap slop 8 px, flick 24 px at 0.11 px/ms, commit at the threshold |
| `graph.ts` | deterministic map layout: section clusters placed so linked sections sit close, adjacency, keyboard neighbour search |
| `sims.ts` | seeded state machines behind the diagrams (mulberry32), replayed from the start so Back, Reset and sliders are "recompute n steps" |

New logic in `lib` gets tests, and each new test is first seen failing on a deliberately broken copy.

## Storage keys

All versioned, so a shape change moves to `v2` instead of breaking old browsers.

| Key | Shape | Owner |
|---|---|---|
| `lexicon.lang.v1` | `"en" \| "fr"` | prefs |
| `lexicon.theme.v1` | `"light" \| "dark" \| "system"` | prefs |
| `lexicon.mycards.v1` | `string[]` of word ids | Word, Cards |
| `lexicon.srs.v1` | `{ [wordId]: { box: 1..5, due: "YYYY-MM-DD" } }`; a quiz mistake writes `{ box: 1, due: today }` through `markMistakes` | Cards, Quiz |
| `lexicon.quiz.v1` | `{ [sectionId]: { best, total } }` | Quiz |

## Diagrams

Ten words have an interactive diagram on their page: `backpressure`, `circuit-breaker`, `backoff-jitter`, `race-condition`, `idempotent`, `blue-green`, `fan-out-fan-in`, `eventual-consistency`, `rate-limit`, `single-flight`.

- `components/diagrams/index.tsx` holds `DIAGRAM_IDS` (the only part shipped with the word page) and lazy loads `Registry.tsx`, which maps each id to its lazy component.
- Every diagram renders `DiagramFrame` (`Frame.tsx`) with: `title`, `practice` (toggle label "Without / With ..."), `summary` (text read instead of the picture), a `sim` from `lib/sims.ts`, `controls` (sliders), `defaults`, optional `start` step, `caption`, `stats` and `draw` (SVG). The frame provides Play, Back, Step, Reset, the without/with toggle, keyboard control, pause when off screen, and static steps under reduced motion. Labels are bilingual in each component.
- To add one: write the sim with tests in `lib/sims.ts`, the component in `components/diagrams/`, add the id to `DIAGRAM_IDS` and `Registry.tsx`, keep labels readable at 320 px (the SVG has `min-width: 320px` and its stage scrolls).

## Motion

Curves and keyframes in `styles/motion.css`; values in the tokens brief: color fades 120 ms, card flip 260 ms, swipe release 200 ms (a fling follows its speed), lesson step 180 ms, quiz shake 200 ms, glossary results rising 180 ms once per filter, diagram edge draw 250 ms, map zoom glide 250 ms. Only `transform` and `opacity` move. Under reduced motion nothing moves; only the opacity fades that carry state remain.

## Gates

`npm run verify` runs, each exit code on its own: build (data, tsc, vite), Vitest (140 tests on 2026-11-17), the banned character scan over `src`, `scripts`, `index.html` and `../enrich`, `python check.py` (EN/FR parity), and the entry chunk budget. `--live` adds the deployed page check.

Budget, gzip bytes of the entry chunks: JS 66 000, CSS 6 000 (measured at 65.4 KB and 5.5 KB). Raise it only with a written reason; a new page or heavy feature goes behind `React.lazy`.

Visual check: build, serve with `vite preview`, then screenshot every route in light and dark, at 360 and 1280, plus one reduced motion run, and look at the images. A gate passing is not a page looking right.

## Deploy

`.github/workflows/pages.yml`: on push to `main`, Node 22, `npm ci` and `npm run build` in `site/`, upload `site/dist`, deploy with `actions/deploy-pages`. The repository's Pages source is set to GitHub Actions. After a push, `npm run verify -- --live` confirms the site serves the new asset hashes.

## Known limits

- Swipe tested with a mouse only, not on a touch device. Chromium only; Firefox and Safari unchecked.
- On a phone at the fitted zoom, map labels of one cluster can still overlap.
- `lexicon.json` is one 330 KB gzip chunk; splitting it per section would need changes in `build-data.mjs`, `data.tsx` and the types.
- Diagrams are keyed by word id in code, not by an `enrich` field.
