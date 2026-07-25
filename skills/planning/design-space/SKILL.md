---
name: design-space
description: A conversational charrette that ends in a written design space — thesis, anti-references, axes, and competing corners — before any code, comp, or palette exists.
disable-model-invocation: true
---

# Design Space

A **charrette**: one conversation that ends with a bounded design *space*, not a design. No code,
no comp, no prototype, no palette. The output is a short written page a build skill picks up and
executes against.

The failure this exists to stop: the agent hears the request, silently picks the first coherent
design, and builds it well. What ships is fine. It was never *chosen* — no one ever saw the three
better ideas that died unnamed in the first thirty seconds. So the charrette spends its whole run
**before the point of commitment**, and its discipline is holding that point open longer than is
comfortable.

You are the studio; the user is the art director. You generate, they choose. Never both.

## The page

The charrette is done when this page is written. It is the spine of the session — everything below
is a way of filling one of its fields, not a stage in a sequence.

```markdown
# <name> - design space

**Thesis.** <the one sentence>

**Anti-references.** <named thing> - <what is rejected>. (x3)

**Axes.** <axis>: <end> <-> <end>. Default sits <where>; we sit <where>, because <why>. (x3-5)

**Live.** <corner name> - <one line>. What it wins / what it costs.

**Dead.** <corner name> - killed because <reason>.

**Open.** <decision deliberately deferred, and what will settle it>

**Fixed.** <constraints the ground gave that no build may violate>
```

A charrette loops and doubles back. A user who opens with a concrete complaint about two specific
screens has handed you a corner before anyone named an axis — take it and work backwards. Fill
whichever field the conversation just made available, and keep the rest visible as holes.

## The rules of the room

1. **Facts you look up, decisions you ask.** Anything in the repo, the docs, or the live product is
   yours to find — never spend a question on it. What the thing should *be* is theirs. And nothing
   is true because it is plausible: a claim about the product, the users, or what the code already
   does cites the file and line it came from. An invented user need quietly steers every axis.
2. **Ask through the structured question tool, one decision at a time.** Discrete answers go
   through the tool, not a paragraph: options are faster to answer and what comes back is
   unambiguous. One decision per round, then stop. The tool caps at four options, so a set of five
   or six takes two rounds — never truncate a list to fit, because an option the user never sees
   reads exactly like one that was never generated. Freeform is right only when the answer is a
   sentence you could not have enumerated — the thesis, a name, "what is this actually for".
3. **Recommend on decisions, never on options.** A decision ("who is this for?") deserves your
   recommended answer, marked as such. A generated **corner** does not: rank them and the user
   picks the safest card, and your ranking is the model's prior, not their taste.
4. **No pixels.** No hex, no font name, no component, no framework, until the space is landed.
   Reaching for a color is the tell that you converged an hour early.
5. **Hold two.** Never carry fewer than two live corners forward. When only one survives, the space
   is landed — say so out loud rather than drifting into building it.
6. **Dead is an output.** A killed corner plus the reason it died is worth as much as the winner;
   it is what stops the same idea being re-proposed in three weeks.
7. **The user ends the charrette, not you.** "Enough", "just build it", or a hard pivot ends it
   immediately: land what exists, move everything unresolved to **Open**, write the page anyway,
   hand off. Walking away with nothing written is the only outright failure.

## Ground

Read before asking anything. Whatever exists: the repo, `PRODUCT.md` / `DESIGN.md` / brand docs,
the live product, the sibling products, prior art the user has named. If they named a reference
("something like Linear"), look at it. You should be able to state in one sentence what exists
today and what is missing from it, every claim sourced to something you actually read.

Say in one line which fork you are in. **Greenfield** — nothing to preserve, the whole space is
open. **Incumbent** — something exists; name what is *fixed* (product truth, brand commitments,
platform, anything the user has already locked) and what is genuinely in play. That list is the
page's **Fixed** field. The incumbent design is evidence of what the thing is, never authority
over what it becomes.

## Thesis

One sentence: the single idea this thing owns, and the obvious arrangement it refuses. Not a
feature list, not a mood. If it could be printed on a competitor's site without anyone noticing, it
is not a thesis yet.

Draft it yourself from the ground and put it up for correction — a wrong sentence they can fix
beats a blank they have to fill. It is landed when the user has said it back, corrected it, or
replaced it, and it names something a neighbouring product could not claim.

Expect it to move late. The corner that turns out to be the good one often rewrites the thesis;
let it, and rewrite the axes under it.

## Anti-references

Three named things this must not feel like. **Named**, not adjectival: a real product, site,
object, or era. "Not corporate" is worthless; "not Salesforce's dashboard" is a constraint you can
design against.

Ask for the user's first, then add yours — including the one the category always ships, and the
predictable opposite of it. Both are ruts; naming them keeps them out of the corners. Each carries
one line on *what specifically* is rejected (the density, the register, the ceremony, the stock
photography) rather than a blanket dislike.

## Axes and corners

Read [`axes.md`](axes.md) when naming or testing an axis, [`corners.md`](corners.md) when
generating or presenting a set. Both orders are legitimate:

- **Concept first, axis extracted.** The user hands you something concrete — a complaint about two
  specific panels, a screen they love, a reference. That is already a corner. Name what it differs
  from and the axis falls out, in their vocabulary, with evidence behind it. Reach for this
  whenever anything concrete is on the table; the axis it yields beats any you would derive cold.
- **Axis first, corners pinned.** Nothing concrete yet, or the concepts coming back all look alike.
  Name the dimensions from the thesis and the anti-references, then pin corners at their ends,
  which guarantees the set differs.

Expect to alternate. An extracted axis suggests a corner nobody would have pitched; a pinned corner
exposes a dimension nobody had named. The space is bounded when 3-5 axes hold, at least two corners
are mutually exclusive — building one forecloses the other — and every corner's cost names
something specific it gives up: a user it fails, a use it cannot host, a constraint it breaks.
"More work" and "less flexible" are not costs.

## Marking

The user reacts. Their reaction is data, not instruction: "too cold" marks a position on an axis,
it does not name the design. Play it back as a coordinate ("so: warm end of register, but the
density stays high?") and confirm.

Mark the set with a multi-select question round — "which of these stay live?", listed in the order
they were presented. Multi-select is what keeps this from collapsing into a vote: the user is
drawing a boundary around a region, not picking a winner.

Maintain three buckets as you go — **live**, **dead** (with the reason), **open** (deferred on
purpose, with what will settle it). Kill things out loud.

## Landing

Write the page where the project keeps planning docs (`plans/`, `docs/`, `.meridian/specs/`); if
there is no convention, ask once. Then name what takes it: a design or build pass for a surface, a
throwaway prototype when a corner has to be felt before it can be judged, a planning pass when the
space is settled and the work needs breaking down.

Whatever runs next, the page **replaces** its discovery round rather than preceding it. Hand it
over as answered input — audience, job, tone, constraints, and what was already ruled out — so
nobody sits through those questions a second time.

**Done when:** the page exists on disk, the user has confirmed it, and the next step is named with
an owner — not "we could now build it". Every corner that was generated appears on it under live,
dead, or open; one that vanished silently comes back in three weeks under a different name.
