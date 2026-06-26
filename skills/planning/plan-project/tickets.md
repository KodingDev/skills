# Tickets

A ticket is a contract: enough that someone who wasn't in the room can pick it up and know what
"done" means. The bar is **a mini-PRD, not a title** — the difference between a backlog you can
hand to an AFK agent and one that needs a meeting per item.

## The shape

Every ticket carries these. Trim sections that don't apply; never trim the Why or the criteria.

```
## Why
One or two lines: the user/business reason, backed by evidence where it exists — a metric
(pageviews, conversion, error rate, $), a user report, a dependency ("unblocks X"). "Why now"
beats "why ever". A ticket whose Why is just its title restated isn't ready.

## Scope
What this slice delivers, as end-to-end behaviour — not a layer-by-layer to-do. When the
codebase is known, name what changes vs what explicitly does NOT (the cheapest way to stop
scope creep). Avoid file paths and code snippets — they go stale fast. Exception: a
decision-encoding snippet (schema, state machine, type shape) that prose can't capture as
precisely — inline just the decision-rich bit.

## Acceptance criteria
- [ ] Observable, checkable conditions — what's true when this is done
- [ ] Phrased so a tester (or a test) can verify each one
- [ ] The last one is a concrete ship gate ("merged to main", "deployed", "live on /x")

## Blocked by
The tickets that must land first, or "None — can start immediately". (Filled in Stage 3.)
```

For in-flight work, add a `## State` line — PR #, commit/diff size, what's done vs left — so a
reader knows where it stands without opening the branch.

## Acceptance criteria — the craft

Criteria are **outcomes, not tasks**. "User sees an error toast when the upload fails" is
checkable; "add error handling" is not. Use **Given/When/Then** only where a condition→action→
result genuinely needs spelling out; elsewhere a plain checkbox is leaner and clearer. Each
criterion must be **falsifiable** — if you can't write the test that fails when it's broken, it's
too vague.

## Ticket types

Same shape, different emphasis:

- **Story** — a user-facing slice. Why = user value; criteria = observable behaviour.
- **Bug** — Why states impact + frequency; Scope becomes **steps to reproduce** + **expected vs
  actual**; criteria = the repro no longer reproduces, plus a regression test.
- **Spike** — a timeboxed question. Scope = the question and what decision it unblocks; the
  acceptance criterion is **a documented decision**, not code. Cap the time.
- **Task / chore** — non-user-facing (infra, tooling, deps). Why = the engineering payoff
  (unblocks, removes risk, cuts toil); criteria still observable.

## Definition of Ready / Done

A ticket is **Ready** to start when it passes INVEST and this shape is filled — Why, bounded
Scope, falsifiable criteria, known blockers. Not ready → spike it or break it down again.

A ticket is **Done** when every acceptance criterion is checked, tests cover the new behaviour,
and the ship gate is met. "It works on my machine" is not a criterion.

## Lift, don't transcribe

Reactive tickets arrive thin — a title, a shout, two words. Your job is to **lift them to the
bar**, not copy them across. The gap between a floor ticket and a real one is the teaching.

```
Before (the floor):
  Title: "Fix hero weapons"
  Body:  "Loki, Rocket"

After (the bar):
  Title: Hero weapons mispositioned / missing for Loki and Rocket

  ## Why
  Weapons render detached or invisible on two of the most-viewed heroes, making the model
  viewer look broken on high-traffic pages.

  ## Scope
  Correct weapon attachment for Loki and Rocket in the model viewer. Covers weapon transform +
  load path; does NOT touch other heroes' rigs or the emote system.

  ## Steps to reproduce
  1. Open the model viewer for Loki, then Rocket.
  Expected: weapon attached in-hand. Actual: Loki's floats; Rocket's doesn't load.

  ## Acceptance criteria
  - [ ] Loki's and Rocket's weapons render attached and correctly positioned
  - [ ] A spot-check of three other heroes confirms no regression
  - [ ] Regression test covers weapon-attachment for at least one affected hero
  - [ ] Merged to main
```

The "after" took three things the "before" lacked: a Why with impact, a bounded Scope with an
explicit *not*, and falsifiable criteria ending in a ship gate.

## Done — checklist

- [ ] Every ticket has a Why backed by reason or metric — never the title restated.
- [ ] Scope states end-to-end behaviour; an explicit *not* where the codebase is known.
- [ ] Acceptance criteria are outcomes, falsifiable, ≥1 each, last one a ship gate.
- [ ] Bugs carry repro + expected/actual; spikes deliver a decision, not code.
- [ ] No title-only tickets survive; thin inputs were lifted, not transcribed.
- [ ] No stale file paths or code dumps (decision-encoding snippets excepted).
