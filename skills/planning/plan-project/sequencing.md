# Sequencing

Turn a flat set of tickets into an order: what blocks what, what is on the **critical path**, and what ships in which cycle. Resolve two questions together: *what must come first* (dependencies) and *what is worth most* (priority). A high-value ticket behind three blockers is not first.

## Build the dependency graph

For each ticket, name what must land before it. Dependencies come from three places:

- **Technical**: B needs the schema, API, or seam that A creates. With a repo present, read the code to find these. Planners miss them when they work from a description.
- **Tracer-first**: a tracer-bullet slice comes before its variations, by construction.
- **Enabling**: a prefactor or spike comes before the work it unblocks.

The graph must be **acyclic**. A cycle (A blocks B blocks A) means that the slices are tangled. Split them at the seam until the dependency points one way. The **critical path** is the longest chain of blockers. It sets the minimum time to finish the project, so it gets attention first.

## Order risk-first

Default order, earliest first:

1. **Enabling work**: prefactors, shared seams, the tracer bullet. These are cheap to change now and costly later.
2. **High-risk or high-unknown** slices: expose the scary integration early, while there is time to react.
3. **Independent slices**: anything with no blockers runs in parallel and fills the team's WIP.
4. **Large structural changes**: last, and **one slice per PR, never big-bang**. A 40-file PR is an upstream sequencing failure.

This order is better than value-first. To ship the highest-value slice first feels good, but it defers the integration risk that sinks projects.

## Prioritize: pick the lens by fit

Priority breaks ties among unblocked work. Pick one framework and apply it. Do not list several.

| Lens | Score | Use when |
|---|---|---|
| **Value/Effort** | value / effort, 2x2 | the default: fast, good enough for most backlogs |
| **RICE** | Reach x Impact x Confidence / Effort | you compare features with real reach or usage data |
| **WSJF** | (value + time-criticality + risk-reduction) / size | deadlines or decay matter; SAFe shops |
| **MoSCoW** | Must / Should / Could / Won't | you scope a release or an MVP boundary |
| **Kano** | basic / performance / delight | you balance table-stakes against differentiators |

State the lens that you used and why. A backlog that hedges ("here are five orderings") sends the decision back to the user. Make the decision, and let the user redirect.

## Put it onto delivery containers

- **Cycles or sprints**: fixed cadence (1-2 weeks). Fill each one up to the team's WIP from the ordered, unblocked work. Do not pull a ticket unless its blocker is in an earlier cycle.
- **Milestones or release trains**: dated, shippable outcomes that gather slices across epics ("R2: player profiles live"). Map the sequence so that the slices of each milestone land before its date, with their blockers in earlier cycles.

## Express dependencies for both styles

Trackers model blocking differently, and some teams do not use the typed feature. Emit **both** forms, so that the backlog works either way:

- **Typed links**: `blocks` / `is blocked by`. Jira and Linear both support them. Produce them.
- **Prose "why-first"**: one line on the blocked ticket that names the blocker and the reason ("after the share-card seam from #12 lands; it owns the render path"). Some teams sequence only in prose plus `relates to`, and never set typed blocks. The prose makes the order clear without the feature.

```
PSY-210  Per-mode proficiency data
  blocked by: PSY-208 (proficiency schema)
  why first: needs the per-mode column PSY-208 adds; UI is a thin read on top.
```

## Done: checklist

- [ ] Every ticket names its blockers or "none".
- [ ] The graph is acyclic, and the critical path is identified.
- [ ] Order is risk-first: enabling, tracer, and high-unknown work early; large structural work last.
- [ ] One prioritization lens is chosen and named for tie-breaking.
- [ ] Each ticket sits in a cycle, sprint, or milestone, with its blockers in earlier ones.
- [ ] Dependencies are emitted as both typed links and prose why-first lines.
