# Shaping for Linear

Render the backlog into Linear's model. Linear's position is that work flows continuously, not in rigid sprints. Work with that model. Do not force Jira habits onto it.

## Hierarchy mapping

| plan-project | Linear | Notes |
|---|---|---|
| Initiative | **Initiative** | Workspace-level: a hand-curated list of **Projects** with a doc. It rolls up the health of each project. Sub-initiatives can nest, on Enterprise only. |
| Epic | **Project**, or a **parent issue** | A Project for a real deliverable with a target date. A parent issue for lighter work. |
| Story | **Issue** | One per team. |
| Sub-task | **Sub-issue** | Breaks a parent into pieces. |

Each issue belongs to exactly one **Team**. A Project can span teams. **Project Milestones** mark stages inside a project. They are the natural home for the Stage 3 milestones.

## Dependencies

Relation types: **blocks / blocked by**, related, and duplicate. An orange flag marks blocked-by, and a red flag marks blocks. Emit `blocked by` for every blocker, plus the prose why-first line. `sequencing.md` explains why you emit both.

## Cycles

Cycles are time-boxed and repeat automatically per team. They have:

- A configurable cadence.
- An optional **cooldown**: a break for tech debt or planning. **No issues live in a cooldown.**
- **Auto-add** of started issues.
- **Automatic rollover** of unfinished issues to the next cycle. You cannot pin them to a closed cycle.

Map the Stage 3 cadence work here.

## States and Triage

State **categories**: **Backlog / Unstarted / Started / Completed / Canceled**, plus a reserved **Duplicate**. Each team has custom statuses inside each category. **Triage** is a *separate*, opt-in category per team. It is an inbox for issues from integrations and outsiders. Each issue there gets **Accept / Mark duplicate / Decline / Snooze**. Triage responsibility can rotate. Use Triage when intake is noisy.

## Estimates

Optional, per team: **Exponential / Fibonacci / Linear / T-shirt**. Estimates are off by default, and analytics then count 1 point per issue. If a team sizes by issue count, do not impose an estimate scale. Issue count is a valid Linear choice.

## Labels

Use flat labels or **label groups**. In a label group, only one label applies at a time. Labels exist at workspace level and at team level. Keep the set small and meaningful. A `Needs decision` label is a clean way to surface the parked Stage 0 contradictions.

## Calibrating to an existing workspace

Read how the team works, and match its *sound* conventions. Do not impose ceremony that the team rejected. Do not copy an anti-pattern either. A real observed setup, and how to calibrate to it:

- **Project is the top unit** (no initiatives): shape epics as Projects. Skip the initiative layer until projects need a roll-up.
- **Epic = a parent issue with sub-issues, about 2 levels deep**: not every epic needs a Project.
- **2-week cycles, and milestones carry the planning weight**: lead with milestones.
- **No estimates; scope is issue count**: size in prose. Do not add points.
- **Dependencies as `related` plus prose "why first"**, not typed blocks: always write the prose.
- **Issues read like mini-PRDs**: a `## Why` with a metric, a `## Scope`, and a checkbox `## Acceptance criteria`. This *is* the Stage 2 bar. Match it exactly.

One convention to **correct, not copy**: a milestone used as a cross-project `R1...R4` release train works against Linear's model. Milestones live inside one project and cannot be shared. Keep the intent (a dated release cadence), and model it correctly: each release is a **Project under an Initiative**. Keep milestones for real stages inside a project (alpha -> beta -> launch).

Present the other unused features as **optional upgrades**, never as a correction: typed `blocked by` (when prose sequencing loses information), estimates (when the team wants velocity), and Triage (when intake gets noisy). Offer them. Do not impose them.

## The Linear Method

Linear's published method (linear.app/method) deserves respect. Its central idea: *create momentum - don't sprint, aim for clarity, decide and move on*. Two practices apply directly to this skill:

- **"Write issues, not user stories"**: concrete, scoped issues, not story templates full of ceremony.
- **"Scope projects down"**: smaller projects that ship, not epics that never close.

## Done: checklist

- [ ] The hierarchy matches the workspace: Project as epic where the team skips initiatives, and sub-issues for children.
- [ ] Every blocker is emitted as `blocked by` **and** as a prose why-first line.
- [ ] Milestones model stages inside a project. A cross-project release cadence becomes Projects under an Initiative. Cadence becomes cycles.
- [ ] Estimates appear only if the team uses them. Otherwise, size by issue count.
- [ ] Issues match the team's mini-PRD bar (Why / Scope / checkbox criteria).
- [ ] Unused features are offered as optional upgrades, not imposed.
