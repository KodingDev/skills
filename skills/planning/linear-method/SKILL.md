---
name: linear-method
description: The Linear Method — momentum-first product practice: initiatives and goals, enablers vs blockers, projects scoped to 1–3 weeks, issues instead of user stories, n-week cycles, launch and keep launching. Use when setting product direction or goals, prioritizing a roadmap, scoping a project, writing issues or a project spec, planning cycles or a backlog, running a design project, or planning a launch or changelog — and when another skill needs these conventions.
---

# Linear Method

The practices that Linear built its own product and company on, published at
[linear.app/method](https://linear.app/method). It is not a framework with ceremonies to
adopt. It is a set of defaults, written by a small team that optimizes for one thing. It
reads as opinionated because it was earned, not designed.

Apply the rules. Explain the mechanism when the mechanism changes a decision.

## What it optimizes for

**Momentum.** Not velocity, not utilization, not predictability. Momentum is the ability of
the team to make visible progress each day, and to continue for years.

That single choice generates everything else. Small projects exist because short timelines
*force* prioritization. Issues replace user stories because translation layers cost days and
buy nothing. Launches repeat because one dated moment concentrates all the risk into one bet.
Cycles have a fixed length because a routine makes progress sustainable, not heroic.

The load-bearing claim: *startups rarely die because they made too much progress or because
of a single bad decision, but they do die when they move too slow or give up.* If that is not
the failure mode that you face — a regulated domain, a safety-critical system, a large org
where coordination cost dominates — then the tradeoffs of this method aim somewhere else. Say
so. Do not apply it anyway.

## Principles

Each principle is a rule plus the mechanism that makes it work.

- **Create momentum — don't sprint.** Find a cadence and a routine of work. A sprint implies
  a rest after it. There is no rest. Cadence is what a team can hold indefinitely.
- **Meaningful direction.** Even when the day is full of small tasks, each person must be
  able to name the long-term goal that their task serves. Context lets people make good calls
  unsupervised.
- **Decide and move on.** There is not always a best answer. Sometimes the most valuable
  output *is* the decision. Deliberation is worth its cost only when the decision is hard to
  reverse. So build things that you can revert. Then the cost of a fast decision drops to
  almost zero.
- **Aim for clarity.** Do not invent terms. They confuse, and they mean different things on
  different teams. Use the vocabulary of the method — initiative, project, cycle, issue,
  changelog — instead of synonyms for them.
- **Say no to busy work.** A tool must work for you, not make you its designer and
  maintainer. A ritual that feeds the tracker rather than the product is overhead in a
  process costume. Delete it.
- **Build for the creators / purpose-built / simple first, then powerful.** Three tests for
  tooling. It serves the people who make the thing, not the people who report on it. It is
  designed for this job, not configurable into any job. It starts simple and grows powerful
  at scale.

## Branches

Read the file for the work in hand — not both.

- To shape **what** to build — initiatives, goals, prioritization, project scope, specs,
  backlog — read [`direction.md`](direction.md).
- To **do** the work — cycles, issues, design projects, user feedback, launches, changelog —
  read [`building.md`](building.md).

## What the method rejects

Name these when you see them, with the reason. Each has a replacement in the branch files.

- **User stories.** A translation layer from an era when customers could not state
  requirements and teams did not know their users. Both premises expired. The ritual outlived
  them.
- **The big launch.** One dated moment needs long preparation and concentrates all the risk.
  If it misses, the whole effort is wasted.
- **The unbounded project.** A project that cannot ship in 1–3 weeks with 1–3 people is
  unscoped. At early stages it is also an expensive guess, because you cannot predict impact
  yet.
- **The graveyard backlog.** Its cost is not storage. Its cost is that nobody can plan a
  cycle from it.
- **Invented terminology.** New words for existing concepts tax each later conversation.
- **Progress theatre.** Percentages and points instead of the diff in the code or the design
  file.
- **Paralysis under uncertainty.** Missing information is a prompt to act small and learn,
  not to wait for clarity that only feedback brings.

## Grade

The work meets the method when **every** applicable item holds:

- [ ] Each project traces to a named initiative or goal. Each issue traces to a project.
- [ ] Each project and each issue has one named owner.
- [ ] Each project ships in 1–3 weeks with 1–3 people, or is broken into stages that do.
- [ ] Each priority call is stated as enabler or blocker, with a now-or-later answer.
- [ ] No issue is written as a user story. Each issue names a task with a defined outcome.
- [ ] Shipped work is the evidence of progress — a diff, a design file, a live change — not a
      status.
- [ ] Feature work and quality work mix in the same cycle. They do not queue behind each
      other.
