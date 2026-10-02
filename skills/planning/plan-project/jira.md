# Shaping for Jira

Render the backlog into Jira's model. Jira is the primary target: most delivery teams, and AWS ProServe engagements, work in it.

First, identify the **project type**. It changes which features exist:

- **Company-managed**: shared configuration that admins govern. It has Components, custom hierarchy levels above Epic, and workflow schemes. It is the default for larger orgs and most ProServe work.
- **Team-managed**: self-contained per project. Sprints and releases are opt-in toggles. It has **no Components** and **no custom levels above Epic**.

> Terminology: Atlassian is rolling out new names (issue -> **work item**, project -> **space**, issue type -> **work type**). The classic terms still work everywhere, including JQL. This file uses the classic terms. Both resolve.

## Hierarchy mapping

| plan-project | Jira | Notes |
|---|---|---|
| Initiative | **Initiative** (or custom level) | A level **above Epic**. Premium/Enterprise and **company-managed only**. Add it in Settings -> Work type hierarchy. Skip it on Standard or team-managed. |
| Epic | **Epic** (level 1) | The top built-in level. Always available. |
| Story | **Story / Task / Bug** (level 0) | Story = user-facing, Task = other work, Bug = defect. |
| Sub-task | **Sub-task** (level -1) | A child checklist item, not an independent slice. |

**Parent, not Epic Link.** In company-managed projects, Jira merged the old `Epic Link` and `Parent Link` fields into one **Parent** field. Team-managed projects use Parent too. Attach a story to its epic through Parent. Query children with `parent = KEY`. The legacy `Epic Link` field and `parentEpic()` function still resolve in old saved searches, but are dead for new work. Use `parent`.

## Dependencies

Built-in link types: **blocks / is blocked by**, relates to, clones, duplicates, plus causes, implements, and others. Emit `is blocked by` for every blocker that the sequence found.

A caveat for planners: the **Plans timeline shows only the `Blocks` link type, and only between items in one project.** Cross-project blockers exist as links but do not draw on the timeline. For cross-project dependencies, keep the prose "why-first" line on the ticket. Do not rely on the visual.

## Sprints, boards, backlog

- **Scrum board** -> a **backlog** that you groom and pull into time-boxed **sprints** (1, 2, or 4 weeks). This is the home for cycle-based sequencing from Stage 3.
- **Kanban board** -> continuous flow, no sprints. Use it for steady-state or ops streams.
- Team-managed: enable sprints and the backlog first. Company-managed: a Scrum board has them by default.

## Releases: Fix versions

Map **milestones** to **Fix versions** (`fixVersion`). A version gathers everything that ships together. The **Release hub** tracks its remaining work. Team-managed projects must enable releases first. For bugs, use `Affects versions` (where it broke) and `Fix versions` (where it is fixed).

## Components (company-managed only)

Components divide a project into areas, each with a **component lead**. The lead is a natural carrier for the Stage 4 ownership signal. Team-managed projects do not have them. Compass components are the alternative.

## Estimation

Set it at **Board settings -> Estimation** (team-managed: **Project settings -> Estimation**). The options are **Story points** (the agile default) or **Time**, which creates the `Original estimate` field. Teams often estimate in points and track in time. If the team sizes by count, do not impose points. Jira accepts either.

## JQL: the planning queries

JQL turns a backlog into views. Current syntax:

```
project = PSY AND statusCategory != Done ORDER BY Rank ASC      # the live backlog, ranked
parent = PSY-5                                                  # an epic's children
sprint in openSprints() AND assignee = currentUser()           # my current sprint
issuetype = Bug AND priority >= High AND statusCategory != Done # urgent open bugs
fixVersion in unreleasedVersions() AND project = PSY            # work tied to upcoming releases
labels in ("needs-decision") ORDER BY created                   # parked decisions
```

Useful functions: `openSprints()` / `closedSprints()` / `futureSprints()`, `currentUser()`, `unreleasedVersions()`, `membersOf()`. Query the children of an epic with `parent`, **not** the deprecated `Epic Link` / `parentEpic()`.

## Workflow and statuses

Each status is in one of three **categories**: **To Do** (grey), **In Progress** (blue), or **Done** (green). The categories power reporting, whatever the custom status names are. **Transitions** are one-way. To allow a move back, add a second transition or a global transition. Keep the status set small. A sprawling workflow is a planning smell, not a feature.

## Automation

No-code rules of **Triggers -> Conditions -> Actions**, with branches that act on linked items or subtasks, automate backlog hygiene. Examples: transition a parent when its sub-tasks finish, add a label on a JQL match, ping stale tickets. Automation is a follow-up to set up, not a planning step.

## Done: checklist

- [ ] Hierarchy uses Epic/Story/Sub-task. The Initiative level appears only with Premium and company-managed.
- [ ] Children are attached through **Parent**, not Epic Link.
- [ ] Every blocker is emitted as `is blocked by`. Cross-project dependencies also carry a prose why-first line.
- [ ] Milestones map to Fix versions. Sprints map to the Scrum backlog.
- [ ] The estimation method matches how the team sizes: points, time, or count if neither.
- [ ] At least the backlog query and the per-epic JQL query are given for the team to reuse.
