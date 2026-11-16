# Code lexicon

One word in the prompt = one behaviour in the code. Column 3: what I do when the word is there.
Useful combinations are at the end. English translation of `LEXIQUE.md`, row for row. How to use and add words: `SKILL.md`. Check: `python check.py`.

## Agent steering (words that set how I work)

| Word | Meaning | What I do |
|---|---|---|
| ultrathink | keyword: think hard on this turn | long reasoning before acting: options, risks, edge cases, then a firm decision |
| `/effort` | command that sets the session's effort level (low to max) | higher: I dig deeper and verify more; lower: short, direct answer |
| skim / quick | the essentials without digging | a few lines, no exploration beyond what is needed, limits stated |
| plan first | the plan before the first change | steps, files touched, risks; I wait for the go-ahead |
| propose only | ideas, no action | numbered proposals, I touch nothing |
| autonomous / don't ask | decide alone within the scope | I move on, note my choices, and stop only before something irreversible |
| scope / don't touch | what is inside, what is forbidden | written list, nothing outside it even "to help" |
| explicit assumptions | what I assume, written down | list them before acting, the user corrects in one line |
| restate | say the request back before acting | one sentence: what I understood, what I will deliver |
| blocking question | ask only what truly blocks | questions grouped in one go, each with my recommendation |
| take stock | look before acting | inventory of what exists (files, services, versions) before any change |
| step by step | one step, its check, the next | never several unverified changes stacked |
| stop condition | when I must stop | written criterion (N failures, budget reached, doubt about something irreversible), respected |
| budget | cap on tokens, time or calls | count it, stop at the cap and hand back the state reached |
| single pass | one wave of review, then one of fixes | no endless polishing loop, leftovers are listed |
| change method | two failures of the same action | no blind third attempt: another angle, root cause, reference repo |
| no passive waiting | act instead of watching | do it right now, or work on something else while a task runs |
| delegate / parallelize | split off the isolable work | sub-agents in parallel, model matched to the task, results checked by me |
| fresh context | a reviewer who did not follow along | sees only the result, not my reasoning |
| critique first | a verdict before any fix | defects ranked by severity, I fix only after agreement |
| provenance (known / inherited) | observed just now or taken from a document | rereading a doc is not verifying: I say which of the two it is |
| handoff | enough to resume without me | state, decisions, leftovers, next command, in a dated file |

## Method (words that change how I reason)

| Word | Meaning | What I do |
|---|---|---|
| root cause | the cause, not the symptom | trace back to what explains all the symptoms, fix there once |
| minimal repro | the smallest case that shows the bug | shrink the input to the smallest case that still breaks, before any fix |
| bisect | cut the history in half | `git bisect` or half the inputs, down to the faulty commit or line |
| falsifiable hypothesis | an explanation a measurement can refute | write the measurement that would kill it, run it before believing it |
| pre-mortem | "it broke a month from now: why?" | list the likely failures before shipping, cover the top 3 |
| adversarial / red team | try to break my own work | attack my assumptions, hostile inputs, unexpected order |
| steelman | the best version of the rejected option | state it honestly before deciding |
| exhaustive / contractual | everything, counted | exact count, every item handled or named with the reason |
| edge cases | empty, one, many, huge, negative, unicode, missing | enumerate them and test them one by one |
| case matrix | all combinations of inputs | input x state table, one test row per cell |
| acceptance criteria | what proves it is finished | write them before coding, verify each one at the end |
| surgical / minimal diff | touch as little as possible | no reformatting or off-topic renaming |
| spike / throwaway | prototype to learn, not to keep | fast, isolated, thrown away afterwards, the real version rewritten |
| read-only | observe without modifying | no writes, no restarts, report only |
| one-way door / two-way door | irreversible / reversible | reversible: I go ahead; irreversible: I confirm first |
| explicit trade-off | what we gain and what we pay | name the cost of the chosen option |
| first principles | start again from the real constraints | ignore habit, recompute from the numbers |
| show the proof | nothing without observation | command, output, and what it proves |
| timebox | a maximum time to search | stop at the deadline, hand back what I found and what stays open |
| tracer bullet / walking skeleton | a thin end-to-end slice before thickening | push one real case through the whole chain, then flesh out each step |
| vertical slice | one complete, narrow feature | from input to effect for a single case, not a whole unused layer |
| non-goals | what we do not do, written | list them before coding, refuse what spills over them |
| inversion | "how do I make sure to fail?" | list what would guarantee failure, check that I do none of it |
| five whys | keep asking why until the cause | each answer backed by proof, not by a guess |
| differential diagnosis | it works here, not there: what differs? | compare the healthy and the broken case (version, config, input), narrow the gap |
| Occam's razor | the simplest explanation first | test the mundane cause (config, path, permissions) before the exotic one |
| second-order effects | what the fix triggers next | follow the consequence one step further (load moved, queue growing) |
| Goodhart's law | a measure that becomes a target stops measuring | check the real effect, not only the counter I pushed up |
| order of magnitude (Fermi) | estimate before measuring | back-of-envelope calculation (bytes, seconds, cost) to spot an absurd result |
| ADR / recorded decision | the decision and its reason, written | context, choice, rejected options, in 5 dated lines |
| counterexample | a single case is enough to refute a rule | look for the case that breaks it before stating it |
| reference repo | someone already solved it | read a working implementation before inventing |
| decompose | a big problem into small, verifiable ones | independent sub-problems, each with its own check |
| work backwards | start from the wanted result | write the expected output, climb back up to the steps |
| checklist | the steps people forget under pressure | written list, ticked one by one, for any repeated and risky action |
| open question | what we do not know yet | list it separately, do not fill it with a guess |

## Decision and priority

| Word | Meaning | What I do |
|---|---|---|
| Pareto (80/20) | a few causes produce most of the effect | sort by impact, handle the head, say what I leave |
| risk first | start with the most uncertain part | resolve the unknown that could invalidate everything before building the rest |
| critical path | the chain of steps that sets the deadline | parallelize everything off it, never let it wait |
| sunk cost | what is already spent does not justify continuing | judge on what remains to do, drop it if another route is shorter |
| opportunity cost | choosing A means giving up B | name what will not be done |
| reuse before writing | what exists first | search the repo, then the standard library, then installed dependencies, before any new code |
| MVP | the smallest useful version | the core only, the rest listed and not done |
| scope creep | the work grows along the way | flag the addition, cut it out or get it approved |
| impact x probability | rank the risks | handle first what is severe and likely |
| Hofstadter's law | it always takes longer than planned | estimate by steps, give a range and not a single number |
| good, fast, cheap | you only get two out of three | say which one is sacrificed |
| good enough | perfection has a cost | stop at the acceptance criteria |

