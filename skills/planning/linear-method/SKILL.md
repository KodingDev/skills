---
name: linear-method
description: The Linear Method — momentum-first product practice: initiatives and goals, enablers vs blockers, projects scoped to 1–3 weeks, issues instead of user stories, n-week cycles, launch and keep launching. Use when setting product direction or goals, prioritizing a roadmap, scoping a project, writing issues or a project spec, planning cycles or a backlog, running a design project, or planning a launch or changelog — and when another skill needs these conventions.
---

# Linear Method

The practices Linear built its own product and company on, published at
[linear.app/method](https://linear.app/method). It is not a framework with ceremonies to adopt —
it's a set of defaults written by a small team optimizing for one thing, and it reads as
opinionated because it was earned rather than designed.

Apply the rules; explain the mechanism when it changes someone's decision.

## What it optimizes for

**Momentum.** Not velocity, not utilization, not predictability — the team's ability to make
visible progress every single day, and to keep making it for years.

That single choice generates everything else. Small projects exist because short timelines *force*
prioritization. Issues replace user stories because translation layers cost days and buy nothing.
Launches repeat because one dated moment concentrates risk into a bet you can't afford to lose.
Cycles have a fixed length because a routine is what makes progress sustainable rather than heroic.

The load-bearing claim: *startups rarely die because they made too much progress or because of a
single bad decision, but they do die when they move too slow or give up.* If that isn't the failure
mode you're facing — a regulated domain, a safety-critical system, a large org where coordination
cost dominates — this method's tradeoffs are aimed somewhere else, and you should say so rather
than apply it anyway.

## Principles

Each is a rule plus the mechanism that makes it work.

- **Create momentum — don't sprint.** Find a cadence and routine of working. A sprint implies a
  rest afterward; there isn't one. Cadence is what a team can hold indefinitely.
- **Meaningful direction.** Even when the day is full of small tasks, everyone should be able to
  name the long-term goal theirs serves. Context is what lets people make good calls unsupervised.
- **Decide and move on.** There isn't always a best answer, and sometimes the most valuable output
  *is* the decision. Deliberation is only worth its cost when the decision is hard to reverse — so
  build things that can be reverted, and the cost of deciding fast drops to near zero.
- **Aim for clarity.** Don't invent terms; they confuse and mean different things on different
  teams. Use the method's own vocabulary — initiative, project, cycle, issue, changelog — instead
  of coining synonyms for them.
- **Say no to busy work.** A tool should work for you, not make you its designer and maintainer.
  Any ritual that exists to feed the tracker rather than the product is overhead wearing a process
  costume — delete it.
- **Build for the creators / purpose-built / simple first, then powerful.** Three tests for
  tooling: does it serve the people making the thing rather than the people reporting on it, is it
  designed for this job rather than configurable into any job, and does it start simple and grow
  powerful as you scale.

## Branches

Read the file for the work in hand — not both.

- Shaping **what** to build — initiatives, goals, prioritization, project scope, specs, backlog:
  read [`direction.md`](direction.md).
- **Doing** the work — cycles, issues, design projects, user feedback, launches, changelog:
  read [`building.md`](building.md).

## What the method rejects

Name these when you see them, with the reason. Each has a replacement in the branch files.

- **User stories.** A translation layer built for an era when customers couldn't state
  requirements and teams didn't know their users. Both premises expired; the ritual outlived them.
- **The big launch.** One dated moment needs long preparation, concentrates all the risk, and
  wastes the whole effort if it misses.
- **The unbounded project.** Anything that can't ship in 1–3 weeks with 1–3 people is unscoped —
  and at early stages it's also an expensive guess, since you can't yet predict impact.
- **The graveyard backlog.** Its cost isn't storage, it's that nobody can plan a cycle from it.
- **Invented terminology.** New words for existing concepts tax every conversation afterward.
- **Progress theatre.** Percentages and points instead of the diff in the code or design file.
- **Paralysis under uncertainty.** Missing information is a prompt to act small and learn, not to
  wait for clarity that only arrives through feedback.

## Grade

The work meets the method when **every** applicable item holds:

- [ ] Each project traces to a named initiative or goal, and each issue to a project.
- [ ] Every project and issue has one named owner.
- [ ] Each project ships in 1–3 weeks with 1–3 people, or is broken into stages that do.
- [ ] Each priority call is stated as enabler or blocker, with a now-or-later answer.
- [ ] No issue is written as a user story; each names a task with a defined outcome.
- [ ] Progress is evidenced by shipped work — a diff, a design file, a live change — not a status.
- [ ] Feature work and quality work are mixed in the same cycle, not queued behind each other.
