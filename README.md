# lexique-code

A lexicon of 528 words that change how code gets written, how a problem gets reasoned about, and how an AI coding agent works. Each word comes with what it means and, above all, what the agent concretely does when the word shows up in a prompt.

The lexicon itself is written in French by design: it is the working vocabulary of a French-speaking developer. The tooling and this README are in English. Most entries are international technical terms (idempotent, TOCTOU, backpressure, blast radius, canary), so the left column reads fine either way.

## The idea

Saying "make it robust" to an agent gets you a guess. Saying "idempotent, atomic, dry-run" gets you a deploy script that can be rerun safely, never leaves a half-written state, and shows its plan before acting. One word in the prompt maps to one behaviour in the code.

Every row has three columns: the word, its meaning in one line, and the action it triggers. The third column is the point. It has to be a concrete, checkable gesture, not an intention.

| Mot | Sens | Ce que je fais |
|---|---|---|
| atomique | tout ou rien, jamais à moitié | écrire `x.tmp` puis `rename`, une transaction, pas d'état intermédiaire visible |
| test témoin | un contrôle qu'on a vu rougir | lancer le cas négatif d'abord, sinon le test ne prouve rien |
| hystérésis | deux seuils, montée et descente | alerte à 2 h, levée à 3 h : pas de clignotement |

(Atomic: all or nothing, write to a temp file then rename. Control test: a check only counts once you have seen it fail. Hysteresis: separate thresholds for raising and clearing an alert, so it does not flap.)

## What is inside

`LEXIQUE.md` holds 528 words and 27 combinations across 24 sections: agent steering, method, decision and priority, debugging, reporting, robustness, concurrency and time, data and formats, storage and databases, clarity, architecture, verification, performance, security, shell scripting, system and processes, networking and distributed systems, CLI and API design, user interface, AI and LLMs in code, Git, code evolution, operations, and combinations.

The combinations section lists phrases that work together, for example "blast radius + canary + kill switch + rollback" for shipping a change to a service that is already running.

The agent steering section covers words aimed at the agent rather than the code: "plan d'abord" (plan first, wait for approval), "condition d'arrêt" (a written stop condition), "conclusion d'abord" (answer in the first line), "change de méthode" (after two failures of the same move, change approach instead of retrying).

## Use it as a Claude Code skill

Copy the folder into your skills directory:

```
git clone https://github.com/kilworks/lexique-code ~/.claude/skills/lexique-code
```

`SKILL.md` is the entry point Claude loads. It stays small (about 4 KB) and tells the agent to search `LEXIQUE.md` with grep instead of loading all 66 KB into context. Ask for the meaning of a word, a whole section, or "what is the word for when...", and the agent returns the matching rows. Use a word from the lexicon in a request and the agent applies its third column.

Nothing ties the lexicon to Claude. It is a plain Markdown table and works as a reference for any agent or for humans.

## Add words

Put one row per word in the right section of `LEXIQUE.md`: `| word | meaning | what I do |`. A synonym goes on the existing row as `word / synonym`, never on a second row. No `|` inside a cell, no em dashes, no curly quotes. A new section also needs a line in the Sections table of `SKILL.md`.

Then run the check and read its exit code:

```
python check.py
```

It prints the count per section and exits 1 on a malformed row, an empty cell, a duplicate word or alias, an em dash or curly quote, or a section missing from `SKILL.md`. Each of those failures was injected on purpose and seen to turn the check red before it was trusted.
