---
name: design-space
description: A conversational charrette that ends in a written design space — thesis, anti-references, axes, and competing corners — before any code, comp, or palette exists. Conversation only, no renders, no variants; the written page is the whole output.
disable-model-invocation: true
---

# Design Space

A **charrette**: one conversation that ends with a bounded design *space*, not a design. No
code, no comp, no prototype, no palette. The output is a short written page that a build
skill picks up and executes against.

This skill exists to stop one failure: the agent hears the request, silently picks the first
coherent design, and builds it well. What ships is fine. But nobody chose it. Nobody saw the
three better ideas that died unnamed in the first thirty seconds. So the charrette spends its
whole run **before the point of commitment**. Its discipline is to hold that point open
longer than is comfortable.

You are the studio. The user is the art director. You generate. They choose. Never both.

## The page

The charrette is done when this page is written. The page is the spine of the session.
Everything below is a way to fill one of its fields, not a stage in a sequence.

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

A charrette loops and doubles back. A user who opens with a concrete complaint about two
specific screens has handed you a corner before anyone named an axis. Take it and work
backwards. Fill the field that the conversation just made available. Keep the other fields
visible as holes.

## The rules of the room

1. **Facts you look up, decisions you ask.** Find everything in the repo, the docs, or the
   live product yourself. Never spend a question on it. What the thing must *be* is theirs.
   Nothing is true because it is plausible. Each claim about the product, the users, or the
   code cites the file and line that it came from. An invented user need quietly steers each
   axis.
2. **Ask through the structured question tool, one decision at a time.** Send discrete
   answers through the tool, not a paragraph. Options are faster to answer, and the answer is
   unambiguous. Ask one decision per round, then stop. The tool caps at four options, so a
   set of five or six takes two rounds. Never truncate a list to fit. An option that the user
   never sees reads the same as an option that you never generated. Freeform is correct only
   when the answer is a sentence that you cannot enumerate: the thesis, a name, "what is
   this for".
3. **Recommend on decisions, never on options.** A decision ("who is this for?") deserves
   your recommended answer, marked as such. A generated **corner** does not. If you rank the
   corners, the user picks the safest card, and your ranking is the model's prior, not
   their taste.
4. **No pixels.** No hex, no font name, no component, no framework, until the space is
   landed. When you reach for a color, that is the sign that you converged an hour early.
5. **Hold two.** Never carry fewer than two live corners forward. When only one survives, the
   space is landed. Say so out loud. Do not drift into building it.
6. **Dead is an output.** A killed corner plus the reason it died is worth as much as the
   winner. It stops the same idea from being re-proposed in three weeks.
7. **The user ends the charrette, not you.** "Enough", "just build it", or a hard pivot ends
   it immediately. Land what exists. Move everything unresolved to **Open**. Write the page.
   Hand off. To walk away with nothing written is the only outright failure.

## Ground

Read before you ask anything. Read what exists: the repo, `PRODUCT.md` / `DESIGN.md` / brand
docs, the live product, the sibling products, and the prior art that the user named. If they
named a reference ("something like Linear"), look at it. Then you can state in one sentence
what exists today and what is missing. Source each claim to something that you read.

Say in one line which fork you are in. **Greenfield** — nothing to preserve, the whole space
is open. **Incumbent** — something exists. Name what is *fixed* (product truth, brand
commitments, platform, what the user already locked) and what is in play. That list is the
**Fixed** field of the page. The incumbent design is evidence of what the thing is, never
authority over what it becomes.

## Thesis

One sentence: the single idea that this thing owns, and the obvious arrangement that it
refuses. Not a feature list. Not a mood. If a competitor can print it on their site without
notice, it is not a thesis yet.

Draft it yourself from the ground and put it up for correction. A wrong sentence that they
can fix beats a blank that they must fill. It is landed when the user has said it back,
corrected it, or replaced it, and it names something that a neighbouring product cannot
claim.

Expect it to move late. The corner that turns out to be the good one often rewrites the
thesis. Let it, and rewrite the axes under it.

## Anti-references

Three named things that this must not feel like. **Named**, not adjectival: a real product,
site, object, or era. "Not corporate" is worthless. "Not the Salesforce dashboard" is a
constraint that you can design against.

Ask for the user's anti-references first. Then add yours. Include the one that the
category always ships, and the predictable opposite of it. Both are ruts. To name them keeps
them out of the corners. Each anti-reference carries one line on *what specifically* is
rejected (the density, the register, the ceremony, the stock photography), not a blanket
dislike.

## Axes and corners

Read [`axes.md`](axes.md) when you name or test an axis. Read [`corners.md`](corners.md) when
you generate or present a set. Both orders are legitimate:

- **Concept first, axis extracted.** The user hands you something concrete: a complaint about
  two specific panels, a screen that they love, a reference. That is already a corner. Name
  what it differs from, and the axis falls out — in their vocabulary, with evidence behind
  it. Use this order when anything concrete is on the table. The axis that it yields beats
  any axis that you derive cold.
- **Axis first, corners pinned.** Nothing concrete exists yet, or the concepts that come back
  all look alike. Name the dimensions from the thesis and the anti-references. Then pin
  corners at their ends. That guarantees that the corners in the set differ.

Expect to alternate. An extracted axis suggests a corner that nobody would have pitched. A
pinned
corner shows a dimension that nobody had named. The space is bounded when 3-5 axes hold, when
at least two corners are mutually exclusive (to build one forecloses the other), and when the
cost of each corner names something specific that it gives up: a user that it fails, a use
that it cannot host, a constraint that it breaks. "More work" and "less flexible" are not
costs.

## Marking

The user reacts. Their reaction is data, not instruction. "Too cold" marks a position on an
axis. It does not name the design. Play it back as a coordinate ("so: warm end of register,
but the density stays high?") and confirm.

Mark the set with a multi-select question round — "which of these stay live?" — listed in the
order of presentation. Multi-select keeps this from a collapse into a vote. The user draws a
boundary around a region. They do not pick a winner.

Maintain three buckets as you go: **live**, **dead** (with the reason), and **open**
(deferred on purpose, with what will settle it). Kill things out loud.

## Landing

Write the page where the project keeps planning docs (`plans/`, `docs/`, `.meridian/specs/`).
If there is no convention, ask once. Then name what takes the page: a design or build pass
for a surface, a throwaway prototype when a corner must be felt before it can be judged, or a
planning pass when the space is settled and the work needs breakdown.

The page **replaces** the discovery round of the next step. It does not precede it. Hand the
page over as answered input — audience, job, tone, constraints, and what was already ruled
out — so that nobody sits through those questions a second time.

**Done when:** the page exists on disk, the user has confirmed it, and the next step is named
with an owner — not "we could now build it". Each generated corner appears on the page under
live, dead, or open. A corner that vanishes silently comes back in three weeks under a
different name.
