---
name: design-space
description: Ideate a design in conversation until the space is bounded — thesis, anti-references, axes, and competing corners — before any code, comp, or prototype exists.
disable-model-invocation: true
---

# Design Space

A **charrette**: one conversation that ends with a bounded design *space*, not a design. No code,
no comp, no prototype, no palette. The output is a short written space that a build skill picks
up and executes against.

The failure this exists to stop: the agent hears the request, silently picks the first coherent
design, and builds it well. What ships is fine. It was never *chosen* — no one ever saw the three
better ideas that died unnamed in the first thirty seconds.

So this skill spends its whole run **before the point of commitment**, and its discipline is
holding that point open longer than is comfortable.

You are the studio; the user is the art director. You generate, they choose. Never both.

## The rules of the room

1. **Facts you look up, decisions you ask.** Anything in the repo, the docs, or the live product
   is yours to find — never spend a question on it. What the thing should *be* is theirs.
2. **Ask through the structured question tool, one decision at a time.** Anything with discrete
   answers goes through the question tool, not a paragraph: options are faster to answer than
   prose, and what comes back is unambiguous. One decision per round, then stop. Freeform is
   right only when the answer is a sentence you could not have enumerated — the thesis, a name,
   "what is this actually for". Run `/grilling` cadence if it helps.
3. **Recommend on decisions, never on options.** A decision ("who is this for?") deserves your
   recommended answer, marked as such. A generated **corner** does not: rank them and the user
   picks the safest card, and your ranking is the model's prior, not their taste. So corners are
   presented flat, as prose — the question tool leads with a recommendation and caps at four
   options, both of which are wrong for a corner set. It returns at Stage 5 to *mark* them.
4. **No pixels.** No hex, no font name, no component, no framework, no file path, until the space
   is landed. Reaching for a color is the tell that you converged an hour early.
5. **Hold two.** Never carry fewer than two live corners forward. When only one survives, the
   space is landed — say so out loud rather than drifting into building it.
6. **Dead is an output.** A killed corner plus the reason it died is worth as much as the winner;
   it is what stops the same idea being re-proposed in three weeks.
7. **Nothing is true because it's plausible.** Claims about the product, the users, the market, or
   what the code already does get checked. An invented user need will quietly steer every axis.

## Stage 0 — Ground

Read before asking anything. Whatever exists: the repo, `PRODUCT.md` / `DESIGN.md` / brand docs,
the live product, the sibling products, prior art the user has named. If the user named a
reference ("something like Linear"), look at it.

Two forks, decided here and stated in one line:

- **Greenfield** — nothing to preserve. The whole space is open.
- **Incumbent** — something already exists. Name what is *fixed* (product truth, brand
  commitments, platform, anything the user has already locked) and what is genuinely in play.
  The incumbent design is evidence of what the thing is, never authority over what it becomes.

**Done when:** you can state in one sentence what exists today and what is missing from it, every
claim sourced to something you actually read — and you have asked the user nothing yet.

## Stage 1 — The thesis

One sentence: the single idea this thing owns, and the obvious arrangement it refuses. Not a
feature list, not a mood. If it could be printed on a competitor's site without anyone noticing,
it is not a thesis yet.

Draft it yourself from Stage 0 and put it up for correction — a wrong sentence they can fix beats
a blank they have to fill.

**Done when:** the user has said the sentence back, corrected it, or replaced it — and it names
something a neighbouring product could not claim.

## Stage 2 — The anti-references

Three named things this must not feel like. **Named**, not adjectival: a real product, site,
object, or era. "Not corporate" is worthless; "not Salesforce's dashboard" is a constraint you
can design against.

Ask for the user's first, then add yours — including the one the category always ships, and the
predictable opposite of it. Both are ruts; naming them keeps them out of the corners.

**Done when:** three named anti-references exist, each with one line on *what specifically* is
being rejected (the density, the register, the ceremony, the stock photography) rather than a
blanket dislike.

## Stage 3 — The axes → read [`axes.md`](axes.md)

Name the 3–5 dimensions this design genuinely varies on. An **axis** is a named continuum with
two ends someone could reasonably argue for. Derive them from the thesis and the anti-references,
and reach for `axes.md` when the list feels thin or generic.

The test of a real axis: you can name where the category's default sits on it, and say why that
default is wrong *here*. An axis whose ends are "bad" and "good" is not an axis.

Put each axis's position to the user through the question tool — the ends, plus the category
default as its own option so they can see what they are refusing.

**Done when:** every axis has two nameable, defensible ends, and you have marked where the
category default sits on each.

## Stage 4 — The corners → read [`corners.md`](corners.md)

Generate 4–6 **corners**: concepts pinned at the extremes of the axes, deliberately incompatible
with each other. Each gets a name, one line of thesis, its position on every axis, what it wins,
and what it costs.

Corners are not variations. If two could be merged without losing either idea, they are one
corner and you owe the user another.

Present them flat, in one message, no ranking, no recommendation. `corners.md` carries the
generation moves and the sameness traps.

**Done when:** at least two corners are mutually exclusive — building one forecloses the other —
and each one costs something real.

## Stage 5 — Mark the space

The user reacts. Their reaction is data, not instruction: "too cold" marks a position on an axis,
it does not name the design. Play it back as a coordinate ("so: warm end of register, but the
density stays high?") and confirm.

Mark the set with the question tool: one multi-select round of "which of these stay live?", listed
in the order they were presented. Multi-select is what keeps this from collapsing into a vote —
the user is drawing a boundary around a region, not picking a winner.

Record three buckets as you go — **live**, **dead** (with the reason), **open** (decided later,
deliberately). Kill things out loud.

**Done when:** at least one corner is dead with its reason recorded, and the live corners have
shrunk to two or one.

## Stage 6 — Land the space, then hand off

Write the space down. It is short — a page, not a spec — and it is the durable output of the
whole session:

```markdown
# <name> — design space

**Thesis.** <the one sentence>

**Anti-references.** <named thing> — <what is rejected>. (×3)

**Axes.** <axis>: <end> ←→ <end>. Default sits <where>; we sit <where>, because <why>. (×3–5)

**Live.** <corner name> — <one line>. What it wins / what it costs.

**Dead.** <corner name> — killed because <reason>.

**Open.** <decision deliberately deferred, and what will settle it>

**Fixed.** <constraints inherited from Stage 0 that no build may violate>
```

Write it where the project keeps planning docs (`plans/`, `docs/`, `.meridian/specs/`); if there
is no convention, ask once where it should live. Then name the skill that takes it: a build skill
for a surface, `/prototype` when a corner needs to be felt before it can be judged, `/plan-project`
when the space is settled and the work needs breaking down.

**Done when:** the user confirms the written space, and the next step is named with an owner —
not "we could now build it".

## Principles

- **The space is the deliverable.** Not a chosen design, not a spec, not a comp. A bounded region
  with the walls written down. Landing on one design early is the failure, even if it is a good one.
- **Divergence is work, not warm-up.** Four genuinely different concepts cost more thought than one
  polished one. Do not shortcut to the fourth-best idea because it arrived first.
- **Everything is words.** The whole session survives in prose a human can read in two minutes.
  If it needs a render to be understood, it is not a space yet — it is a design.
