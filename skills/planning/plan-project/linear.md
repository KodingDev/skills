# Shaping for Linear

Render the backlog into Linear's model. Linear's opinion is that work flows continuously, not in
rigid sprints — lean into it rather than forcing Jira habits across.

## Hierarchy mapping

| plan-project | Linear | Notes |
|---|---|---|
| Initiative | **Initiative** | Workspace-level; a manually-curated list of **Projects** with a doc. Rolls up each project's health. (Sub-initiatives nest, but that's Enterprise-only.) |
| Epic | **Project**, or a **parent issue** | A Project for a real deliverable with a target date; a parent issue when it's lighter. |
| Story | **Issue** | One per team. |
| Sub-task | **Sub-issue** | Breaks a parent into pieces. |

Issues belong to exactly one **Team**; Projects can span teams. **Project Milestones** mark
stages within a project — the natural home for the Stage-3 milestones.

## Dependencies

Relation types: **blocks / blocked by**, related, duplicate (orange flag for blocked-by, red for
blocks). Emit `blocked by` for every blocker, plus the prose why-first line — see `sequencing.md`
for why both.

## Cycles

Time-boxed, auto-repeating per team. Configurable cadence, optional **cooldown** (a break for
tech-debt/planning — **no issues live in a cooldown**), **auto-add** of started issues, and
**automatic rollover** of unfinished issues to the next cycle (you can't pin them to a closed
one). Map Stage-3 cadence work here.

## States & Triage

State **categories**: **Backlog / Unstarted / Started / Completed / Canceled** (plus a reserved
**Duplicate**), with custom statuses per team inside each. **Triage** is a *separate* opt-in
per-team category — an inbox where integration- and outsider-filed issues land for **Accept /
Mark duplicate / Decline / Snooze**, with optional rotating triage responsibility. Reach for it
when intake is noisy.

## Estimates

Optional, per team: **Exponential / Fibonacci / Linear / T-shirt**. Off by default (analytics
then count 1 point/issue). Don't impose an estimate scale on a team that sizes by issue count —
that's a valid Linear choice.

## Labels

Flat labels, or **label groups** (one label per group applies at a time — mutually exclusive).
Workspace labels vs team labels. Keep the set small and meaningful; a `Needs decision` label is a
clean way to surface parked Stage-0 contradictions.

## Calibrating to an existing workspace

Read how the team already works and match their *sound* conventions — don't impose ceremony
they've rejected, but don't mirror an anti-pattern either. A real observed setup, and how to
calibrate to it:

- **Project is the top unit** (no initiatives) — shape epics as Projects; skip the initiative
  layer until projects need a roll-up.
- **Epic = a parent issue with sub-issues, ~2 levels deep**; not every epic needs a Project.
- **2-week cycles; milestones carry the planning weight** — lead with milestones.
- **No estimates — scope is issue count**; size in prose, don't add points.
- **Dependencies as `related` + prose "why first"**, not typed blocks — so always write the prose.
- **Issues read like mini-PRDs**: a metric-backed `## Why`, a `## Scope`, a checkbox
  `## Acceptance criteria` — this *is* the Stage-2 bar; match it exactly.

One convention to **correct, not copy**: a milestone used as a cross-project `R1…R4` release
train fights Linear's model — milestones live inside a single project and can't be shared. Honor
the intent (a dated release cadence) the right way — model each release as a **Project under an
Initiative**, and keep milestones for true in-project stages (alpha → beta → launch).

Teach the other unused features as **optional upgrades**, never scolding: typed `blocked by`
(when prose sequencing gets lossy), estimates (when they want velocity), Triage (when intake gets
noisy). Offer; don't impose.

## The Linear Method

Linear's published method (linear.app/method) is worth honoring; its throughline is *create
momentum — don't sprint · aim for clarity · decide and move on*. Two practices bear directly on
this skill: **"Write issues, not user stories"** (concrete, scoped issues over ceremony-laden
story templates) and **"Scope projects down"** (smaller, shippable projects over epics that never
close).

## Done — checklist

- [ ] Hierarchy matches the workspace: Project-as-epic where they skip initiatives; sub-issues for children.
- [ ] Every blocker emitted as `blocked by` **and** a prose why-first line.
- [ ] Milestones model in-project stages; a cross-project release cadence → Projects under an Initiative. Cadence → cycles.
- [ ] Estimates only if the team uses them; otherwise size by issue count.
- [ ] Issues match the team's mini-PRD bar (Why / Scope / checkbox criteria).
- [ ] Unused features offered as optional upgrades, not imposed.
