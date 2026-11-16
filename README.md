# lexique-code

A lexicon of 528 words that turn a vague prompt into a precise one. For each word: what it means in one line, and what a coding agent concretely does when the word shows up in a prompt.

![words](https://img.shields.io/badge/words-528-2f6feb)
![combinations](https://img.shields.io/badge/combinations-27-8250df)
![sections](https://img.shields.io/badge/sections-24-1a7f37)
![languages](https://img.shields.io/badge/languages-English%20%7C%20French-bf3989)
![Claude Code skill](https://img.shields.io/badge/Claude%20Code-skill-d97757)

`LEXICON.md` is the English lexicon and `LEXIQUE.md` the French original. They match row for row: same 24 sections, same rows, same order.

## Contents

- [Why a lexicon](#why-a-lexicon)
- [How to read a row](#how-to-read-a-row)
- [Before and after](#before-and-after)
- [A tour of the 24 sections](#a-tour-of-the-24-sections)
- [Combinations](#combinations)
- [Where to start](#where-to-start)
- [Use it](#use-it)
- [Add words](#add-words)

## Why a lexicon

Ask an agent to "make it robust" and you get its guess of what robust means. Ask for "idempotent, atomic, dry-run" and you get something specific: a script you can rerun safely, that never leaves a half-written state, and that shows its plan before it acts.

Engineering already has precise words for most of what we want from code. They took decades of outages, postmortems and code reviews to settle, and each one packs a whole practice into a few syllables. This lexicon collects them and pins each to a concrete action, so the word does real work in a prompt instead of sounding nice.

It works the other way too. When you know there is a word for a quality ("the alert keeps switching on and off" is flapping, and the fix is hysteresis), you can ask for it directly and check that you got it.

## How to read a row

Every row has three columns.

```mermaid
flowchart LR
    W["Word<br/><i>idempotent</i>"] --> M["Meaning<br/><i>rerunning gives the same state</i>"]
    M --> A["What I do<br/><i>check before acting, mkdir -p,<br/>never append twice</i>"]
    A --> V["Something you can verify<br/><i>run it twice, diff the result</i>"]
```

| Word | Meaning | What I do |
|---|---|---|
| idempotent | rerunning gives the same state | check before acting, `mkdir -p`, replace a delimited block and never append it twice |

The first column is the word you type. The second is a one-line definition, short enough to keep in your head. The third column is the important one: it is written from the agent's point of view ("I") and names a concrete, checkable action. "Be careful with state" would not qualify. "Check before acting, `mkdir -p`" does, because you can look at the code and see whether it happened.

## Before and after

The same request, without and with the lexicon.

| You write | What you tend to get |
|---|---|
| "Write a script that syncs the folders." | A loop that copies files. Run it twice and you get duplicates; kill it halfway and you get a half-copied folder. |
| "Write a script that syncs the folders. Idempotent, atomic, dry-run." | It checks what already exists before copying, writes to a temp name then renames, and prints its plan unless you pass `--apply`. |

| You write | What you tend to get |
|---|---|
| "The upload fails sometimes, fix it." | A retry wrapped around the call, and the bug is still there. |
| "The upload fails sometimes. Root cause, minimal repro, regression test." | The smallest input that still fails, a fix where the cause is, and a test that replays that exact input so the bug cannot come back silently. |

| You write | What you tend to get |
|---|---|
| "Deploy the new version." | The new version, everywhere, at once. |
| "Deploy the new version. Blast radius, canary, kill switch, rollback." | One instance first, watched; a one-step stop; the way back written down before the deploy starts. |

## A tour of the 24 sections

One example per section, quoted straight from `LEXICON.md`.

| Section | Words | Example | What the agent does |
|---|---:|---|---|
| Agent steering | 22 | plan first | steps, files touched, risks; I wait for the go-ahead |
| Method | 36 | root cause | trace back to what explains all the symptoms, fix there once |
| Decision and priority | 12 | sunk cost | judge on what remains to do, drop it if another route is shorter |
| Debugging | 12 | one variable at a time | otherwise impossible to know what fixed or broke it |
| Reporting and communication | 15 | bottom line first (BLUF) | verdict, then proof, then detail only if it helps |
| Robustness | 38 | idempotent | check before acting, `mkdir -p`, replace a delimited block and never append it twice |
| Concurrency and time | 31 | TOCTOU | act and check in one operation (`O_EXCL`, `rename`, `mkdir` as a lock) |
| Data and formats | 29 | parse, don't validate | parse at the boundary, the rest of the code only sees typed values |
| Storage and databases | 8 | upsert | `INSERT ... ON CONFLICT`, no read then write |
| Clarity | 35 | early return | guards at the top of the function, happy path flat |
| Architecture | 18 | deep module | few public functions, the complexity hidden inside |
| Verification | 42 | control test | run the negative case first, otherwise the test proves nothing |
| Performance | 25 | N+1 | group into one query or a batch |
| Security | 36 | path traversal | resolve the path, check it stays under the root |
| Shell and scripts | 26 | mktemp + trap | `trap 'rm -rf "$t"' EXIT` |
| System and processes | 15 | kill by PID | PID read then verified, never a broad pattern |
| Networking and distributed systems | 13 | split-brain | external arbiter or quorum, never two writers |
| Interfaces (CLI and API) | 13 | machine output | `--json` next to the readable output, fields never renamed |
| User interface | 16 | screen states | draw and code each one, not only the full case |
| AI and LLMs in code | 13 | prompt injection | treat it as data, do not execute it, flag it |
| Git | 12 | reflog | a "lost" commit is found there: look before redoing the work |
| Code evolution | 24 | expand / contract | never all three in the same deployment |
| Operations | 37 | kill switch | `STOP` file read on every loop |
| Combinations | 27 | idempotent + atomic + dry-run | rerunnable deployment script that shows its plan, with no half-done state |

Two sections are about the agent rather than the code. Agent steering sets how it works: how hard it thinks, when it asks, when it stops ("stop condition", "change method" after two failed attempts). Reporting and communication sets how it tells you what happened: the answer first, facts kept apart from guesses, and every gap named instead of hidden.

## Combinations

Words get stronger in groups. Each one closes a gap the others leave open.

Take "idempotent + atomic + dry-run". Idempotent alone lets you rerun a script, but a crash halfway can still leave a mess. Atomic removes the half-done state. Dry-run lets you see the plan before anything changes. Together they describe a deploy script you can trust at 3 a.m.

The last section lists 27 of these groups, for bug fixes ("root cause + minimal repro + regression test"), risky rollouts ("blast radius + canary + kill switch + rollback"), legacy code ("surgical + Chesterton + characterization") and more.

## Where to start

528 words is a lot to take in. Five sections cover most day-to-day prompts: Method, Robustness, Verification, Security and Operations. Inside them, these ten words come up again and again.

| When | Words |
|---|---|
| Before writing code | acceptance criteria, edge cases, pre-mortem |
| While writing it | idempotent, atomic, timeout, bounded |
| Before calling it done | control test, dry-run, blast radius |

Use one in your next prompt, check that the third column happened, then add another.

## Use it

In a prompt, just use the words. They are standard engineering terms, so any capable model understands them; the lexicon makes the expected behaviour explicit and lets you check it.

As a Claude Code skill, clone the repo into your skills folder:

```
git clone https://github.com/kilworks/lexique-code ~/.claude/skills/lexique-code
```

`SKILL.md` is the entry point Claude loads. It is small (about 5 KB) and tells the agent to search the lexicon files with grep instead of loading them into context (about 65 KB each). Ask what a word means, ask for a whole section, or ask "what is the word for when...", and the agent returns the matching rows. `SKILL.md` is written in French, the language of the person it was built for; the lexicon files work for anyone.

As a reference, read `LEXICON.md` like a glossary. It is plain Markdown and nothing ties it to Claude.

## Add words

Add one row per word in the right section: `| word | meaning | what I do |`. The same row goes into both files, translated, at the same position in the same section. A synonym goes on the existing row as `word / synonym`, never on a second row. No `|` inside a cell, no em dashes, no curly quotes. A new section also needs a line in the Sections table of `SKILL.md`.

Then run the check and read its exit code:

```
python check.py
```

It prints the counts for each file and exits 1 on a malformed row, an empty cell, a duplicate word or alias, an em dash or curly quote, a section missing from `SKILL.md`, or a parity gap between the two files (a section or a row present in one and not the other). Each of those failures was injected on purpose and seen to turn the check red before it was trusted.
