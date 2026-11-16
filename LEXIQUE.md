# Lexique code

Un mot dans le prompt = un comportement dans le code. Colonne 3 : ce que je fais quand le mot est là.
Les combinaisons utiles sont à la fin. Mode d'emploi et ajout de mots : `SKILL.md`. Contrôle : `python check.py`.

## Pilotage de l'agent (mots qui règlent ma façon de travailler)

| Mot | Sens | Ce que je fais |
|---|---|---|
| ultrathink | mot-clé : réfléchir à fond sur ce tour | raisonnement long avant d'agir : options, risques, cas limites, puis une décision tranchée |
| `/effort` | commande qui règle le niveau d'effort de la session (low à max) | plus haut : je creuse et je vérifie davantage ; plus bas : réponse directe et courte |
| survol / rapide | l'essentiel sans creuser | quelques lignes, aucune exploration au-delà du nécessaire, limites dites |
| plan d'abord | le plan avant le premier changement | étapes, fichiers touchés, risques ; j'attends le feu vert |
| propose seulement | des idées, aucune action | propositions numérotées, je ne touche à rien |
| autonome / sans demander | décider seul dans le périmètre | j'avance, je note mes choix, je ne m'arrête que devant l'irréversible |
| périmètre / ne touche pas à | ce qui est dedans, ce qui est interdit | liste écrite, rien hors liste même « pour aider » |
| hypothèses explicites | ce que je suppose, écrit | les lister avant d'agir, kil corrige en une ligne |
| reformule | redire la demande avant d'agir | une phrase : ce que j'ai compris, ce que je vais livrer |
| question bloquante | ne demander que ce qui bloque vraiment | questions groupées en une fois, chacune avec ma recommandation |
| état des lieux | regarder avant d'agir | inventaire de l'existant (fichiers, services, versions) avant toute modification |
| pas à pas | une étape, sa vérification, la suivante | jamais plusieurs changements non vérifiés empilés |
| condition d'arrêt | quand je dois m'arrêter | critère écrit (N échecs, budget atteint, doute sur l'irréversible), respecté |
| budget | plafond de tokens, de temps ou d'appels | le compter, m'arrêter au plafond et rendre l'état atteint |
| passe unique | une vague de revue, puis une de corrections | pas de boucle de polissage sans fin, les restes sont listés |
| change de méthode | deux échecs du même geste | pas de troisième essai aveugle : autre angle, cause racine, dépôt de référence |
| pas d'attente passive | agir au lieu de surveiller | faire tout de suite, ou avancer autre chose pendant qu'une tâche tourne |
| délègue / parallélise | découper le travail isolable | sous-agents en parallèle, modèle adapté à la tâche, retours vérifiés par moi |
| contexte frais | un relecteur qui n'a pas suivi | il ne voit que le résultat, pas mon raisonnement |
| critique d'abord | un verdict avant toute correction | défauts classés par gravité, je ne corrige qu'après accord |
| provenance (su / hérité) | observé à l'instant ou repris d'un document | relire un doc n'est pas vérifier : je dis lequel des deux |
| passation (handoff) | de quoi reprendre sans moi | état, décisions, restes, prochaine commande, dans un fichier daté |

## Méthode (mots qui changent ma façon de raisonner)

| Mot | Sens | Ce que je fais |
|---|---|---|
| cause racine | la cause, pas le symptôme | remonter jusqu'à ce qui explique tous les symptômes, corriger là une fois |
| repro minimal | le plus petit cas qui montre le bug | réduire l'entrée jusqu'au cas qui casse encore, avant toute correction |
| bisect | couper l'historique en deux | `git bisect` ou moitié des entrées, jusqu'au commit ou à la ligne fautive |
| hypothèse falsifiable | une explication qu'une mesure peut démentir | écrire la mesure qui la tuerait, la lancer avant d'y croire |
| pré-mortem | « ça a cassé dans un mois : pourquoi ? » | lister les pannes probables avant de livrer, parer les 3 premières |
| adversarial / red team | chercher à casser son propre travail | attaquer mes hypothèses, entrées hostiles, ordre inattendu |
| steelman | la meilleure version de l'option rejetée | l'énoncer honnêtement avant de trancher |
| exhaustif / contractuel | tout, compté | compte exact, chaque item traité ou nommé avec la raison |
| cas limites | vide, un, beaucoup, énorme, négatif, unicode, absent | les énumérer et les tester un par un |
| matrice de cas | toutes les combinaisons d'entrées | tableau entrée x état, une ligne de test par case |
| critères d'acceptation | ce qui prouve que c'est fini | les écrire avant de coder, vérifier chacun à la fin |
| chirurgical / diff minimal | toucher le moins possible | pas de reformatage ni de renommage hors sujet |
| spike / jetable | prototype pour apprendre, pas pour garder | rapide, isolé, jeté ensuite, la vraie version réécrite |
| lecture seule | observer sans modifier | aucune écriture, aucun redémarrage, rapport seulement |
| porte à sens unique / double sens | irréversible / réversible | réversible : j'avance ; irréversible : je confirme d'abord |
| trade-off explicite | ce qu'on gagne et ce qu'on paie | nommer le coût de l'option choisie |
| premiers principes | repartir des contraintes réelles | ignorer l'habitude, recalculer depuis les chiffres |
| montre la preuve | rien sans observation | commande, sortie, et ce qu'elle prouve |
| timebox | un temps maximum pour chercher | m'arrêter à l'échéance, rendre ce que j'ai trouvé et ce qui reste ouvert |
| tracer bullet / squelette ambulant | un bout en bout mince avant d'épaissir | faire passer un cas réel dans toute la chaîne, puis étoffer chaque étape |
| tranche verticale | une fonctionnalité complète et étroite | de l'entrée à l'effet pour un seul cas, pas une couche entière sans usage |
| non-objectifs | ce qu'on ne fait pas, écrit | les lister avant de coder, refuser ce qui en déborde |
| inversion | « comment être sûr d'échouer ? » | lister ce qui garantirait l'échec, vérifier que je n'en fais aucun |
| cinq pourquoi | demander pourquoi jusqu'à la cause | chaque réponse appuyée par une preuve, pas par une supposition |
| diagnostic différentiel | ça marche ici, pas là : qu'est-ce qui diffère ? | comparer le cas sain et le cas cassé (version, config, entrée), réduire l'écart |
| rasoir d'Occam | l'explication la plus simple d'abord | tester la cause banale (config, chemin, droits) avant la cause exotique |
| effets de second ordre | ce que la correction déclenche ensuite | suivre la conséquence un cran plus loin (charge déplacée, file qui gonfle) |
| loi de Goodhart | une mesure devenue cible ne mesure plus | vérifier l'effet réel, pas seulement le compteur que j'ai fait monter |
| ordre de grandeur (Fermi) | estimer avant de mesurer | calcul à la louche (octets, secondes, coût) pour repérer un résultat absurde |
| ADR / décision consignée | la décision et sa raison, écrites | contexte, choix, options écartées, en 5 lignes datées |
| contre-exemple | un seul cas suffit à réfuter une règle | chercher le cas qui la casse avant de l'énoncer |
| dépôt de référence | quelqu'un l'a déjà résolu | lire une implémentation qui marche avant d'inventer |
| décomposer | un gros problème en petits, vérifiables | sous-problèmes indépendants, chacun avec son contrôle |
| travailler à rebours | partir du résultat voulu | écrire la sortie attendue, remonter jusqu'aux étapes |
| checklist | les étapes qu'on oublie sous pression | liste écrite, cochée une à une, pour tout geste répété et risqué |
| question ouverte | ce qu'on ne sait pas encore | la lister à part, ne pas la combler par une supposition |

## Décision et priorité

| Mot | Sens | Ce que je fais |
|---|---|---|
| Pareto (80/20) | peu de causes font l'essentiel de l'effet | trier par impact, traiter la tête, dire ce que je laisse |
| risque d'abord | commencer par le plus incertain | lever l'inconnue qui peut tout invalider avant de construire le reste |
| chemin critique | la suite d'étapes qui fixe le délai | paralléliser ce qui n'en fait pas partie, ne jamais la laisser attendre |
| coût irrécupérable | ce qui est déjà dépensé ne justifie pas de continuer | juger sur ce qui reste à faire, abandonner si une autre voie est plus courte |
| coût d'opportunité | choisir A, c'est renoncer à B | nommer ce qui ne sera pas fait |
| réutiliser avant d'écrire | l'existant d'abord | chercher dans le dépôt, puis la bibliothèque standard, puis les dépendances installées, avant tout code neuf |
| MVP | la plus petite version utile | le cœur seulement, le reste listé et non fait |
| dérive du périmètre | le travail grossit en route | signaler l'ajout, le sortir ou le faire valider |
| impact x probabilité | classer les risques | traiter d'abord ce qui est grave et probable |
| loi de Hofstadter | ça prend toujours plus longtemps que prévu | estimer par étapes, donner une fourchette et pas un chiffre |
| bon, vite, pas cher | on n'en a que deux sur trois | dire lequel on sacrifie |
| assez bon | la perfection a un coût | m'arrêter aux critères d'acceptation |

## Débogage

| Mot | Sens | Ce que je fais |
|---|---|---|
| lire l'erreur en entier | le message dit souvent la cause | type, message, fichier et ligne lus avant toute hypothèse |
| caractériser avant d'expliquer | décrire le symptôme avant de chercher sa cause | quand, où, combien, depuis quand, toujours ou parfois ; l'explication vient après |
| instrumenter | mesurer au lieu de deviner | un log ou un compteur au point douteux, relancer, lire |
| une variable à la fois | un seul changement entre deux essais | sinon impossible de savoir ce qui a réparé ou cassé |
| dernier état sain | la dernière fois où ça marchait | commit, config ou version connus bons, comparés à l'actuel |
| isoler | retirer tout ce qui n'est pas nécessaire au bug | désactiver par moitiés jusqu'au composant fautif |
| attribution (corrélation / causalité) | arrivé en même temps ne veut pas dire causé par | chercher le mécanisme, comparer à un témoin avant de m'attribuer un effet |
| pile d'appels | qui a appelé quoi | suivre la trace jusqu'à la première ligne de notre code |
| strace / trace réseau | voir ce que le programme fait vraiment | appels système ou paquets, quand les logs ne disent rien |
| heisenbug | le bug disparaît quand on l'observe | suspecter le temps et la concurrence, journaliser sans ralentir |
| bug latent | présent depuis longtemps, révélé par autre chose | chercher ce qui a changé autour, pas seulement la ligne fautive |
| masquer le symptôme | faire taire n'est pas corriger | pas de `try/except` ni de `sleep` posés pour cacher une panne |

## Rendu et communication

| Mot | Sens | Ce que je fais |
|---|---|---|
| conclusion d'abord (BLUF) | la réponse en première ligne | verdict, puis preuve, puis détail seulement s'il sert |
| faits / hypothèses / jugements | ne pas mélanger ce qui est su et ce qui est cru | trois étiquettes séparées dans le rapport |
| niveau de confiance | à quel point j'en suis sûr | sûr, probable ou incertain, avec ce qui lèverait le doute |
| chiffres dérivés | un compte sort d'une commande, pas de ma tête | compter par script, citer la commande |
| ratio traités / total | le compte de ce qui est fait | `12/15`, et les 3 restants nommés avec la raison |
| écarts | ce qui n'a pas été fait ou pas vérifié | liste explicite, jamais passée sous silence |
| livrable localisable | un chemin, pas « c'est fait » | chemin absolu de chaque artefact produit |
| check en un clic | comment vérifier soi-même | la commande ou l'URL exacte à lancer |
| prochain geste | une seule action attendue de kil | nommée, en dernière ligne |
| une page / carte | tout tient sur un écran | langage simple, un seul geste demandé, le tri reste à ma charge |
| langage simple | sans jargon ni sigle | mots courants, tout terme technique défini une fois |
| avant / après | montrer le changement | deux colonnes ou un diff, pas une description |
| exemple concret | un cas réel plutôt qu'une généralité | une entrée et sa sortie |
| diff seulement | juste ce qui change | pas de fichier entier recopié |
| tableau | comparer sur des critères | une ligne par option, une colonne par critère, pas de prose |

## Robustesse

| Mot | Sens | Ce que je fais |
|---|---|---|
| idempotent | relancer donne le même état | vérifier avant d'agir, `mkdir -p`, bloc délimité remplacé et jamais ajouté deux fois |
| atomique | tout ou rien, jamais à moitié | écrire `x.tmp` puis `rename`, une transaction, pas d'état intermédiaire visible |
| réentrant | supporte deux exécutions en même temps | verrou (`flock -n`), fichiers temporaires uniques par PID |
| déterministe | mêmes entrées, même sortie | pas d'heure ni d'aléa cachés, tri explicite, graine fixée |
| convergent / déclaratif | on décrit l'état voulu, l'outil y ramène | comparer voulu et réel, n'appliquer que la différence |
| fail-fast | échouer tôt et fort | `set -euo pipefail`, valider à l'entrée, code de sortie non nul |
| fail-closed / fail-open | en cas de doute : refuser / laisser passer | sécurité = fermé ; diffusion en direct = ouvert, et le dire |
| dégradation gracieuse | une panne partielle ne casse pas le tout | repli explicite (clip d'attente, dernière valeur connue), alerte |
| backoff + jitter | réessayer de plus en plus lentement, décalé | délai plafonné, nombre d'essais borné, jamais de boucle serrée |
| timeout | toute attente a une fin | délai sur chaque appel réseau et sous-processus |
| borné | tout a une limite | taille de file, essais, mémoire, logs (rotation), durée |
| reprenable / checkpoint | reprend où il s'est arrêté | progression écrite après chaque étape, reprise à l'offset |
| crash-only | un `kill -9` ne casse rien | état toujours cohérent sur disque, réparation au démarrage |
| arrêt propre | SIGTERM respecté | finir l'item en cours, `trap` de nettoyage, pas de fichier à moitié |
| quarantaine | écarter sans détruire | déplacer vers un dossier à part, jamais supprimer |
| message poison | une entrée qui échoue toujours | après N échecs, quarantaine (dead letter) au lieu de boucler |
| append-only | on ajoute, on ne réécrit pas | journal ligne par ligne, l'historique reste lisible |
| tombstone / soft delete | marquer supprimé plutôt qu'effacer | un champ ou un fichier marqueur, restauration possible |
| écrivain unique | un seul processus écrit un état donné | les autres lisent ou passent par l'outil prévu |
| clé d'idempotence | un identifiant rend un envoi rejouable sans doublon | dédoublonner par id (message, job, fichier) |
| at-least-once / exactly-once | livré au moins une fois / exactement une fois | at-least-once + dédoublonnage, le seul exactly-once réaliste |
| transitoire / permanent | une erreur qui passera / qui ne passera pas | réessayer la première (timeout, 503), abandonner tout de suite la seconde (404, 401) |
| watchdog | relancer ce qui est figé, pas seulement mort | `Restart=on-failure`, `WatchdogSec`, test de progression et pas de présence |
| let it crash / supervision | mourir net plutôt que survivre incohérent | sortir en erreur, laisser le superviseur relancer sur un état propre |
| durable / fsync | écrit pour de bon, pas dans un cache | `flush` + `fsync` avant le `rename` pour un état qui doit survivre à une coupure |
| journal d'intention (WAL) | noter ce qu'on va faire avant de le faire | au redémarrage, finir ou annuler l'opération notée |
| compensation / saga | chaque étape a son action inverse | en cas d'échec au milieu, défaire dans l'ordre inverse ce qui est fait |
| outbox | l'état et le message à envoyer écrits ensemble | l'envoi part d'une file locale, rejoué jusqu'à l'accusé |
| bail (lease) | un verrou qui expire seul | verrou daté avec durée, un détenteur mort ne bloque pas pour toujours |
| SPOF | le maillon dont la panne arrête tout | le nommer, lui donner un second chemin ou une alerte |
| défaut sûr | sans réglage, le comportement le moins dangereux | l'action destructive demande un drapeau explicite |
| orphelin / zombie | ce qu'un crash laisse derrière | au démarrage, ramasser `.tmp`, verrous périmés, processus sans parent |
| rétention | combien on garde, et jusqu'à quand | règle écrite (N derniers, N jours), appliquée par le code |
| validation en sortie | ne pas émettre ce qu'on refuserait de recevoir | contrôler le fichier produit (taille, format, durée) avant de le publier |
| garde de cohérence (sanity check) | un résultat absurde s'arrête là | bornes plausibles vérifiées, refus plutôt que propagation |
| amorçage à vide | repartir sans état ni cache doit marcher | tester le premier démarrage, pas seulement la reprise |
| relance bornée | un superviseur ne relance pas à l'infini | `StartLimitBurst`, alerte quand le plafond est atteint |
| rejouable (replay) | les entrées brutes sont gardées | reconstruire l'état en les rejouant après un bug |

## Concurrence et temps

| Mot | Sens | Ce que je fais |
|---|---|---|
| race condition | le résultat dépend de l'ordre d'arrivée | identifier l'état partagé, le protéger ou le supprimer |
| TOCTOU | vérifié puis utilisé, mais ça a changé entre-temps | agir et vérifier en une opération (`O_EXCL`, `rename`, `mkdir` comme verrou) |
| compare-and-swap / optimiste | écrire seulement si rien n'a changé | numéro de version ou ETag vérifié à l'écriture, sinon relire |
| deadlock | deux verrous qui s'attendent | ordre de prise fixe, timeout sur le verrou |
| backpressure | le consommateur freine le producteur | file bornée, le producteur attend ou refuse |
| load shedding | refuser du travail pour survivre | rejeter le moins important quand la charge dépasse le seuil |
| bulkhead | cloisonner les ressources | quota CPU/mémoire par service (`CPUQuota`, `Nice`) |
| circuit breaker | couper un appel qui échoue en boucle | après N échecs, pause, puis un seul essai test |
| rate limit | débit plafonné | seau à jetons, respect des `Retry-After` |
| debounce / throttle | regrouper / espacer les déclenchements | un seul traitement par rafale / au plus un par intervalle |
| hystérésis | deux seuils, montée et descente | alerte à 2 h, levée à 3 h : pas de clignotement |
| flapping | un état qui oscille sans arrêt | hystérésis, délai de confirmation, compteur |
| horloge monotone | mesurer une durée sans sauts | `time.monotonic()`, jamais l'heure murale pour un délai |
| UTC / ISO 8601 | stocker en UTC, format standard | `2026-11-16T22:30:00Z` en base et logs, heure locale à l'affichage |
| cohérence éventuelle | les copies finissent par converger | lecteurs tolérants au retard, pas de lecture juste après écriture |
| thundering herd | tout le monde se réveille en même temps | décaler (jitter), un seul recalcul pour tous |
| single-flight | une exécution pour N demandes identiques | les suivantes attendent le résultat de la première |
| concurrence bornée | N tâches à la fois, pas plus | sémaphore ou pool de taille fixe, jamais un lancement par item |
| fan-out / fan-in | éclater puis rassembler | lots indépendants en parallèle, résultats réunis et comptés |
| famine (starvation) | une tâche jamais servie | file équitable, priorité qui vieillit |
| livelock | tout bouge, rien n'avance | mesurer la progression, pas l'activité |
| jeton de clôture (fencing) | un ancien détenteur du verrou écrit encore | numéro croissant joint à chaque écriture, l'ancien est refusé |
| dérive d'horloge (skew) | deux machines n'ont pas la même heure | ne pas comparer leurs horodatages à la seconde, ordonner par numéro de séquence |
| durée / date civile | 24 h n'est pas « demain même heure » | durées en secondes, dates avec fuseau, tester le changement d'heure |
| instantané (snapshot) | lire un état figé cohérent | copier puis lire la copie, jamais un fichier en cours d'écriture |
| événement > polling | réagir plutôt qu'interroger | webhook, inotify, `wait` ; sinon polling borné à intervalle justifié |
| verrou consultatif | un verrou que seuls les coopérants respectent | tous les écrivains passent par le même verrou, sinon il ne protège rien |
| section critique courte | tenir le verrou le moins longtemps possible | préparer hors verrou, n'y faire que l'écriture |
| async sans blocage | un appel bloquant gèle toute la boucle d'événements | I/O asynchrone, calcul lourd dans un worker, l'interface ne gèle jamais |
| en série / en parallèle | un `await` après l'autre, ou ensemble | `gather` ou `Promise.all` quand les appels sont indépendants, avec plafond |
| annulation | arrêter proprement une tâche en cours | signal d'annulation propagé, ressources rendues |

## Données et formats

| Mot | Sens | Ce que je fais |
|---|---|---|
| parse, don't validate | convertir l'entrée en structure sûre une fois | parser à la frontière, le reste du code ne voit que du typé |
| états illégaux irreprésentables | le type empêche l'incohérence | enum plutôt que deux booléens contradictoires |
| fonction totale | tous les cas traités | `match` complet, le cas inconnu lève une erreur nommée |
| schéma / contrat | la forme attendue, écrite | schéma ou dataclass, champ `version` dans les fichiers |
| aller-retour (round-trip) | lire(écrire(x)) == x | test qui le vérifie |
| forme canonique | une seule écriture pour une même valeur | normaliser (NFC, casse, `/` final) avant de comparer |
| encodage explicite | jamais l'encodage par défaut | `encoding="utf-8"`, `newline="\n"`, pas de BOM |
| unités dans le nom | `timeout_s`, `size_mb` | jamais un nombre nu ambigu |
| nombres magiques | constantes nommées | `MAX_RETRIES = 3` plutôt que `3` perdu dans le code |
| entier pour l'argent | pas de float pour les montants | centimes en entier ou `Decimal` |
| off-by-one / intervalles semi-ouverts | erreur de borne | `[début, fin)`, tester 0, 1, n-1, n |
| adressé par contenu | nommé par son hash | dédoublonnage gratuit, intégrité vérifiable |
| nul / absent / vide | trois états différents | les distinguer dans le schéma, ne pas en replier deux en un |
| lecteur tolérant (loi de Postel) | strict à l'émission, tolérant à la réception | ignorer les champs inconnus, les garder intacts à la réécriture, émettre au format exact |
| somme de contrôle | prouver que les octets sont intacts | hash comparé après chaque transfert ou copie |
| pas de troncature silencieuse | couper sans le dire, c'est mentir | refuser ou signaler ce qui dépasse, avec le compte |
| vrai parseur | pas de regex sur HTML, JSON, CSV, shell | bibliothèque du format, regex réservée au texte plat |
| flottants | 0.1 + 0.2 ne vaut pas 0.3 | comparer avec tolérance (`math.isclose`), jamais `==` |
| tri stable / ordre total | un ordre qui ne dépend pas du hasard | clé de tri complète, départage explicite des égalités |
| pagination par curseur | reprendre après le dernier vu | curseur opaque plutôt qu'`offset`, qui saute ou double des lignes |
| JSON Lines | un objet par ligne | ajout simple, lecture en flux, une ligne abîmée ne perd pas le fichier |
| clé naturelle / technique | identifiant métier ou identifiant généré | id généré pour lier, clé métier en contrainte d'unicité |
| normalisé / dénormalisé | écrit une fois ou recopié pour lire vite | copie dérivée reconstruite depuis la source, jamais éditée à la main |
| identifiant opaque | un id ne porte pas de sens | ne pas le découper ni en déduire un ordre |
| UUID / ULID | identifiant unique sans coordinateur | ULID ou UUIDv7 quand on veut aussi l'ordre de création |
| valeur sentinelle | `-1` ou `""` pour dire « rien » | `None` ou un type dédié : la sentinelle finit par être une vraie valeur |
| limite de taille | tout champ a un maximum | longueur vérifiée à l'entrée, erreur claire au-delà |
| octets / caractères | un caractère n'est pas un octet | compter et couper en caractères, jamais au milieu d'une séquence UTF-8 |
| compatibilité de format | le fichier d'hier se relit aujourd'hui | migration à la lecture selon `version`, test avec un fichier ancien |

## Stockage et bases

| Mot | Sens | Ce que je fais |
|---|---|---|
| transaction | plusieurs écritures, un seul résultat | tout dans une transaction, annulation complète sur erreur |
| contrainte | la base garde l'invariant | unicité, clé étrangère, `NOT NULL`, plutôt qu'une vérification dans le code |
| upsert | insérer ou mettre à jour en un geste | `INSERT ... ON CONFLICT`, pas de lecture puis écriture |
| niveau d'isolation | ce qu'une transaction voit des autres | le connaître, verrouiller la ligne qu'on lit pour la modifier |
| plan de requête | comment la base s'y prend | `EXPLAIN` avant d'ajouter un index ou de réécrire |
| SQLite en WAL | lecteurs et écrivain ne se bloquent plus | `journal_mode=WAL`, `busy_timeout`, un seul écrivain |
| migration versionnée | le schéma évolue par scripts numérotés | chaque migration jouée une fois, dans l'ordre, notée en base |
| sauvegarde à chaud | copier une base qui tourne | l'outil de sauvegarde de la base, jamais un `cp` du fichier ouvert |

## Clarté

| Mot | Sens | Ce que je fais |
|---|---|---|
| sémantique | le nom dit ce que c'est | noms métier, codes de sortie et logs qui disent la cause, pas `data2` ni `ok` |
| explicite > implicite | rien de deviné | paramètres nommés, pas de valeur par défaut magique |
| moindre surprise | ça fait ce que le nom promet | pas d'effet caché dans une fonction qui « lit » |
| fonction pure / effet de bord | calcul sans toucher au monde / ce qui le touche | séparer le calcul (testable) des écritures, réseau, disque |
| noyau fonctionnel, coque impérative | logique pure au centre, I/O au bord | tester le noyau sans mock |
| immuable | on ne modifie pas, on recrée | copie plutôt que mutation d'un état partagé |
| source unique de vérité | une donnée vit à un seul endroit | lire ce fichier, jamais une copie recopiée à la main |
| cohésion / couplage | ensemble ce qui change ensemble / peu de liens | un module = une raison de changer |
| orthogonal | un réglage n'en affecte pas un autre | options indépendantes, pas d'effet croisé |
| composable | petites pièces qui s'emboîtent | style Unix : une entrée, une sortie, chaînable |
| early return | sortir tôt plutôt qu'imbriquer | gardes en tête de fonction, chemin heureux à plat |
| YAGNI | tu n'en auras pas besoin | pas d'option ni d'abstraction « pour plus tard » |
| règle de trois | factoriser à la 3e répétition | deux copies tolérées, la troisième devient une fonction |
| clôture de Chesterton | comprendre avant de retirer | chercher pourquoi la ligne existe (git blame) avant de l'enlever |
| commande / requête (CQS) | une fonction agit ou répond, pas les deux | `get_x` ne modifie rien, `set_x` ne renvoie pas de donnée |
| loi de Déméter | ne parler qu'à ses voisins directs | pas de `a.b.c.d`, demander à `a` ce dont j'ai besoin |
| inversion de dépendance | le cœur ne connaît pas le détail | passer la dépendance (horloge, réseau, disque) en paramètre |
| machine à états | états et transitions nommés | table des transitions permises, toute autre lève une erreur |
| table de décision | des données plutôt qu'une cascade de `if` | dictionnaire cas vers action, lisible et testable ligne par ligne |
| localité | comprendre sans changer de fichier | garder ensemble ce qui se lit ensemble, pas d'indirection pour le principe |
| commentaire = pourquoi | le code dit quoi, le commentaire dit pourquoi | une ligne sur la contrainte ou le piège, rien qui paraphrase |
| erreur actionnable | le message dit quoi, où, et quoi faire | valeur fautive, fichier ou clé, geste de correction |
| ne jamais avaler une erreur | un `except: pass` cache la panne | attraper le type précis, journaliser, relancer ou décider |
| booléen positif | `enabled`, pas `not_disabled` | pas de double négation, nom qui se lit dans un `if` |
| code mort | ce qui n'est plus appelé | le supprimer (git le garde), pas de bloc commenté |
| convention > configuration | le défaut sensé sans réglage | suivre la convention du dépôt, n'exposer une option que si elle sert |
| typage strict | l'outil attrape l'erreur avant l'exécution | mode strict, pas de `any` ni de `type: ignore` sans raison écrite |
| optionnel explicite | une valeur peut manquer, le type le dit | cas absent traité là où il apparaît, pas trois appels plus loin |
| libération garantie | la ressource est rendue quoi qu'il arrive | `with`, `finally` ou `defer` autour de tout fichier, verrou, connexion |
| assertion / validation | bug interne ou entrée fausse | `assert` pour l'impossible, erreur nommée pour l'entrée |
| lisible > malin | le code se lit plus souvent qu'il ne s'écrit | la version évidente, pas la ligne à déchiffrer |
| un niveau d'abstraction | une fonction ne mélange pas stratégie et détail | les étapes en haut, la mécanique dans des fonctions nommées |
| formateur automatique | le style ne se discute pas | `ruff format` ou `prettier`, appliqué par l'outil |
| défaut mutable | `def f(x=[])` partage la liste entre les appels | `None` par défaut, liste créée dans la fonction |
| cohérence locale | le nouveau code ressemble à l'ancien | mêmes noms, mêmes idiomes, même densité de commentaires que le fichier |

## Architecture

| Mot | Sens | Ce que je fais |
|---|---|---|
| séparation des préoccupations | chaque partie s'occupe d'une seule chose | entrées-sorties, règles métier et affichage dans des modules distincts |
| ports et adaptateurs (hexagonal) | le métier au centre, le monde autour | le cœur définit l'interface, un adaptateur par service externe |
| module profond | interface étroite, beaucoup de travail derrière | peu de fonctions publiques, la complexité cachée dedans |
| fuite d'abstraction | le détail caché remonte quand même | documenter la limite, ne pas empiler une couche de plus |
| composition > héritage | assembler plutôt que dériver | petites pièces passées en paramètre, pas de hiérarchie profonde |
| couche anticorruption | traduire le modèle d'un service externe à la frontière | un seul module connaît leur format, le reste voit le nôtre |
| langage ubiquitaire | les mots du métier dans le code | mêmes noms dans le prompt, le code, les logs et l'interface |
| contexte borné | un mot n'a qu'un sens dans un périmètre donné | un modèle par domaine, traduction explicite entre deux |
| monolithe d'abord | un seul programme tant que ça tient | découper seulement sur un besoin mesuré |
| pipeline à étapes | chaque étape lit un artefact et en écrit un | étapes rejouables seules, artefacts intermédiaires gardés |
| pub / sub | l'émetteur ne connaît pas ses abonnés | événements nommés, abonnés indépendants |
| event sourcing | l'état est la somme des événements | journal en ajout seul, état reconstruit en le rejouant |
| CQRS | un modèle pour écrire, un autre pour lire | vue de lecture dérivée, reconstructible depuis les écritures |
| point d'extension | l'endroit prévu pour ajouter un cas | table d'enregistrement ou hook, seulement quand deux cas réels existent |
| état global | une variable que tout le monde peut changer | la passer en paramètre, ou lui donner un seul propriétaire |
| couplage temporel | A doit passer avant B sans que rien le dise | rendre le mauvais ordre impossible (constructeur, type, fonction unique) |
| local d'abord | marche sans réseau | l'état local fait foi, synchronisation en fond |
| 12 facteurs | config par l'environnement, logs sur stdout, processus sans état | appliquer ces règles à tout service déployé |

## Vérification

| Mot | Sens | Ce que je fais |
|---|---|---|
| invariant | vrai avant, pendant et après | l'écrire en `assert` ou en contrôle |
| pré / postcondition | ce qui doit être vrai avant / après | vérifier l'entrée, prouver la sortie |
| dry-run | montrer sans faire | mode par défaut qui affiche le plan, `--apply` pour agir |
| test témoin | un contrôle qu'on a vu rougir | lancer le cas négatif d'abord, sinon le test ne prouve rien |
| test de mutation | casser le code exprès | si aucun test ne rougit, le test ne couvre rien |
| test de non-régression | le bug corrigé ne revient pas | un test qui rejoue le bug exact |
| test de caractérisation | figer l'existant avant de le changer | capturer la sortie actuelle, refactorer, comparer |
| property-based | une propriété vraie pour toute entrée | générer des centaines d'entrées (Hypothesis), pas trois exemples |
| fuzzing | entrées aléatoires ou hostiles en masse | sur tout parseur exposé |
| oracle de test | une autre façon de calculer l'attendu | ne pas recopier le code dans le test |
| hermétique | le test ne dépend de rien d'extérieur | pas de réseau, horloge et aléa injectés |
| flaky | test qui passe ou casse au hasard | trouver la cause (ordre, temps, réseau), jamais « relancer » |
| fake > mock | une vraie implémentation simplifiée | fake en mémoire plutôt que mock qui récite le code |
| smoke test | le minimum qui prouve que ça démarre | lancer, une requête, code 0 |
| bout en bout | toute la chaîne réelle | de l'entrée de l'utilisateur à l'effet observé |
| golden file | sortie de référence figée | comparer à un fichier validé une fois |
| observabilité | savoir de dehors ce qui se passe | logs datés avec cause, compteurs, battement de cœur |
| logs structurés / id de corrélation | une ligne = des champs ; un id suit la requête | JSON ou `clé=valeur`, le même id du début à la fin |
| mesurer avant d'affirmer | un chiffre, pas une impression | commande et résultat avant tout « c'est réglé » |
| test de contrat | les deux côtés d'une interface s'accordent | même exemple vérifié chez l'appelant et chez l'appelé |
| chemin d'erreur | l'échec aussi se teste | un test par erreur prévue : entrée fausse, réseau coupé, disque plein |
| injection de panne (chaos) | provoquer la panne exprès | `kill -9` au milieu, réseau coupé, puis vérifier l'état |
| test d'endurance (soak) | tenir dans la durée | des heures de marche, surveiller mémoire, descripteurs, disque |
| test de charge | tenir le volume | monter jusqu'à la rupture, noter le seuil |
| couverture != preuve | une ligne exécutée n'est pas une ligne vérifiée | regarder les assertions et les branches, pas le pourcentage |
| arrange / act / assert | préparer, agir, vérifier | trois blocs par test, une seule raison d'échouer |
| analyse statique | attraper sans exécuter | lint et types (`ruff`, `mypy`, `tsc`) avant les tests |
| vérificateur indépendant | mon test ne vérifie que mon modèle | contrôle par un autre chemin : autre outil, vraie cible, œil de kil |
| sonde muette | pas de résultat ne veut pas dire rien | prouver que la sonde détecte un cas connu avant de conclure à l'absence |
| quatre signaux d'or | latence, trafic, erreurs, saturation | les quatre compteurs sur tout service qui sert |
| alerte actionnable | une alerte = un geste à faire | alerter sur le symptôme vu par l'utilisateur, avec la commande à lancer |
| rouge, vert, refactor | le test avant le code | test qui échoue, code minimal qui passe, puis nettoyage |
| test paramétré | une table de cas, un seul test | ajouter un cas, c'est ajouter une ligne |
| unitaire / intégration | une pièce seule / les pièces ensemble | beaucoup d'unitaires rapides, quelques intégrations sur les jointures |
| tester le comportement | ce que ça fait, pas comment c'est fait | un test qui survit à un refactor interne |
| boucle de retour courte | savoir vite si c'est cassé | le contrôle le plus rapide d'abord, la suite lente à la fin |
| échec lisible | le test rouge dit ce qui ne va pas | attendu, obtenu et entrée dans le message |
| tests indépendants | aucun ne dépend de l'ordre | chaque test crée et nettoie son propre état |
| données réalistes | le vrai monde est sale | échantillon réel anonymisé, pas trois valeurs propres |
| régression visuelle | l'écran n'a pas changé sans qu'on le veuille | capture comparée à une référence, par état et par thème |
| vérifier en vrai | une CI verte ne prouve pas l'exécution | lancer dans la vraie cible (navigateur, machine, compte) avant de pousser |
| statut à part | un contrôle passé dans un pipe perd son code de sortie | le lancer seul, lire son code, filtrer la sortie ensuite |

## Performance

| Mot | Sens | Ce que je fais |
|---|---|---|
| profiler avant d'optimiser | mesurer où part le temps | profil ou chrono par étape, optimiser seulement le plus gros |
| chemin chaud | le code exécuté le plus souvent | y concentrer l'effort, laisser le reste lisible |
| complexité (O(n)) | comment le coût grandit | éviter le quadratique caché (boucle dans une boucle, `in` sur liste) |
| N+1 | une requête par élément | regrouper en une requête ou un lot |
| batch | traiter par paquets | moins d'allers-retours, taille de lot bornée |
| streaming | traiter au fil de l'eau | lire ligne par ligne, jamais tout le fichier en mémoire |
| zero-copy | ne pas recopier les octets | lien dur, `-c copy`, `rename` plutôt que copie |
| mémoïsation / cache | ne pas recalculer | clé de cache explicite, TTL, règle d'invalidation écrite |
| lazy | calculer seulement si demandé | générateurs, chargement à la demande |
| benchmark honnête | mesure répétable | échauffement, plusieurs passes, médiane, même machine |
| centiles (p50 / p99) | la moyenne cache les pires cas | mesurer médiane et queue, traiter la queue si elle se voit |
| goulot | l'étape la plus lente fixe le débit | la trouver, n'optimiser qu'elle, remesurer car il se déplace |
| loi d'Amdahl | le gain est plafonné par la part non accélérée | calculer le gain maximal avant de paralléliser |
| I/O-bound / CPU-bound | on attend ou on calcule | attente : threads ou async ; calcul : processus ou machine plus forte |
| pool / keep-alive | réutiliser plutôt que rouvrir | une session HTTP, un pool de connexions, pas une ouverture par appel |
| index | retrouver sans tout parcourir | dictionnaire ou index sur la clé cherchée, pas de balayage répété |
| delta | n'envoyer que ce qui a changé | `rsync`, reprise par plage d'octets, comparaison par hash |
| stale-while-revalidate | servir l'ancien pendant qu'on rafraîchit | réponse immédiate depuis le cache, mise à jour en fond |
| démarrage à froid | le premier appel paie tout | préchauffer ou mesurer à part, ne pas le mélanger au régime établi |
| budget de performance | un plafond chiffré par étape | fixer le seuil (ms, Mo), échouer le contrôle s'il est dépassé |
| ne pas le faire | le travail le plus rapide est celui qu'on évite | supprimer l'étape inutile avant de l'accélérer |
| fuite mémoire | la mémoire monte sans redescendre | mesurer le RSS dans la durée, trouver la collection qui grossit |
| flamegraph | où part le temps, en image | profil échantillonné, lire les plateaux larges |
| latence perçue | ce que l'utilisateur ressent | afficher tôt, charger le reste après |
| coût par appel | une API facturée ou plafonnée | compter les appels, mettre en cache, respecter le quota |

## Sécurité

| Mot | Sens | Ce que je fais |
|---|---|---|
| frontière de confiance | là où entre une donnée externe | valider et borner tout ce qui vient du réseau, d'un fichier, d'un humain |
| allowlist > denylist | autoriser le connu plutôt qu'interdire le mauvais | liste fermée de valeurs acceptées |
| injection | une donnée exécutée comme du code | arguments en liste (`shell=False`), SQL paramétré, jamais de concaténation |
| path traversal | `../` qui sort du dossier | résoudre le chemin, vérifier qu'il reste sous la racine |
| SSRF | le serveur appelle une URL fournie | hôtes autorisés seulement, pas d'IP interne |
| désérialisation sûre | lire sans exécuter | `yaml.safe_load`, `json`, jamais `pickle` d'une source externe |
| secret hors argv et logs | `ps` et les logs voient tout | secret par stdin, fichier `600` ou env, masqué dans les logs |
| comparaison en temps constant | ne pas fuiter par la durée | `hmac.compare_digest` pour signatures et jetons |
| défense en profondeur | plusieurs couches indépendantes | validation + droits minimaux + pare-feu |
| moindre privilège | juste les droits nécessaires | clé limitée, pas de root ni de `NOPASSWD` par confort |
| assainir / échapper | nettoyer l'entrée / encoder la sortie | échapper au moment d'afficher (HTML, shell, SQL) |
| piste d'audit | qui a fait quoi, quand | journal en ajout seul des actions sensibles |
| rotation | un secret a une durée de vie | prévoir le remplacement sans coupure |
| modèle de menace | qui attaque, quoi, par où | l'écrire en 3 lignes avant de choisir les protections |
| surface d'attaque | tout ce qui est exposé | fermer ce qui ne sert pas : port, route, option, dépendance |
| authn / authz | qui es-tu / as-tu le droit | vérifier le droit sur chaque objet demandé, pas seulement la connexion |
| IDOR | changer l'id dans l'URL donne l'objet d'un autre | contrôle d'appartenance côté serveur à chaque accès |
| XSS / CSRF | script injecté dans la page / requête forgée depuis un autre site | échappement à l'affichage et CSP ; jeton anti-CSRF et cookies `SameSite` |
| aléa cryptographique | `random` se devine | `secrets` ou `os.urandom` pour jetons et identifiants |
| hachage de mot de passe | jamais en clair, jamais en SHA nu | `argon2` ou `bcrypt`, avec sel |
| TLS vérifié | un certificat non vérifié ne protège rien | jamais `verify=False` ni `-k`, corriger le magasin de certificats |
| chaîne d'approvisionnement | une dépendance est du code étranger | versions épinglées par hash, peu de dépendances, lire avant d'installer |
| portée et durée du jeton | un jeton volé vaut ce qu'il permet | portée minimale, expiration courte |
| minimisation | ne pas collecter ce qui ne sert pas | pas de donnée personnelle en log, champs masqués |
| bombe d'entrée (zip, ReDoS) | une petite entrée qui coûte énormément | plafonner taille, profondeur et temps avant de traiter |
| bac à sable | exécuter l'inconnu à part | utilisateur dédié, conteneur ou VM, sans réseau ni secrets |
| permissions de fichier | lisible par qui ? | `umask 077`, `chmod 600` sur clés et états sensibles |
| CORS | quel site peut appeler l'API depuis un navigateur | origines nommées, jamais `*` avec des cookies |
| cookie de session | `HttpOnly`, `Secure`, `SameSite` | les trois, durée limitée, identifiant renouvelé à la connexion |
| pas de crypto maison | l'éprouvé plutôt que l'inventé | bibliothèque reconnue, primitives de haut niveau |
| correctifs (CVE) | une dépendance vulnérable est une porte ouverte | audit des dépendances, mise à jour ciblée |
| erreur uniforme | ne pas révéler si le compte existe | même message et même durée pour « inconnu » et « mauvais mot de passe » |
| adjoint confus | mon outil agit avec mes droits pour le compte d'un autre | vérifier le droit du demandeur, pas le mien |
| JWT | un jeton signé se vérifie entièrement | signature, algorithme imposé, expiration, audience |
| exposition mesurée | protéger selon ce qui est vraiment joignable | vérifier ports et accès réels avant de durcir ou d'alerter |
| lecture ciblée d'un secret | ne jamais afficher le fichier entier | lire la seule clé voulue, ne pas la recopier en sortie |

## Shell et scripts

| Mot | Sens | Ce que je fais |
|---|---|---|
| mode strict | `set -euo pipefail` | tout échec arrête le script |
| tout citer | `"$var"` partout | aucun mot coupé par un espace |
| `--` | fin des options | `rm -- "$f"` : un nom qui commence par `-` reste un nom |
| mktemp + trap | temporaire unique, nettoyé à la sortie | `trap 'rm -rf "$t"' EXIT` |
| stdout données / stderr diagnostic | séparer le résultat des messages | un script reste chaînable dans un pipe |
| codes de sortie | 0 ok, 1 erreur, 2 usage, autres documentés | jamais un échec qui sort en 0 |
| chemins absolus | cron et systemd n'ont pas ton `PWD` ni ton `PATH` | `/usr/bin/python3`, chemins complets |
| exec | le processus remplace le shell | les signaux arrivent au vrai programme |
| shellcheck | lint du shell | le passer avant de livrer un script |
| POSIX sh vs bash | ce que la cible a vraiment | busybox = `sh`, pas de `[[ ]]` ni de tableaux |
| `while IFS= read -r` | lire ligne par ligne sans rien abîmer | espaces et antislashs gardés tels quels |
| `-print0` / `-0` | noms de fichiers séparés par un octet nul | `find -print0` avec `xargs -0`, un nom avec espace ou retour ligne passe |
| heredoc cité | `<<'EOF'` n'interprète rien | guillemets sur le délimiteur dès que le texte contient `$` ou des antislashs |
| `command -v` | tester qu'un outil existe | vérifier les dépendances en tête, message qui nomme l'absent |
| `printf` > `echo` | `echo` varie selon le shell | `printf '%s\n' "$x"` pour toute donnée |
| `$(...)` | substitution lisible et imbriquable | jamais de backticks |
| `local` | variable limitée à la fonction | pas d'état global qui fuit entre fonctions |
| pipe = sous-shell | une variable modifiée dans un `while` après un pipe est perdue | redirection `< fichier`, ou résultat rendu sur stdout |
| fins de ligne LF | un retour chariot casse un script | écrire en LF, vérifier avec `file` avant d'envoyer sur une machine Unix |
| `set -x` | tracer ce qui s'exécute | activé pour diagnostiquer, coupé autour des secrets |
| filtrer puis installer | un filtre raté installe du vide | écrire dans un fichier, vérifier qu'il n'est pas vide, installer ensuite |
| quoting à distance | une commande `ssh` est interprétée deux fois | script envoyé en fichier ou en base64, pas de guillemets imbriqués |
| argv en tableau | construire une commande sans coller des chaînes | `"$@"` ou tableau, jamais `eval` |
| `cd` vérifié | un `cd` raté exécute la suite au mauvais endroit | arrêt si le `cd` échoue, ou chemins absolus sans `cd` |
| vrai langage | passé 50 lignes, le shell devient fragile | Python dès qu'il y a des structures de données ou du parsing |
| `LC_ALL=C` | tri et motifs dépendent de la langue du système | le fixer pour un `sort` ou un `grep` stable |

## Système et processus

| Mot | Sens | Ce que je fais |
|---|---|---|
| signaux | TERM demande, KILL abat | TERM d'abord, attendre, KILL en dernier recours |
| kill par PID | viser un processus précis | PID lu puis vérifié, jamais un motif large |
| arbre de processus | les enfants survivent au parent | tuer le groupe entier, vérifier qu'il ne reste rien |
| port occupé | qui écoute dessus ? | `ss -ltnp` avant de lancer et après avoir arrêté |
| fuite de descripteurs | fichiers et sockets jamais refermés | fermeture garantie, compter `/proc/PID/fd` dans la durée |
| OOM | le noyau tue ce qui dépasse la mémoire | plafond par service, lire `dmesg` quand un processus disparaît sans log |
| disque plein | plus d'octets, ou plus d'inodes | `df -h` et `df -i`, alerte avant 100 % |
| même système de fichiers | `rename` n'est atomique que sans changer de volume | fichier temporaire créé dans le dossier de destination |
| lien dur / lien symbolique | deux noms pour un contenu / un pointeur vers un chemin | lien dur pour dupliquer sans copier, symbolique pour basculer de version |
| steal / iowait | CPU pris par l'hyperviseur / attente du disque | `vmstat` avant de conclure que le code est lent |
| charge (load average) | combien de tâches attendent | à comparer au nombre de cœurs, pas dans l'absolu |
| unité systemd | un service décrit et supervisé | `Restart=`, `After=`, limites, logs dans journald ; `start` et `restart` ne sont pas le même geste |
| timer / cron | deux façons de planifier | verrou contre le chevauchement, sortie journalisée, rattrapage décidé |
| `ulimit` | les plafonds du processus | les lire avant d'accuser le code (fichiers ouverts, pile) |
| nice / ionice | priorité CPU et disque | la tâche de fond passe après le service en direct |

## Réseau et systèmes répartis

| Mot | Sens | Ce que je fais |
|---|---|---|
| le réseau ment | perte, retard, doublon, désordre | tout appel peut échouer, arriver deux fois ou dans le désordre : le code le prévoit |
| latence / débit | durée d'un aller-retour / volume par seconde | savoir lequel des deux limite avant d'optimiser |
| reconnexion avec reprise | une connexion longue finit toujours par tomber | reconnexion automatique, reprise au dernier offset, backoff |
| connexion à moitié ouverte | un côté se croit encore connecté | ping applicatif avec délai, fermer et rouvrir sur silence |
| écoute locale / publique | `127.0.0.1` ou `0.0.0.0` | local par défaut, public seulement si voulu et protégé |
| DNS et TTL | un nom met du temps à changer | prévoir la propagation, pas d'IP en dur dans le code |
| IPv4 / IPv6 | deux chemins, deux comportements | tester les deux, forcer l'un quand l'autre est refusé |
| NAT / tunnel inverse | une machine derrière une box n'est pas joignable | c'est elle qui ouvre la connexion vers l'extérieur |
| proxy inverse | un point d'entrée devant les services | TLS, routage et limites réglés à un seul endroit |
| partition (CAP) | le réseau se coupe en deux | décider d'avance : refuser d'écrire, ou accepter de diverger |
| split-brain | deux nœuds se croient chacun le chef | arbitre externe ou quorum, jamais deux écrivains |
| ordre des messages | ils arrivent dans le désordre | numéro de séquence, ignorer ce qui est plus ancien que le dernier appliqué |
| échéance propagée (deadline) | chaque saut ajoute son attente | une échéance globale transmise, l'appelé n'attend pas plus que l'appelant |

## Interfaces (CLI et API)

| Mot | Sens | Ce que je fais |
|---|---|---|
| sortie machine | un format stable pour les programmes | `--json` à côté de la sortie lisible, champs jamais renommés |
| non interactif | utilisable sans humain | aucun prompt bloquant, `--yes` explicite, détection du TTY |
| API versionnée | l'ancien client continue de marcher | version dans l'URL ou l'en-tête, casse = nouvelle version |
| verbes HTTP | GET lit, PUT remplace, POST crée | GET sans effet, PUT et DELETE idempotents |
| codes d'état honnêtes | le code dit la vérité | jamais un 200 qui contient une erreur |
| webhook signé | prouver l'origine d'un appel entrant | signature HMAC vérifiée, horodatage borné, rejeu dédoublonné par id |
| push / pull | on m'envoie ou je vais chercher | pull quand la source est derrière un NAT ou peut tomber, push pour l'immédiat |
| sans état (stateless) | chaque appel porte ce qu'il faut | pas de mémoire entre deux requêtes, état dans un magasin nommé |
| aide intégrée | `--help` suffit pour s'en servir | usage, exemples, codes de sortie |
| limites annoncées | l'API dit ses plafonds | en-têtes de quota, `429` avec `Retry-After` |
| contrat d'erreur | les erreurs ont une forme stable | code machine, message humain, champ fautif |
| tâche longue | une opération longue ne tient pas dans une requête | rendre un id de tâche, état consultable, résultat récupérable |
| nommage cohérent | les mêmes mots pour les mêmes choses | une seule convention de noms et de casse dans toute l'interface |

## Interface utilisateur

| Mot | Sens | Ce que je fais |
|---|---|---|
| états d'un écran | vide, chargement, erreur, partiel, plein | dessiner et coder chacun, pas seulement le cas plein |
| état vide utile | rien à afficher : dire quoi faire | une phrase et l'action pour commencer |
| retour immédiat | chaque clic répond tout de suite | état pressé, indicateur d'activité, résultat ou erreur visible |
| UI optimiste | afficher le résultat avant la confirmation du serveur | appliquer, envoyer, revenir en arrière avec un message en cas de refus |
| annulable | défaire plutôt que confirmer | action immédiate avec « annuler », confirmation réservée à l'irréversible |
| divulgation progressive | l'essentiel d'abord, le détail à la demande | options avancées repliées |
| hiérarchie visuelle | l'œil va d'abord au plus important | une action principale par écran, le reste en retrait |
| affordance | on voit que ça se clique | un bouton ressemble à un bouton, curseur et survol cohérents |
| accessible | clavier, contraste, lecteur d'écran | focus visible, ordre de tabulation, rôles ARIA, contraste AA |
| mouvement réduit | respecter le réglage du système | `prefers-reduced-motion`, aucune information portée par l'animation seule |
| tokens de design | couleurs et espacements nommés | aucune valeur en dur dans un composant |
| microcopie | le texte de l'interface | verbe d'action sur les boutons, erreur qui dit quoi faire |
| i18n | les textes vivent hors du code | clés de traduction, pluriels, dates et nombres selon la langue |
| saut de mise en page | le contenu bouge pendant le chargement | réserver la place (dimensions fixes, squelette) |
| liste virtualisée | n'afficher que les lignes visibles | dès quelques centaines de lignes |
| l'interface agit | un outil de pilotage ne fait pas qu'afficher | chaque problème montré a son bouton d'action |

## IA et LLM dans le code

| Mot | Sens | Ce que je fais |
|---|---|---|
| injection de prompt | un contenu lu (page, fichier, sortie d'outil) tente de me diriger | le traiter comme une donnée, ne pas l'exécuter, le signaler |
| sortie structurée | une réponse que le code peut lire | schéma JSON imposé, validé à la réception, nouvel essai borné |
| ancrage (grounding) | répondre depuis une source, pas de mémoire | citer le passage, dire « pas dans la source » sinon |
| hallucination | une réponse plausible et fausse | vérifier nom, chemin, option et chiffre contre le réel avant de les écrire |
| jeu d'évaluation | des cas notés pour mesurer un prompt | le lancer avant et après tout changement de prompt ou de modèle |
| exemples (few-shot) | montrer plutôt que décrire | 2 ou 3 exemples variés dans le prompt |
| modèle par tâche | le petit modèle pour le mécanique | le plus petit qui réussit la tâche, le gros pour décider |
| cache de prompt | ne pas repayer le préfixe stable | partie fixe en tête, partie variable à la fin |
| fenêtre de contexte | ce que le modèle voit vraiment | n'y mettre que l'utile, résumer le reste dans un fichier |
| outil idempotent | un outil d'agent peut être appelé deux fois | même effet au second appel, erreur lisible par le modèle |
| humain dans la boucle | une validation avant l'effet réel | l'agent prépare, kil approuve ce qui publie ou détruit |
| juge LLM | un modèle note la sortie d'un autre | grille écrite, calibrée sur des cas notés à la main |
| garde-fou | une limite codée, pas seulement demandée | la règle critique dans un hook ou un script, le prompt ne suffit pas |

## Git

| Mot | Sens | Ce que je fais |
|---|---|---|
| relire son diff | le premier relecteur, c'est moi | `git diff` complet avant chaque commit |
| ajouter par nom | seulement les fichiers voulus | `git add fichier`, jamais `-A` ni `.` |
| scan de secrets | rien de sensible dans l'historique | chercher clés et jetons dans le diff avant de commiter |
| branche courte | fusionnée en heures ou en jours | petite, à jour avec main, supprimée après fusion |
| rebase / merge | réécrire l'historique ou le conserver | rebase en local seulement, jamais sur une branche déjà partagée |
| `--force-with-lease` | forcer sans écraser le travail d'un autre | jamais `--force` nu |
| reflog | le filet après une fausse manœuvre | un commit « perdu » s'y retrouve : regarder avant de refaire le travail |
| worktree | deux branches ouvertes côte à côte | un dossier par chantier, la prod reste intacte |
| pickaxe | depuis quand cette ligne existe ? | `git log -S texte`, puis lire le commit |
| tag de version | un nom fixe pour un état livré | tag annoté à chaque version, jamais déplacé |
| `git -C` | agir sur un dépôt sans s'y déplacer | chemin absolu, surtout en appels parallèles |
| hook de pre-commit | le contrôle avant l'enregistrement | lint et scan rapides, jamais sautés |

## Évolution du code

| Mot | Sens | Ce que je fais |
|---|---|---|
| commit atomique | un commit = un changement cohérent | qui compile et passe les tests seul |
| bisectable | chaque commit intermédiaire marche | pas de « fix du commit d'avant » cassé entre les deux |
| expand / contract | ajouter le nouveau, migrer, retirer l'ancien | jamais les trois dans le même déploiement |
| strangler fig | remplacer petit à petit | nouveau chemin à côté de l'ancien, bascule par morceaux |
| seam | point où on peut substituer | injecter la dépendance pour tester ou remplacer |
| déprécier avant de retirer | prévenir puis supprimer | avertissement d'abord, retrait plus tard |
| semver | MAJEUR.MINEUR.CORRECTIF | casse = majeur, ajout = mineur, correctif = patch |
| build reproductible | même source, même binaire | versions épinglées, lockfile, pas de `latest` |
| dérive | déployé différent du commité | comparer par hash avant de diagnostiquer |
| refactor séparé | changer la forme ou le comportement, pas les deux | deux commits : le refactor sans effet, puis le changement |
| petite PR | un diff qui se relit en une fois | découper par étape livrable, pas par fichier |
| message de commit = pourquoi | le diff dit déjà quoi | titre à l'impératif, corps sur la raison et le risque |
| revert d'abord | rétablir le service avant de comprendre | annuler le commit fautif, diagnostiquer ensuite à froid |
| dette nommée | un raccourci assumé et écrit | commentaire `shortcut:` avec la limite et le moment de le lever |
| surface publique minimale | ce qui est exposé devra être maintenu | n'exporter que le nécessaire, le reste privé |
| loi de Hyrum | tout comportement observable finit par servir à quelqu'un | chercher les appelants avant de changer un format, même non documenté |
| porte CI | rien de rouge ne passe | lint, tests et build bloquants, jamais contournés (`--no-verify`) |
| changelog | ce qui change pour l'utilisateur | une ligne par changement visible, à chaque version |
| vendoring | copier la dépendance dans le dépôt | quand la source peut disparaître ou doit être figée, version notée |
| revue de code | un second regard avant la fusion | chercher bugs, cas oubliés et simplifications, pas le style |
| suppression > ajout | le meilleur diff retire du code | chercher ce que le changement rend inutile |
| mise à jour isolée | une montée de version par commit | jamais mélangée à du code, testée en vrai |
| doc dans le même commit | le README dit encore la vérité | le mettre à jour avec le comportement qu'il décrit |
| migration testée sur copie | les données d'abord sur un clone | jouer la migration, comparer les comptes avant et après |

## Exploitation

| Mot | Sens | Ce que je fais |
|---|---|---|
| rétrocompatible | l'ancien appelant marche encore | ajouter sans retirer, valeur par défaut = ancien comportement |
| migration réversible | on peut revenir en arrière | copie `.avant-<date>` gardée, étape inverse écrite |
| rollback | le chemin de retour | écrit avant le déploiement, pas après |
| blast radius | ce qu'une erreur peut toucher | limiter : une chaîne, un service, un fichier à la fois |
| canary / déploiement progressif | d'abord une petite part | une instance, observer, puis le reste |
| kill switch | arrêt en un geste | fichier `STOP` lu à chaque tour |
| feature flag | activer sans redéployer | un fichier ou une variable, éteint par défaut |
| config en env | réglages hors du code | variable d'environnement ou `.env`, jamais en dur |
| config validée au démarrage | refuser de démarrer sur une config fausse | message qui nomme la clé manquante |
| liveness / readiness | vivant / prêt à servir | deux sondes distinctes, pas un simple « le process existe » |
| heartbeat / dead man's switch | signe de vie régulier ; alerte sur le silence | fichier daté, alerte si trop vieux |
| sonde synthétique | un faux utilisateur qui teste en vrai | requête réelle régulière, résultat comparé |
| SLO / budget d'erreur | objectif chiffré de fiabilité | décider sur le chiffre, pas sur l'impression |
| runbook | procédure écrite pour l'incident | symptôme, commande, lecture du résultat, action |
| postmortem sans blâme | ce qui a cassé et pourquoi | cause, preuve, correctif, contrôle qui le garde |
| toil | travail manuel répétitif | le transformer en moteur |
| moteur > tokens | un script plutôt qu'un geste répété | automatiser dès la 2e fois |
| blue-green | deux versions côte à côte, bascule d'un coup | la nouvelle démarre à côté, on bascule, l'ancienne reste prête au retour |
| shadow / dark launch | le nouveau code tourne sans servir | mêmes entrées, sorties comparées à l'ancien, rien de visible |
| drain | vider avant d'arrêter | ne plus accepter, finir l'en-cours, puis couper |
| sauvegarde testée | une sauvegarde jamais restaurée n'existe pas | restauration jouée pour de vrai, datée |
| 3-2-1 | 3 copies, 2 supports, 1 hors site | vérifier les trois avant de dire « sauvegardé » |
| RPO / RTO | combien on perd / combien de temps pour revenir | deux chiffres décidés avant l'incident |
| marge (headroom) | la réserve avant saturation | mesurer CPU, RAM, disque, débit avant d'ajouter une charge |
| sonde d'expiration | certificat, jeton, clé : tout expire | alerte N jours avant la date, pas après la panne |
| fatigue d'alerte | trop d'alertes = aucune alerte | supprimer ou regrouper celles qui n'appellent aucun geste |
| MTTR | temps pour rétablir | soigner le retour (détection, rollback) avant la prévention parfaite |
| gel (freeze) | pas de changement pendant une période sensible | reporter le déploiement non urgent, le dire |
| plan de contrôle / plan de données | ce qui décide / ce qui transporte | une panne de l'orchestrateur ne doit pas couper le flux en cours |
| game day | répéter la panne à blanc | jouer le runbook sur une vraie coupure provoquée |
| infrastructure en code | l'état des machines décrit dans un dépôt | toute modification passe par le fichier, pas par une commande à la main |
| serveur jetable | reconstruire plutôt que réparer | script d'installation complet, testé sur une machine vierge |
| un rôle par machine | les charges ne s'empiètent pas | mesurer la machine avant d'y ajouter une charge |
| vérification après déploiement | déployé ne veut pas dire en marche | sonde réelle juste après, comparée à l'avant |
| fenêtre de maintenance | intervenir quand ça gêne le moins | choisir l'heure, prévenir, borner la durée |
| inventaire | ce qui tourne, où, et pourquoi | liste à jour des services, ports, tâches planifiées et secrets par machine |
| déploiement en un geste | une commande, toujours la même | script de déploiement, pas une suite de gestes retenus de tête |

## Combinaisons

| Phrase dans le prompt | Ce que j'en fais |
|---|---|
| idempotent + atomique + dry-run | script de déploiement rejouable, qui montre son plan, sans état à moitié |
| reprenable + borné + quarantaine | traitement par lots qui survit au crash et ne boucle jamais sur un mauvais item |
| cause racine + repro minimal + non-régression | correction de bug qui ne revient pas |
| parse don't validate + frontière de confiance + fail-fast | entrée externe sûre, rejetée tôt avec un message clair |
| test témoin + mutation + hermétique | des tests qui prouvent vraiment quelque chose |
| blast radius + canary + kill switch + rollback | mise en prod d'un service qui tourne déjà |
| chirurgical + Chesterton + caractérisation | toucher du vieux code sans rien casser |
| exhaustif + matrice de cas + critères d'acceptation | livraison vérifiable case par case |
| transitoire / permanent + backoff + circuit breaker | appel réseau qui réessaie ce qui peut passer et lâche le reste |
| tracer bullet + tranche verticale + non-objectifs | nouveau projet qui marche de bout en bout dès le premier jour |
| diagnostic différentiel + bisect + rasoir d'Occam | panne « ça marchait hier » trouvée sans deviner |
| sauvegarde testée + 3-2-1 + RPO / RTO | des données qu'on peut vraiment récupérer |
| modèle de menace + surface d'attaque + moindre privilège | sécurité calibrée sur l'exposition réelle |
| bail + jeton de clôture + écrivain unique | verrou partagé qui ne laisse jamais deux écrivains |
| sonde muette + test témoin + vérificateur indépendant | un « rien trouvé » auquel on peut croire |
| drain + blue-green + revert d'abord | changer de version sans coupure, avec retour immédiat |
| atomique + schéma versionné + lecteur tolérant | fichier d'état JSON qui ne se corrompt pas et se relit après une mise à jour |
| lire l'erreur en entier + caractériser + une variable à la fois | diagnostic sans supposition ni patch aveugle |
| plan d'abord + périmètre + condition d'arrêt | tâche longue confiée en autonomie sans dérapage |
| conclusion d'abord + écarts + check en un clic | compte rendu que kil vérifie en dix secondes |
| états d'un écran + retour immédiat + annulable | écran qui ne laisse jamais l'utilisateur dans le doute |
| transaction + contrainte + upsert | écriture en base rejouable qui garde ses invariants |
| reconnexion avec reprise + backoff + clé d'idempotence | connexion longue qui survit aux coupures sans doublon |
| relire son diff + scan de secrets + ajouter par nom | commit propre, sans fichier ni secret en trop |
| sortie structurée + jeu d'évaluation + garde-fou | fonction à base de LLM qu'on peut mettre en prod |
| kill par PID + port occupé + vérification après déploiement | redémarrage de service sans victime collatérale |
| ultrathink + pré-mortem + steelman | décision difficile, pesée avant d'être tranchée |
