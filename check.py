"""Check LEXIQUE.md: row format, duplicates, every section listed in SKILL.md.
Usage: python check.py [path/LEXIQUE.md]. Exits 0 when clean, 1 otherwise."""
import re
import sys
from collections import Counter
from pathlib import Path

for stream in (sys.stdout, sys.stderr):
    stream.reconfigure(encoding="utf-8")  # Windows defaults to cp1252 and mangles accents
here = Path(__file__).parent
lex = Path(sys.argv[1]) if len(sys.argv) > 1 else here / "LEXIQUE.md"
skill = (here / "SKILL.md").read_text(encoding="utf-8")
errors, counts, seen, section = [], Counter(), {}, None

for n, line in enumerate(lex.read_text(encoding="utf-8").splitlines(), 1):
    if re.search("[\u2013\u2014\u2018\u2019\u201c\u201d]", line):
        errors.append(f"{n}: em/en dash or curly quote")
    if line.startswith("## "):
        section = line[3:]
        if section.split(" (mots")[0] not in skill:
            errors.append(f"{n}: section missing from SKILL.md: {section}")
        continue
    if not line.startswith("|") or line.startswith(("|---", "| Mot ", "| Phrase ")):
        continue
    cells = 2 if section == "Combinaisons" else 3
    if line.count("|") != cells + 1 or not all(c.strip() for c in line.split("|")[1:-1]):
        errors.append(f"{n}: expected {cells} non-empty cells: {line[:60]}")
        continue
    counts[section] += 1
    if section == "Combinaisons":
        continue
    # one word = one row: each alias separated by " / " must be unique across the whole lexicon
    for alias in line.split("|")[1].lower().split(" / "):
        alias = alias.strip()
        if alias in seen:
            errors.append(f"{n}: duplicate '{alias}' (already on line {seen[alias]})")
        seen[alias] = n

for name, count in counts.items():
    print(f"{count:4d}  {name}")
combos = counts.get("Combinaisons", 0)
print(f"{sum(counts.values()) - combos} words, {combos} combinations, {len(counts)} sections")
for e in errors:
    print(f"ERROR {lex.name}:{e}", file=sys.stderr)
sys.exit(1 if errors else 0)
