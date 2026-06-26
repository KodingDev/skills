---
name: plan-project
description: Turn ideas and design docs into a sprint-ready, dependency-linked backlog — reconcile intake, break down, write tickets, sequence, assign, and shape for Jira or Linear.
disable-model-invocation: true
---

# Plan Project

Take a project from "I have ideas" — plus whatever design docs, ADRs, or notes exist — to a
review-ready backlog: reconciled scope, well-formed tickets, sequenced with real dependencies,
assigned by capacity, shaped for the target tracker.

You **produce the artifacts**; the user reviews and redirects. Output is structured markdown,
never a live write to any tracker. When a repo is present, **read the code** — real slices,
real dependencies, and real ownership beat anything inferred from a description.

This is one pipeline of six stages. Run them in order for a full goal→backlog pass, or **enter
at any stage** when the user asks for just that slice ("break this down", "write this ticket",
"sequence these", "who takes this"). Each stage discloses its craft to a reference file — read
it when that stage runs, not before.

## Input contract (entering mid-pipeline)

A stage consumes the previous stage's artifact. When the user enters directly:

- If the upstream artifact is **present** — pasted, in a file they point at, or already in the
  conversation — use it as-is.
- If it is **absent**, reconstruct the minimal prerequisite from what exists (the stated goal +
  the repo), **mark it `(inferred)`**, and proceed. Never stall to demand ceremony; a concrete
  draft the user corrects beats an interview.
- Never fabricate a roster or capacity (Stage 4). A missing roster falls back to role-shaped
  assignment, not invented people.

## Stage 0 — Intake & reconcile

Gather the idea and every design doc, ADR, spec, or note in scope. Read them. Real formats you
will meet: MADR ADRs (`status / context / options / consequences`), meridian specs
(`Overview / Requirements / …`), handover docs, freeform brain-dumps.

Reconcile them into one **work-inventory** — a flat list of the actual atoms of work. Across
multiple docs, **dedupe** overlaps and **surface contradictions** rather than silently picking a
side; park genuinely-undecided points under a `Needs decision` heading. The inventory is the
single source of truth the rest of the pipeline reads.

**Done when:** every decision and work-implying statement in every source doc is either an entry
in the work-inventory or an explicit `Needs decision` item — nothing dropped, no contradiction
silently resolved.

## Stage 1 — Break down → read `breakdown.md`

Decompose the work-inventory into `initiative → epic → story`, **MECE** (no overlap, no gaps).
Default to thin **vertical slices**; the first slice of each epic is a **tracer bullet** that
proves the path end-to-end. When a repo is present, ground slices and sizes in the real modules.

**Done when:** every work-inventory entry maps to exactly one vertical-slice leaf (MECE). Full
bar in `breakdown.md`.

## Stage 2 — Write tickets → read `tickets.md`

Draft each leaf into a ticket at the quality bar: a rationale-backed **Why**, a **Scope**, and a
checkbox **Acceptance criteria** ending in a concrete ship gate. Lift thin/title-only items up to
the bar rather than transcribing them.

**Done when:** no ticket is title-only — each has a Why, a Scope, and ≥1 checkable acceptance
criterion. Full bar in `tickets.md`.

## Stage 3 — Sequence → read `sequencing.md`

Build the dependency graph (from the breakdown and, when present, the codebase), find the
**critical path**, and order the work risk-first: enabling work before dependents, independent
slices in parallel, large structural changes last — one slice per PR, never big-bang. Lay the
order onto cycles/sprints and milestones.

**Done when:** every ticket's blockers are named (or "none") and the dependency graph is acyclic.
Full bar in `sequencing.md`.

## Stage 4 — Assign → read `assigning.md`

Propose owners from the user's roster, folding in a git-history ownership signal when a repo is
present. Capacity comes from the user. Flag **bus-factor** risk and respect WIP limits.

**Done when:** every ticket has a proposed owner or role profile, and no owner exceeds the
capacity the user gave. Full bar in `assigning.md`.

## Stage 5 — Shape for the tracker → read `jira.md` or `linear.md`

Render the backlog into the target tracker's model. **Pick the target:** use the tracker the user
names; else infer from what's actually wired to the repo — a linked Jira or Linear integration,
tracker URLs in config/docs, the issue-reference style in recent commits and PRs — and state the
inference; else ask once. (Key prefixes like `PSY-` don't disambiguate: Jira and Linear both use
`PREFIX-123`.) Read `jira.md` for Jira, `linear.md` for Linear. If the tracker is GitHub Issues,
the tool-neutral markdown ships as-is.

**Done when:** the backlog uses the target's real hierarchy, link/dependency model, and estimate
convention — gradable against that file's checklist.

## Output

One markdown document, in pipeline order: work-inventory → epic/milestone tree → tickets →
sequence + dependency notes → assignment proposal → tracker-shaped rendering. If you defer, cap,
or leave a dependency unresolved, **say so** — never let a partial backlog read as complete.

## Principles

- **Opinionated on craft, flexible on ceremony.** Decisive defaults (vertical slices, INVEST,
  outcome-framed criteria, tracer-bullet first, small WIP). Scrum / Kanban / cycles / Shape Up
  are ceremony options, chosen by fit — never forced.
- **The artifact is the teaching.** Output good enough that a strong engineer who has never
  planned a sprint learns the shape by reading it. No tutorials, no experience-gating; any "why"
  is one skimmable line.
- **Ticket ≈ issue.** Jira and Linear both call them issues; the user may say tickets. Same thing.
