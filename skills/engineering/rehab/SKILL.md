---
name: rehab
description: Rehabilitate an AI-assisted codebase that has gone sloppy — audit the slop, fix the map the agent reads, put the rules file on a diet, convert prose into enforced checks, pay down the worst debt behind characterization tests, and close the loop so it stays clean.
disable-model-invocation: true
---

# Rehab

An AI-heavy repo doesn't rot because the model is careless; it rots because
nothing in the loop can say no. The doom loop: sloppy codebase → agent mimics
the slop → tired human waves the diff through → sloppier codebase. Rehab is
the deliberate interruption of that loop, and it runs on one law:

**Enforce, don't instruct.** Giving an agent instructions is not the same as
giving it verification. Prose is advisory — a failing check fed back into the
agent's own loop is binding. If the model knew what good code looked like, it
would have written it; more exhortation is not the cure, more verification is.

"The AI doesn't listen" is mechanistic, and each mechanism is a stage below:

- **The map lies.** The orienting docs (CLAUDE.md, README, architecture
  notes) have drifted; the agent is navigating a repo that no longer exists.
- **The rules file is over budget.** Models reliably follow on the order of
  150–200 discrete instructions, and compliance degrades *uniformly* as rules
  pile up — every rule you add weakens all the others. Pruning is a
  functional change, not housekeeping.
- **The codebase out-shouts the docs.** The agent mimics what it reads, so
  consistency is self-healing and inconsistency compounds. Whatever the worst
  module looks like is an instruction too.

Run the stages in order for a full rehab, or enter at one when asked for just
that slice. Stage 1's findings drive everything after; each later stage names
what it consumes. The symptom → check catalog lives in
[symptoms.md](symptoms.md) — read it when stage 1 or 4 runs.

## 1. Triage

Diagnose before treating. Read the repo — code, config, CI, git log — and
distinguish what *exists* from what *runs*: a lint script nothing executes is
decoration, a suppression comment in a linter-ignored directory is a dead
ritual, a rules file nobody prunes is a scar log.

Baseline the numbers so paydown is measurable: duplication (jscpd, dupl),
unused exports and files (knip, deadcode), file/function size outliers,
suppression counts and their justification quality, tests versus LOC per
package. Read the git log for fix-spam — N consecutive one-line fixes to one
subsystem is a missing test at that seam, not bad luck. Score each package's
enforcement against its blast radius: the shared contract consumed by three
repos needs the *most* CI, not the least.

**Done when** you can present: per package, what actually runs on push; the
baseline metrics; every orienting doc and rules file with a staleness verdict;
and the three worst offenders named with evidence.

## 2. Fix the map

The single highest-leverage move, and it touches no source code. Verify every
structural claim in every doc an agent reads as truth — package counts, stack
lists, layout blocks, export targets, architecture diagrams, "the API is X" —
against the tree. Hand-written claims about repo shape have exactly three
futures: **generated** from the source of truth, **asserted** by a test that
fails when they drift, or **deleted**. A doc that admits its own staleness
gets deleted, not annotated — an annotation teaches the next reader that
stale is acceptable.

Sweep the plan graveyard: completed plans written in present tense, agent
scratch promoted to tracked files, audits indistinguishable from live specs.
Committed plans carry a status header or they go; scratch goes to a
gitignored directory. Repo-level forks (`thing.old/`, a second checkout as a
long-lived branch) become branches or get deleted.

**Done when** every claim in every orienting doc is verified-true, generated,
or asserted; every committed plan has a status; and no fork of a repo lives
beside it.

## 3. Instruction diet

Prune the rules file *before* adding anything — a bloated CLAUDE.md weakens
every rule in it. Delete: anything derivable by reading the code, anything a
tool already enforces, anything task-specific rather than universal, and the
appended hotfix lines that accreted one per annoyance. Target ~300 words.

What survives gets shape: three tiers (*always* / *ask first* / *never*, one
line of why each), concrete examples over descriptive paragraphs, `file:line`
pointers to the authoritative implementation instead of inlined copies that
go stale. And the escalation rule: every "never do X" still in prose is a
ticket to make X mechanically impossible — send it to stage 4.

**Done when** the rules file is ≤300 words, every line is universal and
inexpressible as a check, and every deleted prohibition either became a
stage-4 check or died on its merits.

## 4. Law

Convert conventions into checks the agent cannot ignore. Floor first: every
repo runs lint + typecheck + test in CI from day one — enforcement scales
with fan-out, not LOC. Then map each symptom triage found to the check that
kills it (the table is in [symptoms.md](symptoms.md)): size caps for god
files, no-empty-catch for defensive spam, unused-export gates for speculative
surface, justified-suppression rules so opt-outs carry reasons.

Two properties make law bind instead of decorate. **It runs inside the
agent's loop**: a hook lints the agent's own edit and lands the failure back
in its context, so the model self-corrects instead of shipping; checks run in
seconds locally, not only in a 20-minute CI. **It ratchets**: duplication and
dead-export counts gate at today's baseline and only move down; suppression
opt-outs are capped and carry a tracking reference, so a size budget can't
quietly become paperwork.

**Done when** a rule-breaking edit fails inside the agent's own loop before
commit, no repo lacks the floor, and the ratchets are live at baseline.

## 5. Paydown

Only now touch the debt — with law in place, cleaned code stays clean. The
hard gate: **characterization tests before any structural change**. The
dominant AI risk is silent behavioral drift, not compile errors; pin current
behavior, quirks included, and predict in chat what the code should do before
writing the pin. Never trust the module's existing tests as the pin — the
agent wrote them.

Work the worst offenders from triage in dependency order, leaves first, in
batches sized to one reviewable PR each, with a verifier per batch that the
fixer is fenced from editing. Narrow diffs — one function, one file, one
boundary. Strangler-fig modules whose surface is defensible but whose
interior isn't. Target the deep-module shape: narrow interface, substantial
implementation — the opposite of the shallow pass-through layers agents
accrete. And plant one **golden example** per recurring pattern (the
canonical module, the canonical test, the canonical error path): the agent
copies whatever it reads, so make the best file the template. Done means
verified through real seams: tests green *and* logs clean *and* the actual
workflow exercised — not "should work now."

**Done when** each worst offender is pinned, reshaped or explicitly deferred
with a named reason, every baseline metric moved, and the ratchets held
throughout.

## 6. Hold the line

Close the loop that rehab opened. Every anti-pattern caught in review becomes
a check the same day, or it recurs — that's the escalation rule as a standing
habit, and it's what keeps the scar log from regrowing. The map keeps an
owner: structural doc claims stay generated or asserted. Re-run the triage
numbers on a cadence; when the rules file grows, that's a diet trigger, not
progress.

**Done when** recurrence has a standing path into law and the next rehab
would find nothing new — the loop rejects what shouldn't go in.
