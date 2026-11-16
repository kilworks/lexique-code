"""Check the lexicon: row format, duplicates, every section listed in SKILL.md, and
French/English parity (same sections, same row count per section, same order).
Usage: python check.py [LEXIQUE.md [LEXICON.md]]. Without arguments, checks both files
next to this script. Exits 0 when clean, 1 otherwise."""
import re
import sys
from collections import Counter
from pathlib import Path

for stream in (sys.stdout, sys.stderr):
    stream.reconfigure(encoding="utf-8")  # Windows defaults to cp1252 and mangles accents
here = Path(__file__).parent
paths = [Path(p) for p in sys.argv[1:]] or [p for p in (here / "LEXIQUE.md", here / "LEXICON.md") if p.exists()]
skill = (here / "SKILL.md").read_text(encoding="utf-8")
errors = []


def parse(path):
    """Sections as [(title, cells, [rows])]; the cell count comes from each section's header row."""
    sections, header_due = [], False
    for n, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
        if re.search("[–—‘’“”]", line):
            errors.append(f"{path.name}:{n}: em/en dash or curly quote")
        if line.startswith("## "):
            sections.append((line[3:], 0, []))
            header_due = True
            continue
        if not line.startswith("|") or line.startswith("|---"):
            continue
        cells = line.count("|") - 1
        if not sections:
            errors.append(f"{path.name}:{n}: table row before any section")
        elif header_due:
            title, _, rows = sections[-1]
            sections[-1] = (title, cells, rows)
            header_due = False
        elif cells != sections[-1][1] or not all(c.strip() for c in line.split("|")[1:-1]):
            errors.append(f"{path.name}:{n}: expected {sections[-1][1]} non-empty cells: {line[:60]}")
        else:
            sections[-1][2].append((n, line))
    return sections


parsed = []
for i, path in enumerate(paths):
    sections = parse(path)
    parsed.append(sections)
    seen, counts = {}, Counter()
    for title, cells, rows in sections:
        counts["combinations" if cells == 2 else "words"] += len(rows)
        if i == 0 and title.split(" (mots")[0] not in skill:
            errors.append(f"{path.name}: section missing from SKILL.md: {title}")
        if cells != 3:
            continue
        # one word = one row: each alias separated by " / " must be unique across the whole file
        for n, line in rows:
            for alias in line.split("|")[1].lower().split(" / "):
                alias = alias.strip()
                if alias in seen:
                    errors.append(f"{path.name}:{n}: duplicate '{alias}' (already on line {seen[alias]})")
                seen[alias] = n
    print(f"{path.name}: {counts['words']} words, {counts['combinations']} combinations, {len(sections)} sections")

if len(parsed) == 2:
    a, b = parsed
    if len(a) != len(b):
        errors.append(f"parity: {len(a)} sections in {paths[0].name}, {len(b)} in {paths[1].name}")
    for (ta, ca, ra), (tb, cb, rb) in zip(a, b):
        if (ca, len(ra)) != (cb, len(rb)):
            errors.append(f"parity: '{ta}' has {len(ra)} rows of {ca} cells, '{tb}' has {len(rb)} rows of {cb} cells")

for e in errors:
    print(f"ERROR {e}", file=sys.stderr)
sys.exit(1 if errors else 0)
