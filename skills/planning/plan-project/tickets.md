# Tickets

A ticket is a contract. Someone who was not in the room can pick it up and know what "done" means. The bar is **a mini-PRD, not a title**. That bar separates a backlog that an AFK agent can take from one that needs a meeting per item.

## The shape

Every ticket carries these sections. Trim sections that do not apply. Never trim the Why or the criteria.

```
## Why
One or two lines: the user or business reason, with evidence where it exists: a metric
(pageviews, conversion, error rate, $), a user report, a dependency ("unblocks X"). "Why now"
beats "why ever". A ticket whose Why restates its title is not ready.

## Scope
What this slice delivers, as end-to-end behaviour, not a layer-by-layer to-do. When the
codebase is known, name what changes and what explicitly does NOT (the cheapest way to stop
scope creep). Leave out file paths and code snippets: they go stale fast. Exception: a
snippet that encodes a decision (schema, state machine, type shape) that prose cannot state
as precisely. Inline only the part that holds the decision.

## Acceptance criteria
- [ ] Observable, checkable conditions: what is true when this is done
- [ ] Each one phrased so that a tester (or a test) can verify it
- [ ] The last one is a concrete ship gate ("merged to main", "deployed", "live on /x")

## Blocked by
The tickets that must land first, or "None - can start immediately". (Filled in Stage 3.)
```

For work in flight, add a `## State` line: the PR number, the commit or diff size, and what is done and what is left. Then a reader knows where it stands without the branch.

## Acceptance criteria: the craft

Criteria are **outcomes, not tasks**. "User sees an error toast when the upload fails" is checkable. "Add error handling" is not. Use **Given/When/Then** only where a condition -> action -> result needs spelling out. Elsewhere, a plain checkbox is shorter and clearer. Each criterion must be **falsifiable**. If you cannot write the test that fails when it breaks, it is too vague.

## Ticket types

Same shape, different emphasis:

- **Story**: a user-facing slice. Why = user value. Criteria = observable behaviour.
- **Bug**: Why states impact and frequency. Scope becomes **steps to reproduce** plus **expected vs actual**. Criteria = the repro no longer reproduces, plus a regression test.
- **Spike**: a timeboxed question. Scope = the question and the decision it unblocks. The acceptance criterion is **a documented decision**, not code. Cap the time.
- **Task / chore**: work that is not user-facing (infra, tooling, deps). Why = the engineering payoff: it unblocks, removes risk, or cuts toil. Criteria stay observable.

## Definition of Ready / Done

A ticket is **Ready** to start when it passes INVEST and this shape is filled: Why, bounded Scope, falsifiable criteria, and known blockers. If it is not ready, spike it or break it down again.

A ticket is **Done** when every acceptance criterion is checked, tests cover the new behaviour, and the ship gate is met. "It works on my machine" is not a criterion.

## Lift, do not transcribe

Reactive tickets arrive thin: a title, a shout, two words. **Lift them to the bar**. Do not copy them across. The gap between a floor ticket and a real one is the teaching.

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

The "after" adds three things that the "before" lacked: a Why with impact, a bounded Scope with an explicit *not*, and falsifiable criteria that end in a ship gate.

## Done: checklist

- [ ] Every ticket has a Why with a reason or a metric, never the title restated.
- [ ] Scope states end-to-end behaviour, with an explicit *not* where the codebase is known.
- [ ] Acceptance criteria are falsifiable outcomes, at least one per ticket, and the last one is a ship gate.
- [ ] Bugs carry a repro plus expected and actual. Spikes deliver a decision, not code.
- [ ] No title-only ticket remains. Thin inputs were lifted, not transcribed.
- [ ] No stale file paths or code dumps. Snippets that encode a decision are the exception.