## Debugging

| Word | Meaning | What I do |
|---|---|---|
| read the whole error | the message often states the cause | type, message, file and line read before any hypothesis |
| characterize before explaining | describe the symptom before looking for its cause | when, where, how much, since when, always or sometimes; the explanation comes after |
| instrument | measure instead of guessing | a log or a counter at the doubtful point, rerun, read |
| one variable at a time | a single change between two attempts | otherwise impossible to know what fixed or broke it |
| last known good | the last time it worked | known-good commit, config or version, compared with the current one |
| isolate | remove everything not needed for the bug | disable by halves until the faulty component |
| attribution (correlation / causation) | happening at the same time does not mean caused by | look for the mechanism, compare against a control before crediting myself with an effect |
| call stack | who called what | follow the trace to the first line of our code |
| strace / network trace | see what the program really does | system calls or packets, when the logs say nothing |
| heisenbug | the bug vanishes when observed | suspect timing and concurrency, log without slowing down |
| latent bug | present for a long time, revealed by something else | look for what changed around it, not only the faulty line |
| mask the symptom | silencing is not fixing | no `try/except` or `sleep` added to hide a failure |

## Reporting and communication

| Word | Meaning | What I do |
|---|---|---|
| bottom line first (BLUF) | the answer on the first line | verdict, then proof, then detail only if it helps |
| facts / assumptions / judgments | do not mix what is known with what is believed | three separate labels in the report |
| confidence level | how sure I am | sure, likely or uncertain, with what would remove the doubt |
| derived numbers | a count comes from a command, not from my head | count by script, cite the command |
| processed / total ratio | the count of what is done | `12/15`, and the 3 remaining named with the reason |
| gaps | what was not done or not verified | explicit list, never passed over in silence |
| locatable deliverable | a path, not "it's done" | absolute path of every artifact produced |
| one-click check | how to verify it yourself | the exact command or URL to run |
| next action | a single action expected from the user | named, on the last line |
| one page / map | everything fits on one screen | plain language, a single action requested, the sorting stays my job |
| plain language | no jargon or acronyms | common words, every technical term defined once |
| before / after | show the change | two columns or a diff, not a description |
| concrete example | a real case rather than a generality | one input and its output |
| diff only | just what changes | no whole file copied back |
| table | compare on criteria | one row per option, one column per criterion, no prose |

## Robustness

| Word | Meaning | What I do |
|---|---|---|
| idempotent | rerunning gives the same state | check before acting, `mkdir -p`, replace a delimited block and never append it twice |
| atomic | all or nothing, never half-done | write `x.tmp` then `rename`, use a transaction, no visible intermediate state |
| reentrant | safe with two runs at the same time | lock (`flock -n`), temp files unique per PID |
| deterministic | same inputs, same output | no hidden time or randomness, explicit sort, fixed seed |
| convergent / declarative | you describe the desired state, the tool brings it there | compare desired and actual, apply only the difference |
| fail-fast | fail early and loud | `set -euo pipefail`, validate at the entry, non-zero exit code |
| fail-closed / fail-open | when in doubt: refuse / let through | security = closed; live broadcast = open, and say so |
| graceful degradation | a partial failure does not break the whole | explicit fallback (waiting clip, last known value), alert |
| backoff + jitter | retry slower and slower, spread out | capped delay, bounded number of attempts, never a tight loop |
| timeout | every wait has an end | deadline on every network call and subprocess |
| bounded | everything has a limit | queue size, attempts, memory, logs (rotation), duration |
| resumable / checkpoint | picks up where it stopped | progress written after each step, resume at the offset |
| crash-only | a `kill -9` breaks nothing | state always consistent on disk, repair at startup |
| graceful shutdown | SIGTERM is honored | finish the current item, cleanup `trap`, no half-written file |
| quarantine | set aside without destroying | move to a separate folder, never delete |
| poison message | an input that always fails | after N failures, quarantine (dead letter) instead of looping |
| append-only | you add, you do not rewrite | line-by-line journal, history stays readable |
| tombstone / soft delete | mark as deleted instead of erasing | a field or a marker file, restore possible |
| single writer | only one process writes a given state | the others read or go through the intended tool |
| idempotency key | an identifier makes a send replayable without duplicates | deduplicate by id (message, job, file) |
| at-least-once / exactly-once | delivered at least once / exactly once | at-least-once + deduplication, the only realistic exactly-once |
| transient / permanent | an error that will pass / that will not | retry the first (timeout, 503), give up at once on the second (404, 401) |
| watchdog | restart what is frozen, not only what is dead | `Restart=on-failure`, `WatchdogSec`, test for progress and not for presence |
| let it crash / supervision | die cleanly rather than survive inconsistent | exit with an error, let the supervisor restart on a clean state |
| durable / fsync | really written, not in a cache | `flush` + `fsync` before the `rename` for state that must survive a power cut |
| write-ahead intent log (WAL) | note what you are about to do before doing it | at restart, finish or cancel the noted operation |
| compensation / saga | every step has its inverse action | on failure midway, undo what is done in reverse order |
| outbox | the state and the message to send written together | the send starts from a local queue, replayed until acknowledged |
| lease | a lock that expires on its own | dated lock with a duration, a dead holder does not block forever |
| SPOF | the link whose failure stops everything | name it, give it a second path or an alert |
| safe default | with no setting, the least dangerous behavior | the destructive action requires an explicit flag |
| orphan / zombie | what a crash leaves behind | at startup, collect `.tmp` files, stale locks, parentless processes |
| retention | how much you keep, and until when | written rule (last N, N days), enforced by the code |
| output validation | do not emit what you would refuse to receive | check the produced file (size, format, duration) before publishing it |
| sanity check | an absurd result stops there | plausible bounds checked, refuse rather than propagate |
| empty-state bootstrap | restarting with no state or cache must work | test the first start, not only the resume |
| bounded restart | a supervisor does not restart forever | `StartLimitBurst`, alert when the cap is reached |
| replayable (replay) | the raw inputs are kept | rebuild the state by replaying them after a bug |

