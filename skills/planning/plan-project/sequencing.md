# Sequencing

Turn a flat set of tickets into an order: what's blocked by what, what's on the **critical
path**, and what ships in which cycle. Two questions — *what must come first* (dependencies) and
*what's worth most* (priority) — resolved together, because a high-value ticket behind three
blockers isn't actually first.

## Build the dependency graph

For each ticket, name what must land before it. Dependencies come from three places:

- **Technical** — B needs the schema/API/seam that A creates. With a repo present, read the code
  to find these; they're the ones planners miss from a description.
- **Tracer-first** — a tracer-bullet slice precedes its variations by construction.
- **Enabling** — a prefactor or spike precedes the work it unblocks.

The graph must be **acyclic**. A cycle (A blocks B blocks A) means the slices are tangled — split
them at the seam until the dependency points one way. The **critical path** is the longest chain
of blockers; it sets the floor on how fast the project can finish, so it gets attention first.

## Order risk-first

Default ordering, in priority of what goes early:

1. **Enabling work** — prefactors, shared seams, the tracer bullet. Cheap to change now, costly
   later.
2. **High-risk / high-unknown** slices — surface the scary integration early, while there's time
   to react.
3. **Independent slices** — anything with no blockers runs in parallel (fills the team's WIP).
4. **Large structural changes** — last, and **one slice per PR, never big-bang**. A 40-file PR is
   a sequencing failure upstream.

This beats value-first ordering: shipping the highest-value slice first feels good but defers the
integration risk that actually sinks projects.

## Prioritize — pick the lens by fit

Priority breaks ties among unblocked work. Don't dump frameworks; pick one and apply it.

| Lens | Score | Use when |
|---|---|---|
| **Value/Effort** | value ÷ effort, 2×2 | the default — fast, good enough for most backlogs |
| **RICE** | Reach × Impact × Confidence ÷ Effort | comparing features with real reach/usage data |
| **WSJF** | (value + time-criticality + risk-reduction) ÷ size | deadlines/decay matter; SAFe shops |
| **MoSCoW** | Must / Should / Could / Won't | scoping a release or MVP boundary |
| **Kano** | basic / performance / delight | balancing table-stakes vs differentiators |

State the lens you used and why; a backlog that hedges ("here are five orderings") forces the
decision back onto the user — make it and let them redirect.

## Lay it onto delivery containers

- **Cycles / sprints** — fixed cadence (1–2 weeks). Fill each up to the team's WIP from the
  ordered, unblocked work; don't pull a ticket whose blocker isn't in an earlier cycle.
- **Milestones / release trains** — dated, shippable outcomes that gather slices across epics
  ("R2: player profiles live"). Map the sequence so each milestone's slices land before its date,
  with their blockers in prior cycles.

## Express dependencies for both worlds

Trackers model blocking differently, and teams vary in whether they use the typed feature. Emit
**both**, so the backlog works either way:

- **Typed links** — `blocks` / `is blocked by`. Jira and Linear both support them; produce them.
- **Prose "why-first"** — one line on the blocked ticket naming the blocker and the reason
  ("after the share-card seam from #12 lands; it owns the render path"). Some teams sequence
  entirely in prose + `relates to` and never set typed blocks — the prose makes the order legible
  without the feature.

```
PSY-210  Per-mode proficiency data
  blocked by: PSY-208 (proficiency schema)
  why first: needs the per-mode column PSY-208 adds; UI is a thin read on top.
```

## Done — checklist

- [ ] Every ticket names its blockers or "none".
- [ ] The graph is acyclic; the critical path is identified.
- [ ] Order is risk-first: enabling + tracer + high-unknown early, large structural last.
- [ ] A single prioritization lens is chosen and named for tie-breaking.
- [ ] Each ticket sits in a cycle/sprint or milestone, with blockers in earlier ones.
- [ ] Dependencies emitted as both typed links and prose why-first.
