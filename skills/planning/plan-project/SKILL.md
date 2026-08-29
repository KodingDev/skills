---
name: plan-project
description: >
  Turn ideas and design docs into a sprint-ready, dependency-linked
  backlog — reconcile intake, break down, write tickets, sequence, assign,
  and shape for Jira or Linear.
disable-model-invocation: true
---

# Plan Project

Take a project from "I have ideas" — plus the design docs, ADRs, or notes that exist — to a
review-ready backlog: reconciled scope, well-formed tickets, a sequence with real
dependencies, owners by capacity, and a shape for the target tracker.

You **produce the artifacts**. The user reviews and redirects. Output is structured markdown,
never a live write to a tracker. When a repo is present, **read the code**. Real slices, real
dependencies, and real ownership beat inference from a description.

This is one pipeline of six stages. Run the stages in order for a full goal→backlog pass. Or
**enter at any stage** when the user asks for only that slice ("break this down", "write this
ticket", "sequence these", "who takes this"). Each stage discloses its craft to a reference
file. Read that file when the stage runs, not before.

## Input contract (entering mid-pipeline)

A stage consumes the artifact of the previous stage. When the user enters directly:

- If the upstream artifact is **present** — pasted, in a file that they point at, or already
  in the conversation — use it as-is.
- If it is **absent**, reconstruct the minimal prerequisite from what exists (the stated goal
  plus the repo). **Mark it `(inferred)`** and proceed. Never stall to demand ceremony. A
  concrete draft that the user corrects beats an interview.
- Never fabricate a roster or capacity (Stage 4). If the roster is missing, fall back to
  role-shaped assignment. Do not invent people.

## Stage 0 — Intake & reconcile

Gather the idea and each design doc, ADR, spec, or note in scope. Read them. Real formats
that you will meet: MADR ADRs (`status / context / options / consequences`), meridian specs
(`Overview / Requirements / …`), handover docs, and freeform brain-dumps.

Reconcile them into one **work-inventory**: a flat list of the actual atoms of work. Across
multiple docs, **dedupe** the overlaps and **surface the contradictions**. Do not pick a side
silently. Park undecided points under a `Needs decision` heading. The inventory is the single
source of truth that the rest of the pipeline reads.

**Done when:** each decision and each work-implying statement in each source doc is an entry
in the work-inventory or an explicit `Needs decision` item. Nothing is dropped. No
contradiction is silently resolved.

## Stage 1 — Break down → read `breakdown.md`

Decompose the work-inventory into `initiative → epic → story`, **MECE** (no overlap, no
gaps). Default to thin **vertical slices**. The first slice of each epic is a **tracer
bullet** that proves the path end-to-end. When a repo is present, ground the slices and the
sizes in the real modules.

**Done when:** each work-inventory entry maps to exactly one vertical-slice leaf (MECE). The
full bar is in `breakdown.md`.

## Stage 2 — Write tickets → read `tickets.md`

Draft each leaf into a ticket at the quality bar: a rationale-backed **Why**, a **Scope**,
and checkbox **Acceptance criteria** that end in a concrete ship gate. Lift thin or
title-only items up to the bar. Do not transcribe them.

**Done when:** no ticket is title-only. Each ticket has a Why, a Scope, and ≥1 checkable
acceptance criterion. The full bar is in `tickets.md`.

## Stage 3 — Sequence → read `sequencing.md`

Build the dependency graph from the breakdown and, when present, the codebase. Find the
**critical path**. Order the work risk-first: enabling work before dependents, independent
slices in parallel, large structural changes last. One slice per PR, never big-bang. Lay the
order onto cycles or sprints and milestones.

**Done when:** each ticket names its blockers (or "none"), and the dependency graph is
acyclic. The full bar is in `sequencing.md`.

## Stage 4 — Assign → read `assigning.md`

Propose owners from the user's roster. When a repo is present, fold in an ownership
signal from the git history. Capacity comes from the user. Flag **bus-factor** risk and obey
WIP limits.

**Done when:** each ticket has a proposed owner or role profile, and no owner exceeds the
capacity that the user gave. The full bar is in `assigning.md`.

## Stage 5 — Shape for the tracker → read `jira.md` or `linear.md`

Render the backlog into the model of the target tracker. **Pick the target:** use the tracker
that the user names. If the user names none, infer the tracker from what is wired to the
repo — a linked Jira or Linear integration, tracker URLs in configuration or docs, the
issue-reference style in recent commits and PRs — and state the inference. If nothing is
wired, ask once. (Key prefixes like `PSY-` do not disambiguate. Jira and Linear both use
`PREFIX-123`.) Read `jira.md` for Jira. Read `linear.md` for Linear. If the tracker is GitHub
Issues, ship the tool-neutral markdown as-is.

**Done when:** the backlog uses the real hierarchy, link model, and estimate convention of
the target. Grade it against the checklist of that file.

## Output

One markdown document, in pipeline order: work-inventory → epic/milestone tree → tickets →
sequence + dependency notes → assignment proposal → tracker-shaped rendering. If you defer,
cap, or leave a dependency unresolved, **say so**. Never let a partial backlog read as
complete.

## Principles

- **Opinionated on craft, flexible on ceremony.** Decisive defaults: vertical slices, INVEST,
  outcome-framed criteria, tracer-bullet first, small WIP. Scrum, Kanban, cycles, and Shape
  Up are ceremony options. Pick by fit. Never force one.
- **The artifact is the teaching.** Make the output good enough that a strong engineer who
  never planned a sprint learns the shape from it. No tutorials. No experience-gating. Each
  "why" is one skimmable line.
- **Ticket ≈ issue.** Jira and Linear both say issues. The user can say tickets. Same thing.
