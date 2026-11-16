---
name: lexique-code
description: "Lexique de kil : plusieurs centaines de mots qui changent la facon de coder, de raisonner et de piloter Claude (idempotent, atomique, TOCTOU, backpressure, cause racine, pre-mortem, test temoin, blast radius, ultrathink, plan d'abord, conclusion d'abord...), ranges par domaine dans LEXIQUE.md : pour chaque mot, son sens en une ligne et ce que Claude fait concretement quand kil l'emploie. Use when kil asks for the lexicon or /lexique, asks what one of these words means, looks for a word to name a quality he wants in code or in the way Claude works, or wants to add words to it."
---

# lexique-code

Un mot dans le prompt = un comportement dans le code.
Le lexique est dans `LEXIQUE.md` (même dossier) : une ligne par mot, trois colonnes (mot, sens, ce que je fais quand le mot est là). Je ne le charge jamais en entier : je cherche dedans.

## Comment je m'en sers

| Demande de kil | Ce que je fais |
|---|---|
| le sens d'un mot | `Grep` du mot dans `LEXIQUE.md`, sans tenir compte de la casse, et je rends sa ligne |
| un domaine (« le lexique réseau ») | `Grep "^## "` pour situer la section, `Read` de cette plage seule, je l'affiche |
| une qualité à nommer (« comment on dit quand... ») | `Grep` de 2 ou 3 mots-clés du besoin dans les colonnes sens et geste, je propose 1 à 3 mots avec leur ligne |
| le lexique entier | le chemin de `LEXIQUE.md` et la liste des sections ci-dessous, pas de copie dans le chat |
| un mot du lexique employé dans une demande | j'applique sa colonne 3, sans le redéfinir |
| plusieurs mots ensemble | section Combinaisons, en fin de fichier |

## Sections

| Section | Exemples |
|---|---|
| Pilotage de l'agent | ultrathink, `/effort`, plan d'abord, périmètre, condition d'arrêt, passation |
| Méthode | cause racine, repro minimal, pré-mortem, steelman, timebox |
| Décision et priorité | Pareto, risque d'abord, MVP, coût irrécupérable |
| Débogage | lire l'erreur en entier, instrumenter, une variable à la fois |
| Rendu et communication | conclusion d'abord, écarts, check en un clic, ratio traités / total |
| Robustesse | idempotent, atomique, reprenable, quarantaine, watchdog |
| Concurrence et temps | race condition, TOCTOU, backpressure, hystérésis |
| Données et formats | parse don't validate, schéma, forme canonique, somme de contrôle |
| Stockage et bases | transaction, contrainte, upsert, SQLite en WAL |
| Clarté | sémantique, fonction pure, YAGNI, early return |
| Architecture | ports et adaptateurs, module profond, pipeline à étapes |
| Vérification | invariant, test témoin, dry-run, hermétique, sonde muette |
| Performance | profiler avant d'optimiser, N+1, streaming, centiles |
| Sécurité | frontière de confiance, allowlist, moindre privilège, modèle de menace |
| Shell et scripts | mode strict, tout citer, mktemp + trap, POSIX sh vs bash |
| Système et processus | signaux, kill par PID, OOM, unité systemd |
| Réseau et systèmes répartis | reconnexion avec reprise, NAT, split-brain, DNS et TTL |
| Interfaces (CLI et API) | sortie machine, non interactif, webhook signé |
| Interface utilisateur | états d'un écran, annulable, accessible, tokens de design |
| IA et LLM dans le code | injection de prompt, sortie structurée, jeu d'évaluation |
| Git | relire son diff, ajouter par nom, worktree, reflog |
| Évolution du code | commit atomique, expand / contract, semver, dérive |
| Exploitation | rollback, blast radius, canary, kill switch, runbook |
| Combinaisons | phrases de plusieurs mots et ce qu'elles produisent |

## Ajouter des mots

- Une ligne par mot, dans la bonne section : `| mot | sens | ce que je fais |`. La colonne 3 est un geste concret et vérifiable, pas une intention.
- Un mot = une seule ligne. Un synonyme va dans la ligne existante (`mot / synonyme`), jamais dans une seconde ligne.
- Pas de `|` dans une cellule, pas de tiret cadratin, pas de guillemet courbe.
- Une nouvelle section s'ajoute aussi au tableau Sections ci-dessus.
- Puis `python check.py` dans ce dossier (format, doublons, sections, compte par section). Code de sortie 0 exigé, lu à part, jamais à travers un pipe.
- Ce dossier est la source. Deux copies en dépendent : le dépôt `claude-skills` (par son `sync.ps1`) et le dépôt privé `lexique-code` (clone dans `~/Downloads/02 - Projects/lexique-code`). Après un changement : recopier `SKILL.md`, `LEXIQUE.md` et `check.py` dans le clone, commiter, pousser.