## Concurrency and time

| Word | Meaning | What I do |
|---|---|---|
| race condition | the result depends on arrival order | identify the shared state, protect it or remove it |
| TOCTOU | checked then used, but it changed in between | act and check in one operation (`O_EXCL`, `rename`, `mkdir` as a lock) |
| compare-and-swap / optimistic | write only if nothing changed | version number or ETag checked at write time, otherwise reread |
| deadlock | two locks waiting on each other | fixed acquisition order, timeout on the lock |
| backpressure | the consumer slows the producer | bounded queue, the producer waits or refuses |
| load shedding | refuse work to survive | reject the least important when load exceeds the threshold |
| bulkhead | partition the resources | CPU/memory quota per service (`CPUQuota`, `Nice`) |
| circuit breaker | cut a call that keeps failing | after N failures, pause, then a single trial call |
| rate limit | capped throughput | token bucket, honor `Retry-After` |
| debounce / throttle | group / space out triggers | one processing per burst / at most one per interval |
| hysteresis | two thresholds, rising and falling | alert at 2 h, clear at 3 h: no flicker |
| flapping | a state that oscillates nonstop | hysteresis, confirmation delay, counter |
| monotonic clock | measure a duration without jumps | `time.monotonic()`, never wall-clock time for a delay |
| UTC / ISO 8601 | store in UTC, standard format | `2026-11-16T22:30:00Z` in the database and logs, local time at display |
| eventual consistency | the copies end up converging | readers tolerant of lag, no read right after a write |
| thundering herd | everyone wakes up at the same time | spread out (jitter), a single recompute for all |
| single-flight | one execution for N identical requests | the later ones wait for the result of the first |
| bounded concurrency | N tasks at a time, no more | semaphore or fixed-size pool, never one launch per item |
| fan-out / fan-in | split then gather | independent batches in parallel, results merged and counted |
| starvation | a task never served | fair queue, aging priority |
| livelock | everything moves, nothing advances | measure progress, not activity |
| fencing token | a former lock holder still writes | increasing number attached to each write, the old one is refused |
| clock skew | two machines do not have the same time | do not compare their timestamps to the second, order by sequence number |
| duration / calendar date | 24 h is not "tomorrow, same time" | durations in seconds, dates with a time zone, test the clock change |
| snapshot | read a consistent frozen state | copy then read the copy, never a file being written |
| event > polling | react instead of querying | webhook, inotify, `wait`; otherwise polling bounded at a justified interval |
| advisory lock | a lock only cooperating parties respect | all writers go through the same lock, otherwise it protects nothing |
| short critical section | hold the lock as briefly as possible | prepare outside the lock, do only the write inside |
| non-blocking async | a blocking call freezes the whole event loop | async I/O, heavy computation in a worker, the interface never freezes |
| serial / parallel | one `await` after another, or together | `gather` or `Promise.all` when the calls are independent, with a cap |
| cancellation | cleanly stop a running task | cancellation signal propagated, resources returned |

## Data and formats

