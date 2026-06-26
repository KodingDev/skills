# Breakdown

Decompose the work-inventory into a hierarchy of **vertical slices**. The unit that matters is
the slice; the hierarchy just files them.

## Hierarchy

Three tool-neutral levels. Map them per tracker at Stage 5:

| Level | Is | Jira | Linear |
|---|---|---|---|
| **Initiative** | a business outcome spanning weeks–months | Initiative (Plans) | Initiative |
| **Epic** | a coherent body of work toward one capability | Epic | Project, or a parent issue |
| **Story** | one independently-shippable slice | Story / Task / Bug | Issue |
| Sub-task | a checklist item _within_ a story, not its own slice | Sub-task | Sub-issue |

Not every project needs all four. A small feature is one epic of stories. Reach for initiatives
only when several epics serve one outcome.

## Vertical slices, not horizontal layers

A **vertical slice** cuts through every layer end-to-end — schema, API, UI, tests — delivering
one narrow but **complete** path a user or caller can exercise. A **horizontal slice** ("build
all the endpoints", "do the schema") delivers a layer that does nothing on its own and hides
integration risk until the end.

The first slice of each epic is a **tracer bullet**: the thinnest possible end-to-end path that
proves the architecture works. It lights up every integration seam early, while changing them is
still cheap. Everything after it is a variation on a proven path.

```
Epic: Player profile pages

  Vertical (right):
    1. [tracer] Show a username + avatar from the DB on /u/[name]   ← schema→api→ui→test, end to end
    2. Add rank + top-3 heroes to the profile
    3. Add match history list
    4. Add the share-card export

  Horizontal (wrong):
    1. Design the full profile schema
    2. Build every profile API endpoint
    3. Build all profile UI components
    4. Wire it together                                              ← integration risk lands here, late
```

## MECE

The set of slices is **M**utually **E**xclusive (no two slices do the same work) and
**C**ollectively **E**xhaustive (every work-inventory entry lands in exactly one). After
decomposing, walk the inventory: each entry maps to one leaf, and each leaf traces back to the
inventory. A leaf with no inventory root is scope creep; an inventory entry with no leaf is a gap.

## INVEST — the test for a good story

A story is right-sized when it is **I**ndependent (minimal ordering coupling), **N**egotiable
(states the outcome, not a locked implementation), **V**aluable (a user/caller can tell it
shipped), **E**stimable (the team can size it), **S**mall (lands in one cycle/sprint), and
**T**estable (acceptance criteria exist — Stage 2). If a slice fails **S**, split it along the
vertical again (a smaller end-to-end path), never into horizontal layers.

## What is what — decision rules

- **Epic vs story** — an epic needs more than one slice to deliver; a story is one slice. If you
  can't name a tracer bullet for it, it's a story, not an epic.
- **Story vs sub-task** — a sub-task can't ship or be verified alone; it's a checklist line on a
  story. If it's independently demoable, it's a story.
- **Spike** — when a slice can't be estimated because something is unknown, file a **spike**: a
  timeboxed question with a decision as its deliverable, not code. The answer feeds the next
  breakdown pass; don't carry an unestimable story.
- **Milestone vs epic** — a **milestone** is a _dated, shippable outcome_ ("R2: player profiles
  live"); an **epic** is a _body of related work_. Milestones gather slices across epics toward a
  release; an epic gathers slices toward a capability. Sequence in Stage 3 ties them together.

## Ground it in the code

With a repo present, breakdown is sharper:

- **Prefactor first.** "Make the change easy, then make the easy change." If a slice is hard
  because of existing structure, file the enabling refactor as its own slice _before_ the
  dependents (it sequences first in Stage 3).
- **Real seams.** Slice along seams the code actually has. Prefer the fewest seams; a slice that
  needs a new seam should introduce exactly one, at the highest sensible point.
- **Domain language.** Title slices in the project's own vocabulary (its glossary, its module
  names), not invented synonyms — so the backlog reads like the codebase.

## Done — checklist

- [ ] Every work-inventory entry maps to exactly one leaf (MECE).
- [ ] Each leaf is a vertical slice, not a horizontal layer.
- [ ] Each epic's first slice is a tracer bullet that proves the path end-to-end.
- [ ] Every story passes INVEST (split the ones that fail **S** vertically).
- [ ] Unknowns are spikes with a decision as the deliverable, not unestimable stories.
- [ ] Enabling refactors are filed as their own slices ahead of dependents.
