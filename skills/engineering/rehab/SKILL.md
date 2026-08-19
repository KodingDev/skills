---
name: rehab
description: Rehabilitate an AI-assisted codebase that has gone sloppy — audit the slop, fix the map the agent reads, put the rules file on a diet, convert prose into enforced checks, pay down the worst debt behind characterization tests, and close the loop so it stays clean.
disable-model-invocation: true
---

# Rehab

An AI-heavy repo does not rot because the model is careless. It rots because nothing in the
loop can say no. The doom loop: sloppy codebase → the agent copies the slop → the tired human
approves the diff → sloppier codebase. Rehab is the deliberate interruption of that loop. It
runs on one law:

**Enforce, don't instruct.** Instructions are not verification. Prose is advisory. A failing
check, fed back into the agent's own loop, is binding. If the model knew what good code
looks like, it would have written it. More exhortation is not the cure. More verification is.

"The AI does not listen" is mechanistic. Each mechanism is a stage below:

- **The map lies.** The orienting docs (CLAUDE.md, README, architecture notes) drifted. The
  agent navigates a repo that no longer exists.
- **The rules file is over budget.** Models follow approximately 150–200 discrete
  instructions. Compliance degrades *uniformly* as rules accumulate. Each rule that you add
  weakens all the others. To prune is a functional change, not housekeeping.
- **The codebase out-shouts the docs.** The agent copies what it reads, so consistency
  heals itself and inconsistency compounds. The worst module is an instruction too.

Run the stages in order for a full rehab. Or enter at one stage when the user asks for only
that slice. The findings of stage 1 drive everything after it. Each later stage names what it
consumes. The symptom → check catalog is in [symptoms.md](symptoms.md). Read it when stage 1
or stage 4 runs.

Each stage lands on its own branch and PR off main. Never commit a rehab stage straight to
main; the user reviews the map, the diet, and the law like any other change. A check script
the rehab writes is a public surface: it gets a header that states what it checks and where
it runs, and a one-line *why* on each rule that is not obvious. Rehab is a repo-wide pass; a
single-PR cleanup is not rehab.

## 1. Triage

Diagnose before you treat. Read the repo: code, configuration, CI, and git log. Divide what
*exists* from what *runs*. A lint script that nothing executes is decoration. A suppression
comment in a directory that the linter ignores is a dead ritual. A rules file that nobody
prunes is a scar log.

Baseline the numbers, so that the paydown is measurable: duplication (jscpd, dupl), unused
exports and files (knip, deadcode), file and function size outliers, suppression counts and
the quality of their justifications, and tests against LOC per package. Read the git log for
fix-spam. N consecutive one-line fixes to one subsystem is a missing test at that seam, not
bad luck. Score the enforcement of each package against its blast radius. The shared contract
that three repos consume needs the *most* CI, not the least.

Name what is healthy with the same rigor as what is sick. Rehab that tramples working rituals
— clean PR descriptions, a lockstep release habit, a good rules file — costs more trust than
it recovers. The healthy tissue is where the golden examples come from.

**Done when** you can present all of these:

- For each package, what runs on push.
- The baseline metrics.
- Each orienting doc and rules file, with a staleness verdict.
- The three worst offenders, named with evidence.
- The protect list — what works and must survive the rehab.

## 2. Fix the map

This move has the most leverage, and it touches no source code. Verify each structural claim
in each doc that an agent reads as truth — package counts, stack lists, layout blocks, export
targets, architecture diagrams, "the API is X" — against the tree. A hand-written claim about
repo shape has exactly three futures: **generated** from the source of truth, **asserted** by
a test that fails when the claim drifts, or **deleted**. If a doc admits its own staleness,
delete it. Do not annotate it. An annotation teaches the next reader that stale is
acceptable.

Sweep the plan graveyard: completed plans written in the present tense, agent scratch
promoted to tracked files, and audits that look like live specs. A committed plan carries a
status header, or you delete it. Scratch goes to a gitignored directory. A repo-level fork
(`thing.old/`, a second checkout as a long-lived branch) becomes a branch, or you delete it.