| Word | Meaning | What I do |
|---|---|---|
| parse, don't validate | convert the input into a safe structure once | parse at the boundary, the rest of the code only sees typed values |
| make illegal states unrepresentable | the type prevents inconsistency | enum rather than two contradictory booleans |
| total function | all cases handled | complete `match`, the unknown case raises a named error |
| schema / data contract | the expected shape, written down | schema or dataclass, `version` field in the files |
| round-trip | read(write(x)) == x | a test that checks it |
| canonical form | a single spelling for a given value | normalize (NFC, case, trailing `/`) before comparing |
| explicit encoding | never the default encoding | `encoding="utf-8"`, `newline="\n"`, no BOM |
| units in the name | `timeout_s`, `size_mb` | never a bare ambiguous number |
| magic numbers | named constants | `MAX_RETRIES = 3` rather than a stray `3` in the code |
| integers for money | no float for amounts | cents as an integer or `Decimal` |
| off-by-one / half-open ranges | boundary error | `[start, end)`, test 0, 1, n-1, n |
| content-addressed | named by its hash | free deduplication, verifiable integrity |
| null / missing / empty | three different states | distinguish them in the schema, do not fold two into one |
| tolerant reader (Postel's law) | strict on send, tolerant on receive | ignore unknown fields, keep them intact on rewrite, emit the exact format |
| checksum | prove the bytes are intact | hash compared after each transfer or copy |
| no silent truncation | cutting without saying so is lying | refuse or report what overflows, with the count |
| real parser | no regex on HTML, JSON, CSV, shell | the format's library, regex reserved for flat text |
| floats | 0.1 + 0.2 does not equal 0.3 | compare with a tolerance (`math.isclose`), never `==` |
| stable sort / total order | an order that does not depend on chance | complete sort key, explicit tie-breaking |
| cursor pagination | resume after the last one seen | opaque cursor rather than `offset`, which skips or doubles rows |
| JSON Lines | one object per line | simple append, streaming read, one damaged line does not lose the file |
| natural / surrogate key | business identifier or generated identifier | generated id for linking, business key as a uniqueness constraint |
| normalized / denormalized | written once or copied to read fast | derived copy rebuilt from the source, never edited by hand |
| opaque ID | an id carries no meaning | do not slice it or infer an order from it |
| UUID / ULID | unique identifier without a coordinator | ULID or UUIDv7 when you also want creation order |
| sentinel value | `-1` or `""` to mean "nothing" | `None` or a dedicated type: the sentinel ends up being a real value |
| size limit | every field has a maximum | length checked at the entry, clear error beyond it |
| bytes / characters | a character is not a byte | count and cut in characters, never in the middle of a UTF-8 sequence |
| format compatibility | yesterday's file can be read today | migrate on read according to `version`, test with an old file |

## Storage and databases

| Word | Meaning | What I do |
|---|---|---|
| transaction | several writes, a single outcome | everything in one transaction, full rollback on error |
| constraint | the database guards the invariant | uniqueness, foreign key, `NOT NULL`, rather than a check in the code |
| upsert | insert or update in one action | `INSERT ... ON CONFLICT`, no read then write |
| isolation level | what a transaction sees of the others | know it, lock the row you read in order to modify it |
| query plan | how the database goes about it | `EXPLAIN` before adding an index or rewriting |
| SQLite in WAL | readers and writer no longer block each other | `journal_mode=WAL`, `busy_timeout`, a single writer |
| versioned migration | the schema evolves through numbered scripts | each migration run once, in order, recorded in the database |
| hot backup | copy a running database | the database's own backup tool, never a `cp` of the open file |

## Clarity

| Word | Meaning | What I do |
|---|---|---|
| semantics | the name says what it is | business names, exit codes and logs that state the cause, not `data2` or `ok` |
| explicit > implicit | nothing guessed | named parameters, no magic default value |
| least surprise | it does what the name promises | no hidden effect in a function that "reads" |
| pure function / side effect | computation without touching the world / what touches it | separate the computation (testable) from writes, network, disk |
| functional core, imperative shell | pure logic at the center, I/O at the edge | test the core without mocks |
| immutable | you do not modify, you recreate | copy rather than mutating shared state |
| single source of truth | a piece of data lives in one place only | read that file, never a copy retyped by hand |
| cohesion / coupling | together what changes together / few links | one module = one reason to change |
| orthogonal | one setting does not affect another | independent options, no cross effects |
| composable | small pieces that fit together | Unix style: one input, one output, chainable |
| early return | exit early rather than nest | guards at the top of the function, happy path flat |
| YAGNI | you aren't gonna need it | no option or abstraction "for later" |
| rule of three | factor out on the 3rd repetition | two copies tolerated, the third becomes a function |
| Chesterton's fence | understand before removing | find out why the line exists (git blame) before removing it |
| command / query (CQS) | a function acts or answers, not both | `get_x` modifies nothing, `set_x` returns no data |
| Law of Demeter | only talk to your direct neighbors | no `a.b.c.d`, ask `a` for what I need |
| dependency inversion | the core does not know the detail | pass the dependency (clock, network, disk) as a parameter |
| state machine | named states and transitions | table of allowed transitions, any other raises an error |
| decision table | data rather than a cascade of `if` | dictionary from case to action, readable and testable line by line |
| locality | understand without switching files | keep together what is read together, no indirection on principle |
| comment = why | the code says what, the comment says why | one line on the constraint or the trap, nothing that paraphrases |
| actionable error | the message says what, where, and what to do | faulty value, file or key, corrective action |
| never swallow an error | an `except: pass` hides the failure | catch the precise type, log, rethrow or decide |
| positive boolean | `enabled`, not `not_disabled` | no double negative, a name that reads inside an `if` |
| dead code | what is no longer called | delete it (git keeps it), no commented-out block |
| convention > configuration | the sensible default with no setting | follow the repo's convention, expose an option only if it serves |
| strict typing | the tool catches the error before execution | strict mode, no `any` or `type: ignore` without a written reason |
| explicit optional | a value may be missing, the type says so | handle the missing case where it appears, not three calls later |
| guaranteed release | the resource is returned no matter what | `with`, `finally` or `defer` around every file, lock, connection |
| assertion / validation | internal bug or wrong input | `assert` for the impossible, named error for input |
| readable > clever | code is read more often than written | the obvious version, not the line to decipher |
| one level of abstraction | a function does not mix strategy and detail | the steps at the top, the mechanics in named functions |
| auto-formatter | style is not debated | `ruff format` or `prettier`, applied by the tool |
| mutable default | `def f(x=[])` shares the list across calls | `None` as default, list created inside the function |
| local consistency | new code looks like the old | same names, same idioms, same comment density as the file |

## Architecture

| Word | Meaning | What I do |
|---|---|---|
| separation of concerns | each part handles one thing only | I/O, business rules and display in separate modules |
| ports and adapters (hexagonal) | business logic at the center, the world around it | the core defines the interface, one adapter per external service |
| deep module | narrow interface, lots of work behind it | few public functions, the complexity hidden inside |
| leaky abstraction | the hidden detail comes up anyway | document the limit, don't stack another layer on top |
| composition > inheritance | assemble rather than derive | small pieces passed as parameters, no deep hierarchy |
| anticorruption layer | translate an external service's model at the border | one module knows their format, the rest sees ours |
| ubiquitous language | the business words in the code | same names in the prompt, the code, the logs and the interface |
| bounded context | a word has only one meaning within a given scope | one model per domain, explicit translation between two |
| monolith first | a single program as long as it holds up | split only on a measured need |
| staged pipeline | each stage reads one artifact and writes one | stages replayable on their own, intermediate artifacts kept |
| pub / sub | the sender doesn't know its subscribers | named events, independent subscribers |
| event sourcing | the state is the sum of the events | append-only journal, state rebuilt by replaying it |
| CQRS | one model to write, another to read | read view derived, rebuildable from the writes |
| extension point | the planned place to add a case | registry table or hook, only when two real cases exist |
| global state | a variable anyone can change | pass it as a parameter, or give it a single owner |
| temporal coupling | A must run before B with nothing saying so | make the wrong order impossible (constructor, type, single function) |
| local first | works without a network | local state is the source of truth, sync in the background |
| 12 factors | config from the environment, logs on stdout, stateless processes | apply these rules to every deployed service |

## Verification

| Word | Meaning | What I do |
|---|---|---|
| invariant | true before, during and after | write it as an `assert` or a check |
| pre / postcondition | what must be true before / after | check the input, prove the output |
| dry-run | show without doing | default mode prints the plan, `--apply` to act |
| control test | a check you have seen fail | run the negative case first, otherwise the test proves nothing |
| mutation testing | break the code on purpose | if no test turns red, the test covers nothing |
| regression test | the fixed bug doesn't come back | a test that replays the exact bug |
| characterization test | freeze the existing behavior before changing it | capture the current output, refactor, compare |
| property-based | a property true for every input | generate hundreds of inputs (Hypothesis), not three examples |
| fuzzing | random or hostile inputs in bulk | on every exposed parser |
| test oracle | another way to compute the expected value | don't copy the code into the test |
| hermetic | the test depends on nothing external | no network, clock and randomness injected |
| flaky | a test that passes or fails at random | find the cause (order, time, network), never "rerun" |
| fake > mock | a real simplified implementation | in-memory fake rather than a mock that recites the code |
| smoke test | the minimum that proves it starts | run it, one request, exit code 0 |
| end to end | the whole real chain | from the user's input to the observed effect |
| golden file | frozen reference output | compare against a file validated once |
| observability | knowing from outside what is going on | dated logs with the cause, counters, heartbeat |
| structured logs / correlation id | one line = fields; an id follows the request | JSON or `key=value`, the same id from start to end |
| measure before claiming | a number, not an impression | command and result before any "it's fixed" |
| contract test | both sides of an interface agree | same example checked on the caller and the callee |
| error path | failure gets tested too | one test per expected error: bad input, network down, disk full |
| fault injection (chaos) | cause the failure on purpose | `kill -9` midway, network cut, then check the state |
| endurance test (soak) | hold up over time | hours of running, watch memory, descriptors, disk |
| load test | hold up under volume | ramp up to the breaking point, note the threshold |
| coverage != proof | an executed line is not a verified line | look at the assertions and branches, not the percentage |
| arrange / act / assert | set up, act, verify | three blocks per test, a single reason to fail |
| static analysis | catch without executing | lint and types (`ruff`, `mypy`, `tsc`) before the tests |
| independent verifier | my test only verifies my model | check through another path: another tool, the real target, the user's own eyes |
| silent probe | no result doesn't mean nothing found | prove the probe detects a known case before concluding absence |
| four golden signals | latency, traffic, errors, saturation | the four counters on every service that serves |
| actionable alert | one alert = one action to take | alert on the symptom the user sees, with the command to run |
| red, green, refactor | the test before the code | failing test, minimal code that passes, then cleanup |
| parameterized test | a table of cases, a single test | adding a case means adding a row |
| unit / integration | one piece alone / the pieces together | many fast unit tests, a few integration tests on the joints |
| test behavior | what it does, not how it's done | a test that survives an internal refactor |
| short feedback loop | find out fast that it's broken | the fastest check first, the slow suite last |
| readable failure | the red test says what's wrong | expected, actual and input in the message |
| independent tests | none depends on order | each test creates and cleans up its own state |
| realistic data | the real world is dirty | anonymized real sample, not three clean values |
| visual regression | the screen didn't change unless we meant it | screenshot compared to a reference, per state and per theme |
| verify for real | a green CI doesn't prove execution | run in the real target (browser, machine, account) before pushing |
| exit code apart | a check run through a pipe loses its exit code | run it alone, read its code, filter the output afterwards |

## Performance

| Word | Meaning | What I do |
|---|---|---|
| profile before optimizing | measure where the time goes | profile or time each stage, optimize only the biggest |
| hot path | the code executed most often | focus the effort there, leave the rest readable |
| complexity (O(n)) | how the cost grows | avoid hidden quadratic (loop in a loop, `in` on a list) |
| N+1 | one query per item | group into one query or a batch |
| batch | process in packets | fewer round trips, bounded batch size |
| streaming | process as the data flows | read line by line, never the whole file in memory |
| zero-copy | don't copy the bytes again | hard link, `-c copy`, `rename` rather than copy |
| memoization / cache | don't recompute | explicit cache key, TTL, written invalidation rule |
| lazy | compute only when asked | generators, on-demand loading |
| honest benchmark | repeatable measurement | warm-up, several passes, median, same machine |
| percentiles (p50 / p99) | the average hides the worst cases | measure median and tail, handle the tail if it shows |
| bottleneck | the slowest stage sets the throughput | find it, optimize only it, remeasure because it moves |
| Amdahl's law | the gain is capped by the part that isn't sped up | compute the maximum gain before parallelizing |
| I/O-bound / CPU-bound | we wait or we compute | waiting: threads or async; computing: processes or a stronger machine |
| pool / keep-alive | reuse rather than reopen | one HTTP session, one connection pool, not one open per call |
| index | find without scanning everything | dictionary or index on the searched key, no repeated scan |
| delta | send only what changed | `rsync`, resume by byte range, comparison by hash |
| stale-while-revalidate | serve the old while refreshing | immediate response from the cache, update in the background |
| cold start | the first call pays for everything | warm up or measure separately, don't mix it with steady state |
| performance budget | a numeric ceiling per stage | set the threshold (ms, MB), fail the check if it's exceeded |
| skip the work | the fastest work is the work you avoid | remove the useless stage before speeding it up |
| memory leak | memory climbs and never comes back down | measure RSS over time, find the collection that keeps growing |
| flamegraph | where the time goes, as a picture | sampled profile, read the wide plateaus |
| perceived latency | what the user feels | show early, load the rest afterwards |
| cost per call | a billed or capped API | count the calls, cache, respect the quota |

## Security

| Word | Meaning | What I do |
|---|---|---|
| trust boundary | where external data comes in | validate and bound everything from the network, a file, a human |
| allowlist > denylist | allow the known rather than forbid the bad | closed list of accepted values |
| injection | data executed as code | arguments as a list (`shell=False`), parameterized SQL, never concatenation |
| path traversal | `../` that escapes the directory | resolve the path, check it stays under the root |
| SSRF | the server calls a user-supplied URL | allowed hosts only, no internal IPs |
| safe deserialization | read without executing | `yaml.safe_load`, `json`, never `pickle` from an external source |
| secret out of argv and logs | `ps` and the logs see everything | secret via stdin, `600` file or env, masked in the logs |
| constant-time comparison | don't leak through duration | `hmac.compare_digest` for signatures and tokens |
| defense in depth | several independent layers | validation + minimal rights + firewall |
| least privilege | just the rights needed | limited key, no root or `NOPASSWD` for convenience |
| sanitize / escape | clean the input / encode the output | escape at display time (HTML, shell, SQL) |
| audit trail | who did what, when | append-only journal of sensitive actions |
| rotation | a secret has a lifetime | plan the replacement without downtime |
| threat model | who attacks, what, from where | write it in 3 lines before choosing the protections |
| attack surface | everything that is exposed | close what isn't needed: port, route, option, dependency |
| authn / authz | who are you / are you allowed | check the right on every requested object, not only the login |
| IDOR | changing the id in the URL gives someone else's object | ownership check on the server at every access |
| XSS / CSRF | script injected into the page / request forged from another site | escaping on display and CSP; anti-CSRF token and `SameSite` cookies |
| cryptographic randomness | `random` can be guessed | `secrets` or `os.urandom` for tokens and identifiers |
| password hashing | never in clear, never bare SHA | `argon2` or `bcrypt`, with salt |
| verified TLS | an unverified certificate protects nothing | never `verify=False` or `-k`, fix the certificate store |
| supply chain | a dependency is foreign code | versions pinned by hash, few dependencies, read before installing |
| token scope and lifetime | a stolen token is worth what it allows | minimal scope, short expiry |
| minimization | don't collect what isn't needed | no personal data in logs, masked fields |
| input bomb (zip, ReDoS) | a small input that costs enormously | cap size, depth and time before processing |
| sandbox | run the unknown separately | dedicated user, container or VM, no network or secrets |
| file permissions | readable by whom? | `umask 077`, `chmod 600` on keys and sensitive state |
| CORS | which site can call the API from a browser | named origins, never `*` with cookies |
| session cookie | `HttpOnly`, `Secure`, `SameSite` | all three, limited lifetime, identifier renewed at login |
| no homemade crypto | the proven rather than the invented | recognized library, high-level primitives |
| patches (CVE) | a vulnerable dependency is an open door | dependency audit, targeted update |
| uniform error | don't reveal whether the account exists | same message and same duration for "unknown" and "wrong password" |
| confused deputy | my tool acts with my rights on behalf of someone else | check the requester's right, not mine |
| JWT | a signed token is verified in full | signature, enforced algorithm, expiry, audience |
| measured exposure | protect according to what is really reachable | check real ports and access before hardening or alerting |
| targeted secret read | never display the whole file | read only the wanted key, don't echo it in the output |

## Shell and scripts

| Word | Meaning | What I do |
|---|---|---|
| strict mode | `set -euo pipefail` | any failure stops the script |
| quote everything | `"$var"` everywhere | no word split on a space |
| `--` | end of options | `rm -- "$f"`: a name that starts with `-` stays a name |
| mktemp + trap | unique temp, cleaned up on exit | `trap 'rm -rf "$t"' EXIT` |
| stdout data / stderr diagnostics | separate the result from the messages | a script stays chainable in a pipe |
| exit codes | 0 ok, 1 error, 2 usage, others documented | never a failure that exits 0 |
| absolute paths | cron and systemd have neither your `PWD` nor your `PATH` | `/usr/bin/python3`, full paths |
| exec | the process replaces the shell | signals reach the real program |
| shellcheck | shell lint | run it before delivering a script |
| POSIX sh vs bash | what the target really has | busybox = `sh`, no `[[ ]]` or arrays |
| `while IFS= read -r` | read line by line without damaging anything | spaces and backslashes kept as they are |
| `-print0` / `-0` | file names separated by a null byte | `find -print0` with `xargs -0`, a name with a space or newline gets through |
| quoted heredoc | `<<'EOF'` interprets nothing | quotes on the delimiter as soon as the text contains `$` or backslashes |
| `command -v` | test that a tool exists | check dependencies up front, message naming the missing one |
| `printf` > `echo` | `echo` varies between shells | `printf '%s\n' "$x"` for any data |
| `$(...)` | readable, nestable substitution | never backticks |
| `local` | variable limited to the function | no global state leaking between functions |
| pipe = subshell | a variable modified in a `while` after a pipe is lost | redirection `< file`, or return the result on stdout |
| LF line endings | a carriage return breaks a script | write in LF, check with `file` before sending to a Unix machine |
| `set -x` | trace what runs | on to diagnose, off around secrets |
| filter then install | a failed filter installs nothing | write to a file, check it isn't empty, install afterwards |
| remote quoting | an `ssh` command is interpreted twice | script sent as a file or in base64, no nested quotes |
| argv as array | build a command without gluing strings | `"$@"` or an array, never `eval` |
| checked `cd` | a failed `cd` runs the rest in the wrong place | stop if the `cd` fails, or absolute paths without `cd` |
| switch to a real language | past 50 lines, shell gets fragile | Python as soon as there are data structures or parsing |
| `LC_ALL=C` | sorting and patterns depend on the system language | set it for a stable `sort` or `grep` |

## System and processes

| Word | Meaning | What I do |
|---|---|---|
| signals | TERM asks, KILL cuts down | TERM first, wait, KILL as a last resort |
| kill by PID | target one specific process | PID read then verified, never a broad pattern |
| process tree | children survive the parent | kill the whole group, check nothing is left |
| port in use | who is listening on it? | `ss -ltnp` before launching and after stopping |
| descriptor leak | files and sockets never closed | guaranteed close, count `/proc/PID/fd` over time |
| OOM | the kernel kills whatever exceeds memory | cap per service, read `dmesg` when a process vanishes without a log |
| disk full | no more bytes, or no more inodes | `df -h` and `df -i`, alert before 100 % |
| same filesystem | `rename` is atomic only without changing volume | temp file created in the destination directory |
| hard link / symbolic link | two names for one content / a pointer to a path | hard link to duplicate without copying, symbolic to switch versions |
| steal / iowait | CPU taken by the hypervisor / waiting on the disk | `vmstat` before concluding the code is slow |
| load (load average) | how many tasks are waiting | compare to the core count, not in absolute terms |
| systemd unit | a described and supervised service | `Restart=`, `After=`, limits, logs in journald; `start` and `restart` are not the same action |
| timer / cron | two ways to schedule | lock against overlap, logged output, catch-up decided |
| `ulimit` | the process ceilings | read them before blaming the code (open files, stack) |
| nice / ionice | CPU and disk priority | the background task goes after the live service |

## Networking and distributed systems

| Word | Meaning | What I do |
|---|---|---|
| the network lies | loss, delay, duplicates, reordering | any call can fail, arrive twice or out of order: the code plans for it |
| latency / throughput | duration of a round trip / volume per second | know which of the two is the limit before optimizing |
| reconnect with resume | a long connection always ends up dropping | automatic reconnect, resume at the last offset, backoff |
| half-open connection | one side still thinks it's connected | application ping with timeout, close and reopen on silence |
| local / public bind | `127.0.0.1` or `0.0.0.0` | local by default, public only if intended and protected |
| DNS and TTL | a name takes time to change | plan for propagation, no hardcoded IP in the code |
| IPv4 / IPv6 | two paths, two behaviors | test both, force one when the other is refused |
| NAT / reverse tunnel | a machine behind a router isn't reachable | it opens the connection outward itself |
| reverse proxy | one entry point in front of the services | TLS, routing and limits set in one place |
| partition (CAP) | the network splits in two | decide in advance: refuse to write, or accept diverging |
| split-brain | two nodes each think they are the leader | external arbiter or quorum, never two writers |
| message ordering | they arrive out of order | sequence number, ignore anything older than the last applied |
| propagated deadline | each hop adds its wait | one global deadline passed along, the callee never waits longer than the caller |

## Interfaces (CLI and API)

| Word | Meaning | What I do |
|---|---|---|
| machine output | a stable format for programs | `--json` next to the readable output, fields never renamed |
| non-interactive | usable without a human | no blocking prompt, explicit `--yes`, TTY detection |
| versioned API | the old client keeps working | version in the URL or header, a break = a new version |
| HTTP verbs | GET reads, PUT replaces, POST creates | GET without side effects, PUT and DELETE idempotent |
| honest status codes | the code tells the truth | never a 200 that contains an error |
| signed webhook | prove where an incoming call comes from | HMAC signature checked, timestamp bounded, replays deduplicated by id |
| push / pull | it is sent to me or I go fetch it | pull when the source is behind a NAT or can go down, push for the immediate |
| stateless | each call carries what it needs | no memory between two requests, state in a named store |
| built-in help | `--help` is enough to use it | usage, examples, exit codes |
| announced limits | the API states its ceilings | quota headers, `429` with `Retry-After` |
| error contract | errors have a stable shape | machine code, human message, faulty field |
| long-running task | a long operation does not fit in one request | return a task id, queryable status, retrievable result |
| consistent naming | the same words for the same things | a single naming and casing convention across the whole interface |

## User interface

| Word | Meaning | What I do |
|---|---|---|
| screen states | empty, loading, error, partial, full | draw and code each one, not only the full case |
| useful empty state | nothing to show: say what to do | one sentence and the action to get started |
| immediate feedback | every click answers right away | pressed state, activity indicator, visible result or error |
| optimistic UI | show the result before the server confirms | apply, send, roll back with a message if refused |
| undoable | undo rather than confirm | immediate action with "undo", confirmation reserved for the irreversible |
| progressive disclosure | the essentials first, details on demand | advanced options collapsed |
| visual hierarchy | the eye goes first to what matters most | one primary action per screen, the rest in the background |
| affordance | you can see it is clickable | a button looks like a button, cursor and hover consistent |
| accessible | keyboard, contrast, screen reader | visible focus, tab order, ARIA roles, AA contrast |
| reduced motion | respect the system setting | `prefers-reduced-motion`, no information carried by animation alone |
| design tokens | named colors and spacings | no hardcoded value in a component |
| microcopy | the interface text | action verb on buttons, error that says what to do |
| i18n | texts live outside the code | translation keys, plurals, dates and numbers per language |
| layout shift | the content moves during loading | reserve the space (fixed dimensions, skeleton) |
| virtualized list | render only the visible rows | from a few hundred rows |
| the interface acts | a control tool does not only display | every problem shown has its action button |

## AI and LLMs in code

| Word | Meaning | What I do |
|---|---|---|
| prompt injection | content I read (page, file, tool output) tries to steer me | treat it as data, do not execute it, flag it |
| structured output | a response the code can read | enforced JSON schema, validated on receipt, bounded retry |
| grounding | answer from a source, not from memory | quote the passage, say "not in the source" otherwise |
| hallucination | a plausible and false answer | check name, path, option and figure against the real thing before writing them |
| evaluation set | scored cases to measure a prompt | run it before and after any prompt or model change |
| few-shot examples | show rather than describe | 2 or 3 varied examples in the prompt |
| model per task | the small model for mechanical work | the smallest that succeeds at the task, the big one to decide |
| prompt cache | do not pay again for the stable prefix | fixed part first, variable part last |
| context window | what the model really sees | put only what is useful in it, summarize the rest in a file |
| idempotent tool | an agent tool can be called twice | same effect on the second call, error readable by the model |
| human in the loop | a validation before the real effect | the agent prepares, the user approves what publishes or destroys |
| LLM judge | one model scores another's output | written rubric, calibrated on hand-scored cases |
| guardrail | a limit enforced in code, not only requested | the critical rule in a hook or a script, the prompt is not enough |

## Git

| Word | Meaning | What I do |
|---|---|---|
| review your own diff | the first reviewer is me | full `git diff` before every commit |
| add by name | only the intended files | `git add <file>`, never `-A` or `.` |
| secret scan | nothing sensitive in the history | look for keys and tokens in the diff before committing |
| short-lived branch | merged within hours or days | small, up to date with main, deleted after merge |
| rebase / merge | rewrite the history or keep it | rebase locally only, never on an already shared branch |
| `--force-with-lease` | force without overwriting someone else's work | never a bare `--force` |
| reflog | the safety net after a wrong move | a "lost" commit is found there: look before redoing the work |
| worktree | two branches open side by side | one folder per workstream, production stays untouched |
| pickaxe | since when has this line existed? | `git log -S <text>`, then read the commit |
| version tag | a fixed name for a shipped state | annotated tag at every version, never moved |
| `git -C` | act on a repo without moving into it | absolute path, especially in parallel calls |
| pre-commit hook | the check before the record | fast lint and scan, never skipped |

## Code evolution

| Word | Meaning | What I do |
|---|---|---|
| atomic commit | one commit = one coherent change | builds and passes the tests on its own |
| bisectable | every intermediate commit works | no "fix for the previous commit" broken in between |
| expand / contract | add the new, migrate, remove the old | never all three in the same deployment |
| strangler fig | replace little by little | new path next to the old one, switch over piece by piece |
| seam | a point where you can substitute | inject the dependency to test or replace it |
| deprecate before removing | warn, then delete | warning first, removal later |
| semver | MAJOR.MINOR.PATCH | break = major, addition = minor, fix = patch |
| reproducible build | same source, same binary | pinned versions, lockfile, no `latest` |
| drift | what is deployed differs from what is committed | compare by hash before diagnosing |
| separate refactor | change the shape or the behavior, not both | two commits: the refactor with no effect, then the change |
| small PR | a diff that can be read in one go | split by deliverable step, not by file |
| commit message = why | the diff already says what | imperative title, body on the reason and the risk |
| revert first | restore service before understanding | undo the faulty commit, diagnose afterwards with a cool head |
| named debt | a shortcut taken knowingly and written down | `shortcut:` comment with the limit and when to lift it |
| minimal public surface | what is exposed will have to be maintained | export only what is needed, keep the rest private |
| Hyrum's law | every observable behavior ends up used by someone | look for callers before changing a format, even an undocumented one |
| CI gate | nothing red gets through | lint, tests and build blocking, never bypassed (`--no-verify`) |
| changelog | what changes for the user | one line per visible change, at every version |
| vendoring | copy the dependency into the repo | when the source may disappear or must be frozen, version noted |
| code review | a second pair of eyes before the merge | look for bugs, forgotten cases and simplifications, not style |
| deletion > addition | the best diff removes code | look for what the change makes useless |
| isolated update | one version bump per commit | never mixed with code, tested for real |
| docs in the same commit | the README still tells the truth | update it together with the behavior it describes |
| migration tested on a copy | data goes to a clone first | run the migration, compare counts before and after |

## Operations

| Word | Meaning | What I do |
|---|---|---|
| backward compatible | the old caller still works | add without removing, default value = old behavior |
| reversible migration | you can go back | `.avant-<date>` copy kept, reverse step written |
| rollback | the way back | written before the deployment, not after |
| blast radius | what a mistake can touch | limit it: one channel, one service, one file at a time |
| canary / progressive rollout | a small share first | one instance, observe, then the rest |
| kill switch | stop in one action | `STOP` file read on every loop |
| feature flag | enable without redeploying | a file or a variable, off by default |
| config in env | settings outside the code | environment variable or `.env`, never hardcoded |
| config validated at startup | refuse to start on a bad config | message that names the missing key |
| liveness / readiness | alive / ready to serve | two distinct probes, not a plain "the process exists" |
| heartbeat / dead man's switch | regular sign of life; alert on silence | dated file, alert if too old |
| synthetic probe | a fake user that tests for real | regular real request, result compared |
| SLO / error budget | a numeric reliability target | decide on the number, not on the impression |
| runbook | written procedure for the incident | symptom, command, how to read the result, action |
| blameless postmortem | what broke and why | cause, proof, fix, check that keeps it fixed |
| toil | repetitive manual work | turn it into an engine |
| engine > tokens | a script rather than a repeated action | automate from the 2nd time |
| blue-green | two versions side by side, switch at once | the new one starts alongside, switch, the old one stays ready for the return |
| shadow / dark launch | the new code runs without serving | same inputs, outputs compared with the old one, nothing visible |
| drain | empty out before stopping | stop accepting, finish what is in flight, then cut |
| tested backup | a backup never restored does not exist | restore actually run, dated |
| 3-2-1 | 3 copies, 2 media, 1 offsite | check all three before saying "backed up" |
| RPO / RTO | how much you lose / how long to get back | two numbers decided before the incident |
| headroom | the reserve before saturation | measure CPU, RAM, disk, throughput before adding a load |
| expiry probe | certificate, token, key: everything expires | alert N days before the date, not after the outage |
| alert fatigue | too many alerts = no alerts | remove or group those that call for no action |
| MTTR | time to restore | work on recovery (detection, rollback) before perfect prevention |
| freeze | no change during a sensitive period | postpone the non-urgent deployment, say so |
| control plane / data plane | what decides / what carries | an orchestrator outage must not cut the flow in progress |
| game day | rehearse the outage dry | run the runbook on a real, deliberately caused cut |
| infrastructure as code | machine state described in a repo | every change goes through the file, not through a manual command |
| disposable server | rebuild rather than repair | complete install script, tested on a clean machine |
| one role per machine | workloads do not encroach on each other | measure the machine before adding a load to it |
| post-deployment check | deployed does not mean running | real probe right after, compared with before |
| maintenance window | step in when it disturbs least | pick the time, warn, bound the duration |
| inventory | what runs, where, and why | up-to-date list of services, ports, scheduled tasks and secrets per machine |
| one-action deployment | one command, always the same | deployment script, not a sequence of steps remembered by heart |

## Combinations

| Phrase in the prompt | What I do with it |
|---|---|
| idempotent + atomic + dry-run | rerunnable deployment script that shows its plan, with no half-done state |
| resumable + bounded + quarantine | batch processing that survives a crash and never loops on a bad item |
| root cause + minimal repro + regression test | a bug fix that does not come back |
| parse don't validate + trust boundary + fail-fast | safe external input, rejected early with a clear message |
| control test + mutation + hermetic | tests that really prove something |
| blast radius + canary + kill switch + rollback | production rollout of a service that is already running |
| surgical + Chesterton + characterization | touch old code without breaking anything |
| exhaustive + case matrix + acceptance criteria | delivery verifiable case by case |
| transient / permanent + backoff + circuit breaker | network call that retries what can pass and drops the rest |
| tracer bullet + vertical slice + non-goals | new project that works end to end from day one |
| differential diagnosis + bisect + Occam's razor | "it worked yesterday" outage found without guessing |
| tested backup + 3-2-1 + RPO / RTO | data you can really recover |
| threat model + attack surface + least privilege | security calibrated on the real exposure |
| lease + fencing token + single writer | shared lock that never lets two writers in |
| silent probe + control test + independent verifier | a "found nothing" you can believe |
| drain + blue-green + revert first | change version without downtime, with an immediate way back |
| atomic + versioned schema + tolerant reader | JSON state file that does not get corrupted and can be reread after an update |
| read the whole error + characterize + one variable at a time | diagnosis with no assumption and no blind patch |
| plan first + scope + stop condition | long task handed over autonomously without going off the rails |
| bottom line first + gaps + one-click check | a report the user verifies in ten seconds |
| screen states + immediate feedback + undoable | a screen that never leaves the user in doubt |
| transaction + constraint + upsert | rerunnable database write that keeps its invariants |
| reconnect with resume + backoff + idempotency key | long-lived connection that survives cuts with no duplicates |
| review your own diff + secret scan + add by name | clean commit, with no extra file or secret |
| structured output + evaluation set + guardrail | LLM-based function you can put in production |
| kill by PID + port in use + post-deployment check | service restart with no collateral victim |
| ultrathink + pre-mortem + steelman | hard decision, weighed before it is made |
