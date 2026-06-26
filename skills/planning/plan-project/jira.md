# Shaping for Jira

Render the backlog into Jira's model. Jira is the primary target here — it's where most
delivery teams (and AWS ProServe engagements) actually live.

First, know which **project type** you're shaping for, because it changes what exists:

- **Company-managed** — shared, admin-governed config. Has Components, custom hierarchy levels
  above Epic, workflow schemes. The default for larger orgs and most ProServe work.
- **Team-managed** — self-contained per project. Sprints/releases are opt-in toggles; **no
  Components**, **no custom levels above Epic**.

> Terminology: Atlassian is rolling out new names (issue → **work item**, project → **space**,
> issue type → **work type**). The classic terms still work everywhere, including JQL. This file
> uses the classic terms; both resolve.

## Hierarchy mapping

| plan-project | Jira | Notes |
|---|---|---|
| Initiative | **Initiative** (or custom level) | A level **above Epic**. Premium/Enterprise + **company-managed only**; added via Settings → Work type hierarchy. Skip on Standard/team-managed. |
| Epic | **Epic** (level 1) | The top built-in level. Always available. |
| Story | **Story / Task / Bug** (level 0) | Story = user-facing, Task = other work, Bug = defect. |
| Sub-task | **Sub-task** (level −1) | A child checklist item, not an independent slice. |

**Parent, not Epic Link.** In company-managed projects (team-managed already used Parent), Jira
consolidated the old `Epic Link` and `Parent Link` fields into a single **Parent** field. Attach
a story to its epic via Parent; query children with `parent = KEY`. The legacy `Epic Link` field
and `parentEpic()` function still resolve in old saved searches but are dead for new work — use
`parent`.

## Dependencies

Built-in link types: **blocks / is blocked by**, relates to, clones, duplicates (plus causes,
implements, and others). Emit `is blocked by` for every blocker the sequence found.

Caveat that bites planners: the **Plans timeline only visualizes the `Blocks` link type, and
only between items in a single project.** Cross-project blockers exist as links but won't draw on
the timeline — so for cross-project dependencies, keep the prose "why-first" line on the ticket;
don't rely on the visual.

## Sprints, boards, backlog

- **Scrum board** → a **backlog** you groom and pull into time-boxed **sprints** (1/2/4 weeks).
  This is the home for cycle-based sequencing from Stage 3.
- **Kanban board** → continuous flow, no sprints (use for steady-state/ops streams).
- Team-managed: enable sprints/backlog first. Company-managed: a Scrum board has them by default.

## Releases — Fix versions

Map **milestones** to **Fix versions** (`fixVersion`). A version gathers everything shipping
together; the **Release hub** tracks its remaining work. Team-managed must enable releases first.
Use `Affects versions` for bugs (where it broke) vs `Fix versions` (where it's fixed).

## Components (company-managed only)

Components scope a project into areas, each with a **component lead** — a natural carrier for the
Stage 4 ownership signal. Not available in team-managed (Compass components are the alternative).

## Estimation

Set at **Board settings → Estimation** (team-managed: **Project settings → Estimation**):
**Story points** (default agile) or **Time** (creates the `Original estimate` field). Teams often
estimate in points and track in time. Don't impose points if the team sizes by count — Jira allows
either.

## JQL — the planning queries

The lever that turns a backlog into views. Current syntax:

```
project = PSY AND statusCategory != Done ORDER BY Rank ASC      # the live backlog, ranked
parent = PSY-5                                                  # an epic's children
sprint in openSprints() AND assignee = currentUser()           # my current sprint
issuetype = Bug AND priority >= High AND statusCategory != Done # urgent open bugs
fixVersion in unreleasedVersions() AND project = PSY            # work tied to upcoming releases
labels in ("needs-decision") ORDER BY created                   # parked decisions
```

Functions worth knowing: `openSprints()` / `closedSprints()` / `futureSprints()`,
`currentUser()`, `unreleasedVersions()`, `membersOf()`. Query an epic's children with `parent`,
**not** the deprecated `Epic Link` / `parentEpic()`.

## Workflow & statuses

Statuses live in one of three **categories** — **To Do** (grey) / **In Progress** (blue) /
**Done** (green) — which power reporting regardless of custom status names. **Transitions** are
one-way; allow back-moves with a second transition or a global transition. Keep the status set
small; a sprawling workflow is a planning smell, not a feature.

## Automation

No-code **Triggers → Conditions → Actions** (with branches to act on linked items/subtasks)
automate backlog hygiene — auto-transition a parent when its sub-tasks finish, label on a JQL
match, ping stale tickets. A follow-up to set up, not a planning step.

## Done — checklist

- [ ] Hierarchy uses Epic/Story/Sub-task; Initiative level only if Premium + company-managed.
- [ ] Children attached via **Parent**, not Epic Link.
- [ ] Every blocker emitted as `is blocked by`; cross-project deps also carry a prose why-first.
- [ ] Milestones mapped to Fix versions; sprints mapped to the Scrum backlog.
- [ ] Estimation method matches how the team sizes (points or time, or count if neither).
- [ ] At least the backlog and per-epic JQL queries provided for the team to reuse.
