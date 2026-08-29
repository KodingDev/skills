---
name: design-uplift
description: >
  Uplift a bland or dev-UI-feeling product into a rich, clean, brand-driven
  design through iterative exploration passes with verified renders and
  taste-driven convergence. Use when the user says a site "feels bland",
  "feels like dev UI", "needs a brand", "design uplift", wants a logo or
  identity refined, or wants the full explore-pick-refine-lock loop applied to
  a product or brand.
---

# Design uplift

Turn "functional but bland" into "unmistakably theirs". This is a process skill:
the output quality comes from the loop, not from any single generation. The user
is the art director; you are the studio. Never lock taste decisions yourself —
present, read their picks, and converge.

This is the build half of a pair. [`design-space`](../design-space/SKILL.md)
runs before it and bounds *what* to build; this skill executes against that
boundary and produces the identity.

## The loop

1. **Start from the space, not from a blank page.** Find the design space page
   the charrette wrote (`plans/`, `docs/`, `.meridian/specs/`) and read it as
   answered input: thesis, anti-references, axes with the user's position on
   each, live corners, and the fixed constraints no pass may violate. Do not
   re-ask what it already settled.

   If no page exists, run [`design-space`](../design-space/SKILL.md) first.
   Building without a bounded space is how a session produces four versions of
   the same safe idea. Skip the charrette only when the user waves it off — then
   pin the thesis and one named anti-reference in-thread before pass one, and
   say out loud that the rest is unbounded.

2. **Lock a foundation early.** Tokens (OKLCH, via better-colors), type stack
   (better-typography), voice rules, surface rhythm. Write them down. Once the
   user approves something, it is LOCKED: later passes build on it and never
   silently relitigate it. Keep a running list of locked decisions in-thread.
3. **Run numbered exploration passes** to ONE artifact URL, republished each
   pass so history stays linkable. Each pass is a grid of genuinely different
   options — "variants" means big swings, not tweaks, unless the user says
   otherwise. A pass covers live corners from the space; a dead corner comes
   back only if the user reopens it. Read their picks (often terse: "c2, c8,
   c9") and make the next pass riff on winners only. Full pass mechanics:
   [process.md](process.md).
4. **Verify every pass before publishing.** Serve locally, screenshot, look at
   the actual render. Marks get the small-size gauntlet (96/32/20px + lockup)
   and real contexts (browser tab, avatar, app icon, nav). Fix broken geometry
   before the user ever sees it; flag honest weaknesses you can't fix.
5. **Give honest ranked reads** after every pass: which options you'd bet on,
   which fail small, which collide with trends (e.g. AI-sparkle fatigue). One
   short paragraph, opinionated, never a survey. Ranking is correct here and
   wrong in the charrette — by this point the user has already bounded the
   space, so your read narrows inside it instead of choosing it for them.
6. **Converge and codify.** When the identity locks, produce two artifacts: a
   brand toolkit (single source of truth: mark geometry, lockup, color ramps,
   status pairs, type roles, voice, misuse) and a page mockup wearing it. Then
   write an implementation handoff brief so a fresh session can build it.
7. **Optional fresh eyes.** Have another agent produce a full revision against
   a written brief with locked decisions spelled out, then cherry-pick: adopt
   what's defensible, reject fabrications and system violations *with reasons*.

## Taste rules that kill dev-UI blandness

The heuristics that did the heavy lifting, in priority order — full detail and
the craft specifics (optical centering, lockup weight-matching, ramp display)
in [taste.md](taste.md):

- **One accent, earned.** A single brand color, scarce: a display period, a
  hover, the mark when it matters. Never a wash, never a panel fill.
- **Tinted neutrals.** Every gray leans toward the accent hue. Pure gray is
  what makes dev UI feel dead.
- **Surface rhythm.** Tonal slabs against the canvas do the visual work; one
  inverted "paper" moment per page for what matters most.
- **Weight harmony.** The mark's stroke weight must match the wordmark's stem
  weight. Mismatch here is why lockups feel "slightly disjointed".
- **Names lead, numbers accompany.** Concepts first, specs as quiet secondary
  text. No numbered section eyebrows, no middot-glued multi-idea labels.
- **Data as texture, but real.** Mono eyebrows, live status chips, tabular
  numbers — and never fabricated stats, testimonials, or claims.
- **Atmosphere without noise.** Layered glows and scattered brand marks fill
  dead space; adjust in small steps when the user says "too dark" or "empty".
- **Voice is design material.** Sentence case, periods, no exclamation marks,
  no marketing register. Copy that sounds like a person is a visual upgrade.

## Pairing

[`design-space`](../design-space/SKILL.md) runs before this skill and hands over
the page. Load better-colors, better-typography, and better-ui as advisory
guidelines while building. The impeccable and hallmark skills complement this
one for component-level polish; this skill owns the brand-level loop.
