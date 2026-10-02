# Breakdown

Decompose the work-inventory into a hierarchy of **vertical slices**. The slice is the unit that matters. The hierarchy only files the slices.

## Hierarchy

Three tool-neutral levels, plus sub-tasks. Map them per tracker at Stage 5:

| Level | Is | Jira | Linear |
|---|---|---|---|
| **Initiative** | a business outcome across weeks or months | Initiative (Plans) | Initiative |
| **Epic** | a coherent body of work toward one capability | Epic | Project, or a parent issue |
| **Story** | one slice that ships on its own | Story / Task / Bug | Issue |
| Sub-task | a checklist item _within_ a story, not its own slice | Sub-task | Sub-issue |

A project does not always need all four. A small feature is one epic of stories. Use initiatives only when several epics serve one outcome.

## Vertical slices, not horizontal layers

A **vertical slice** cuts through every layer end-to-end: schema, API, UI, and tests. It delivers one narrow but **complete** path that a user or caller can exercise. A **horizontal slice** ("build all the endpoints", "do the schema") delivers a layer that does nothing on its own. It hides integration risk until the end.

The first slice of each epic is a **tracer bullet**: the thinnest end-to-end path that proves the architecture works. It exposes every integration seam early, while a change to a seam is cheap. Every later slice is a variation on a proven path.

```
Epic: Player profile pages

  Vertical (right):
    1. [tracer] Show a username + avatar from the DB on /u/[name]   <- schema->api->ui->test, end to end
    2. Add rank + top-3 heroes to the profile
    3. Add match history list
    4. Add the share-card export

  Horizontal (wrong):
    1. Design the full profile schema
    2. Build every profile API endpoint
    3. Build all profile UI components
    4. Wire it together                                              <- integration risk lands here, late
```

## MECE

The set of slices is **M**utually **E**xclusive (no two slices do the same work) and **C**ollectively **E**xhaustive (every work-inventory entry lands in exactly one slice). After you decompose, walk the inventory. Each entry maps to one leaf, and each leaf traces back to the inventory. A leaf with no inventory root is scope creep. An inventory entry with no leaf is a gap.

## INVEST: the test for a good story

A story has the right size when it is:

- **I**ndependent: minimal ordering coupling.
- **N**egotiable: it states the outcome, not a locked implementation.
- **V**aluable: a user or caller can tell that it shipped.
- **E**stimable: the team can size it.
- **S**mall: it lands in one cycle or sprint.
- **T**estable: acceptance criteria exist (Stage 2).

If a slice fails **S**, split it along the vertical again, into a smaller end-to-end path. Never split it into horizontal layers.

## What is what: decision rules

- **Epic vs story.** An epic needs more than one slice to deliver. A story is one slice. If you cannot name a tracer bullet for it, it is a story.
- **Story vs sub-task.** A sub-task cannot ship or be verified alone. It is a checklist line on a story. If it is demoable on its own, it is a story.
- **Spike.** When a slice cannot be estimated because something is unknown, file a **spike**: a timeboxed question with a decision as its deliverable, not code. The answer feeds the next breakdown pass. Do not carry a story that cannot be estimated.
- **Milestone vs epic.** A **milestone** is a _dated, shippable outcome_ ("R2: player profiles live"). An **epic** is a _body of related work_. A milestone gathers slices across epics toward a release. An epic gathers slices toward a capability. The Stage 3 sequence connects them.

## Ground it in the code

With a repo present, the breakdown is sharper:

- **Prefactor first.** "Make the change easy, then make the easy change." If existing structure makes a slice hard, file the enabling refactor as its own slice _before_ the dependents. It sequences first in Stage 3.
- **Real seams.** Slice along seams that the code has. Prefer the fewest seams. A slice that needs a new seam introduces exactly one, at the highest sensible point.
- **Domain language.** Title slices in the project's own vocabulary (its glossary, its module names), not invented synonyms. Then the backlog reads like the codebase.

## Done: checklist

- [ ] Every work-inventory entry maps to exactly one leaf (MECE).
- [ ] Each leaf is a vertical slice, not a horizontal layer.
- [ ] The first slice of each epic is a tracer bullet that proves the path end-to-end.
- [ ] Every story passes INVEST. The ones that fail **S** are split vertically.
- [ ] Unknowns are spikes with a decision as the deliverable, not stories that cannot be estimated.
- [ ] Enabling refactors are filed as their own slices ahead of dependents.