The tracker is a map too, and agents read it. Apply the same three futures to process. If the
data shows that a ritual does not run (cycles that complete nothing, milestones long past
target, statuses frozen in flight), run the ritual honestly or delete it — **no silent
theater**. If effort diverged from the stated strategy, that is a pivot that nobody recorded.
Capture the decision in one short status update, or present it as a decision that the owner
must make now.

**Done when** all of these hold:

- Each claim in each orienting doc is verified-true, generated, or asserted.
- Each committed plan has a status.
- No fork of a repo lives beside it.
- The rituals of the tracker show reality or are gone.

## 3. Instruction diet

Prune the rules file *before* you add anything. A bloated CLAUDE.md weakens each rule in it.
Delete: what a reader can derive from the code, what a tool already enforces, what is
task-specific rather than universal, and the hotfix lines that accreted one per annoyance.
Target approximately 300 words.

Give shape to what survives: three tiers (*always* / *ask first* / *never*, with one line of
why each), concrete examples over descriptive paragraphs, and `file:line` pointers to the
authoritative implementation instead of inline copies that go stale. Apply the escalation
rule: each "never do X" that stays in prose is a ticket to make X mechanically impossible.
Send it to stage 4.

**Done when** the rules file is ≤300 words, each line is universal and cannot be a check, and
each deleted prohibition became a stage-4 check or died on its merits.

## 4. Law

Convert conventions into checks that the agent cannot ignore. Floor first: each repo runs
lint + typecheck + test in CI from day one. Enforcement scales with fan-out, not LOC. Then
map each symptom from triage to the check that kills it (the table is in
[symptoms.md](symptoms.md)): size caps for god files, no-empty-catch for defensive spam,
unused-export gates for speculative surface, and justified-suppression rules so that each
opt-out carries a reason.

Two properties make law bind instead of decorate. **It runs inside the agent's loop:** a
hook lints the agent's own edit and puts the failure back in its context. Then the model
corrects itself instead of shipping. Checks run in seconds locally, not only in a 20-minute
CI. **It ratchets:** duplication and dead-export counts gate at the baseline of today and
only move down. Suppression opt-outs are capped and carry a tracking reference. Then a size
budget cannot quietly become paperwork.

**Done when** an edit that breaks a rule fails inside the agent's own loop before commit, no
repo lacks the floor, and the ratchets are live at baseline.

## 5. Paydown

Only now touch the debt. With law in place, cleaned code stays clean. The hard gate:
**characterization tests before any structural change**. The dominant AI risk is silent
behavioral drift, not compile errors. Pin the current behavior, quirks included. Predict in
chat what the code must do before you write the pin. Never trust the existing tests of the
module as the pin. The agent wrote them.

Work the worst offenders from triage in dependency order, leaves first. Size each batch to
one reviewable PR. Give each batch a verifier that the fixer cannot edit. Keep the diffs
narrow: one function, one file, one boundary. Strangler-fig each module whose surface is
defensible but whose interior is not. Target the deep-module shape: narrow interface,
substantial implementation. That is the opposite of the shallow pass-through layers that
agents accrete. Plant one **golden example** per recurring pattern (the canonical module, the
canonical test, the canonical error path). The agent copies what it reads, so make the best
file the template. Done means verified through real seams: tests green *and* logs clean *and*
the workflow exercised — not the claim "should work now."

**Done when** each worst offender is pinned, reshaped, or explicitly deferred with a named
reason, each baseline metric moved, and the ratchets held.

## 6. Hold the line

Close the loop that rehab opened. Each anti-pattern caught in review becomes a check the same
day, or it recurs. That is the escalation rule as a standing habit. It keeps the scar log
from regrowth. The map keeps an owner: structural doc claims stay generated or asserted.
Re-run the triage numbers on a cadence. When the rules file grows, that is a diet trigger,
not progress.

**Done when** recurrence has a standing path into law, and the next rehab will find nothing
new. The loop rejects what must not go in.
