"""Controle LEXIQUE.md : format des lignes, doublons, sections listees dans SKILL.md.
Usage: python check.py [chemin/LEXIQUE.md]. Sortie 0 si tout va bien, 1 sinon."""
import re
import sys
from collections import Counter
from pathlib import Path

for stream in (sys.stdout, sys.stderr):
    stream.reconfigure(encoding="utf-8")  # sinon cp1252 sous Windows : accents abimes
here = Path(__file__).parent
lex = Path(sys.argv[1]) if len(sys.argv) > 1 else here / "LEXIQUE.md"
skill = (here / "SKILL.md").read_text(encoding="utf-8")
errors, counts, seen, section = [], Counter(), {}, None

for n, line in enumerate(lex.read_text(encoding="utf-8").splitlines(), 1):
    if re.search("[–—‘’“”]", line):
        errors.append(f"{n}: tiret cadratin ou guillemet courbe")
    if line.startswith("## "):
        section = line[3:]
        if section.split(" (mots")[0] not in skill:
            errors.append(f"{n}: section absente de SKILL.md : {section}")
        continue
    if not line.startswith("|") or line.startswith(("|---", "| Mot ", "| Phrase ")):
        continue
    cells = 2 if section == "Combinaisons" else 3
    if line.count("|") != cells + 1 or not all(c.strip() for c in line.split("|")[1:-1]):
        errors.append(f"{n}: {cells} cellules non vides attendues : {line[:60]}")
        continue
    counts[section] += 1
    if section == "Combinaisons":
        continue
    # un mot = une seule ligne : chaque alias separe par " / " doit etre unique dans tout le lexique
    for alias in line.split("|")[1].lower().split(" / "):
        alias = alias.strip()
        if alias in seen:
            errors.append(f"{n}: doublon « {alias} » (deja ligne {seen[alias]})")
        seen[alias] = n

for name, count in counts.items():
    print(f"{count:4d}  {name}")
combos = counts.get("Combinaisons", 0)
print(f"{sum(counts.values()) - combos} mots, {combos} combinaisons, {len(counts)} sections")
for e in errors:
    print(f"ERREUR {lex.name}:{e}", file=sys.stderr)
sys.exit(1 if errors else 0)
