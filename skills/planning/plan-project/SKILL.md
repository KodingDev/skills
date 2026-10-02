---
name: plan-project
description: >
  Turn ideas and design docs into a sprint-ready backlog with dependency
  links: reconcile intake, break down, write tickets, sequence, assign, and
  shape for Jira or Linear.
disable-model-invocation: true
---

# Plan Project

Take a project from "I have ideas", plus its design docs, ADRs, or notes, to a backlog that is ready for review. The backlog has reconciled scope, well-formed tickets, a sequence with real dependencies, owners by capacity, and a shape for the target tracker.

You **produce the artifacts**. The user reviews and redirects. Output is structured markdown, never a live write to a tracker. When a repo is present, **read the code**. Real slices, real dependencies, and real ownership are better than inference from a description.

The pipeline has six stages. For a full pass from goal to backlog, run the stages in order. When the user asks for only one slice ("break this down", "write this ticket", "sequence these", "who takes this"), **enter at that stage**. Each stage keeps its craft in a reference file. Read that file when the stage runs, not before.

## Input contract (entering mid-pipeline)

A stage consumes the artifact of the previous stage. When the user enters directly:

- If the upstream artifact is **present** (pasted, in a file that they point at, or already in the conversation), use it as-is.
- If it is **absent**, reconstruct the minimal prerequisite from what exists: the stated goal plus the repo. **Mark it `(inferred)`** and continue. Never stall to demand ceremony. A concrete draft that the user corrects is better than an interview.
- Never fabricate a roster or capacity (Stage 4). If the roster is missing, use role-shaped assignment. Do not invent people.

## Stage 0 - Intake and reconcile

Gather the idea and each design doc, ADR, spec, or note in scope. Read them. Real formats that you will meet: MADR ADRs (`status / context / options / consequences`), feature specs (`Overview / Requirements / ...`), handover docs, and freeform brain-dumps.

Reconcile them into one **work-inventory**: a flat list of the actual atoms of work. Across multiple docs, **dedupe** the overlaps and **surface the contradictions**. Do not pick a side silently. Put undecided points under a `Needs decision` heading. The inventory is the one source of truth that the rest of the pipeline reads.

**Done when:** each decision and each statement that implies work, in each source doc, is an entry in the work-inventory or an explicit `Needs decision` item. Nothing is dropped. No contradiction is resolved silently.

## Stage 1 - Break down -> read `breakdown.md`

Decompose the work-inventory into `initiative -> epic -> story`, **MECE** (no overlap, no gaps). Default to thin **vertical slices**. The first slice of each epic is a **tracer bullet** that proves the path end-to-end. When a repo is present, ground the slices and the sizes in the real modules.

**Done when:** each work-inventory entry maps to exactly one vertical-slice leaf (MECE). The full bar is in `breakdown.md`.

## Stage 2 - Write tickets -> read `tickets.md`

Write each leaf as a ticket at the quality bar: a **Why** with a reason, a **Scope**, and checkbox **Acceptance criteria** that end in a concrete ship gate. Lift thin or title-only items up to the bar. Do not transcribe them.

**Done when:** no ticket is title-only. Each ticket has a Why, a Scope, and at least one checkable acceptance criterion. The full bar is in `tickets.md`.

## Stage 3 - Sequence -> read `sequencing.md`

Build the dependency graph from the breakdown and, when present, the codebase. Find the **critical path**. Order the work risk-first: enabling work before dependents, independent slices in parallel, large structural changes last. Use one slice per PR, never big-bang. Put the order onto cycles or sprints and milestones.

**Done when:** each ticket names its blockers (or "none"), and the dependency graph is acyclic. The full bar is in `sequencing.md`.

## Stage 4 - Assign -> read `assigning.md`

Propose owners from the user's roster. When a repo is present, add an ownership signal from the git history. Capacity comes from the user. Flag **bus-factor** risk and obey WIP limits.

**Done when:** each ticket has a proposed owner or role profile, and no owner exceeds the capacity that the user gave. The full bar is in `assigning.md`.

## Stage 5 - Shape for the tracker -> read `jira.md` or `linear.md`

Render the backlog into the model of the target tracker. **Pick the target:**

- Use the tracker that the user names.
- If the user names none, infer it from what the repo connects to: a linked Jira or Linear integration, tracker URLs in configuration or docs, or the issue-reference style in recent commits and PRs. State the inference.
- If the repo connects to no tracker, ask once.

Key prefixes like `PSY-` do not identify the tracker: Jira and Linear both use `PREFIX-123`. For Jira, read `jira.md`. For Linear, read `linear.md`. If the tracker is GitHub Issues, ship the tool-neutral markdown as-is.

**Done when:** the backlog uses the real hierarchy, link model, and estimate convention of the target. Grade it against the checklist of that file.

## Output

One markdown document, in pipeline order: work-inventory -> epic and milestone tree -> tickets -> sequence and dependency notes -> assignment proposal -> tracker-shaped rendering. If you defer, cap, or leave a dependency unresolved, **say so**. A partial backlog must never read as complete.

## Principles

- **Opinionated on craft, flexible on ceremony.** The defaults are vertical slices, INVEST, outcome-framed criteria, tracer bullet first, and small WIP. Scrum, Kanban, cycles, and Shape Up are ceremony options. Pick by fit. Never force one.
- **The artifact is the teaching.** Make the output good enough that a strong engineer who never planned a sprint learns the shape from it. No tutorials. No experience-gating. Each "why" is one short line.
- **Ticket = issue.** Jira and Linear both say issues. The user can say tickets. They are the same thing.
