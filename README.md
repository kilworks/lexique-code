# lexique-code

A lexicon of 528 words that change how code gets written, how a problem gets reasoned about, and how an AI coding agent works. Each word comes with what it means and, above all, what the agent concretely does when the word shows up in a prompt.

It comes in two languages, row for row: `LEXICON.md` in English and `LEXIQUE.md` in French, the original. Same 24 sections, same rows, same order, and a check keeps them in step.

## The idea

Saying "make it robust" to an agent gets you a guess. Saying "idempotent, atomic, dry-run" gets you a deploy script that can be rerun safely, never leaves a half-written state, and shows its plan before acting. One word in the prompt maps to one behaviour in the code.

Every row has three columns: the word, its meaning in one line, and the action it triggers. The third column is the point. It has to be a concrete, checkable action, not an intention.

| Word | Meaning | What I do |
|---|---|---|
| atomic | all or nothing, never half-done | write `x.tmp` then `rename`, use a transaction, no visible intermediate state |
| control test | a check you have seen fail | run the negative case first, otherwise the test proves nothing |
| hysteresis | two thresholds, rising and falling | alert at 2 h, clear at 3 h: no flicker |

## What is inside

528 words and 27 combinations across 24 sections: agent steering, method, decision and priority, debugging, reporting, robustness, concurrency and time, data and formats, storage and databases, clarity, architecture, verification, performance, security, shell and scripts, system and processes, networking and distributed systems, CLI and API, user interface, AI and LLMs in code, Git, code evolution, operations, and combinations.

The combinations section lists phrases that work together, for example "blast radius + canary + kill switch + rollback" for shipping a change to a service that is already running.

The agent steering section covers words aimed at the agent rather than the code: "plan first" (plan, then wait for the go-ahead), "stop condition" (a written criterion for when to stop), "change method" (after two failures of the same action, no blind third attempt), and in the reporting section "bottom line first" (the answer on the first line).

## Use it as a Claude Code skill

Clone it into your skills directory:

```
git clone https://github.com/kilworks/lexique-code ~/.claude/skills/lexique-code
```

`SKILL.md` is the entry point Claude loads. It stays small (about 5 KB) and tells the agent to search the lexicon files with grep instead of loading them into context (about 65 KB each). Ask for the meaning of a word, a whole section, or "what is the word for when...", and the agent returns the matching rows. Use a word from the lexicon in a request and the agent applies its third column. `SKILL.md` itself is written in French, the language of the person it was built for; the lexicon files work for anyone.

Nothing ties the lexicon to Claude. It is a plain Markdown table and works as a reference for any agent or for humans.

## Add words

Add one row per word in the right section: `| word | meaning | what I do |`. The same row goes into both files, translated, at the same position in the same section. A synonym goes on the existing row as `word / synonym`, never on a second row. No `|` inside a cell, no em dashes, no curly quotes. A new section also needs a line in the Sections table of `SKILL.md`.

Then run the check and read its exit code:

```
python check.py
```

It prints the counts for each file and exits 1 on a malformed row, an empty cell, a duplicate word or alias, an em dash or curly quote, a section missing from `SKILL.md`, or a parity gap between the two files (a section or a row present in one and not the other). Each of those failures was injected on purpose and seen to turn the check red before it was trusted.
