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
the quality comes from the loop, not from one generation. The user is the art
director, and you are the studio. Never lock taste decisions yourself. Present,
read their picks, and converge.

This is the build half of a pair. [`design-space`](../design-space/SKILL.md)
runs first and bounds *what* to build. This skill executes against that
boundary and produces the identity.

## The loop

1. **Start from the space, not from a blank page.** Find the design space page
   that the charrette wrote (`plans/`, `docs/`, a specs directory). Read it as
   answered input: thesis, anti-references, axes with the user's position on
   each, live corners, and the fixed constraints that no pass can violate. Do
   not ask again what it already settled.

   If no page exists, run [`design-space`](../design-space/SKILL.md) first.
   Without a bounded space, a session produces four versions of the same safe
   idea. Skip the charrette only when the user waves it off. Then pin the
   thesis and one named anti-reference in the thread before pass one. Say out
   loud that the rest is unbounded.

2. **Lock a foundation early.** Write down the tokens (OKLCH), the type stack,
   the voice rules, and the surface rhythm. When the user approves something,
   it is locked. Later passes build on it and never reopen it without notice.
   Keep a running list of locked decisions in the thread.
3. **Run numbered exploration passes** on one artifact URL. Republish it each
   pass, so the history stays linkable. Each pass is a grid of different
   options. "Variants" means big swings, not tweaks, unless the user says
   otherwise. A pass covers the live corners from the space. A dead corner
   comes back only if the user reopens it. Read their picks (often terse:
   "c2, c8, c9"). Make the next pass riff on the winners only. Pass mechanics
   are in [process.md](process.md).
4. **Verify every pass before you publish.** Serve locally, take a screenshot,
   and look at the real render. Marks get the small-size gauntlet
   (96/32/20px + lockup) and real contexts (browser tab, avatar, app icon,
   nav). Fix broken geometry before the user sees it. Flag the weaknesses that
   you cannot fix.
5. **Give an honest ranked read** after every pass: which options you bet on,
   which fail small, and which collide with trends (for example AI-sparkle
   fatigue). Write one short, opinionated paragraph, never a survey. Ranking is
   correct here and wrong in the charrette. At this point the user has bounded
   the space, so your read narrows inside it and does not choose it for them.
6. **Converge and codify.** When the identity locks, produce two artifacts. The
   first is a brand toolkit, the single source of truth: mark geometry, lockup,
   color ramps, status pairs, type roles, voice, and misuse. The second is a
   page mockup that wears it. Then write an implementation brief, so a fresh
   session can build it.
7. **Optional fresh eyes.** Have another agent produce a full revision against
   a written brief that spells out the locked decisions. Then cherry-pick.
   Adopt what is defensible. Reject fabrications and system violations *with
   reasons*.

## Taste rules that kill dev-UI blandness

The heuristics, in priority order. [taste.md](taste.md) has the full detail and
the craft specifics (optical centering, lockup weight match, ramp display):

- **One accent, earned.** Use a single brand color, and use it scarcely: a
  display period, a hover, the mark when it matters. Never a wash, never a
  panel fill.
- **Tinted neutrals.** Every gray leans toward the accent hue. Pure gray makes
  dev UI feel dead.
- **Surface rhythm.** Tonal slabs against the canvas do the visual work. Use one
  inverted "paper" moment per page for what matters most.
- **Weight harmony.** The stroke weight of the mark must match the stem weight
  of the wordmark. A mismatch makes a lockup feel "slightly disjointed".
- **Names lead, numbers accompany.** Concepts come first, and specs are quiet
  secondary text. No numbered section eyebrows. No middot-glued labels that
  hold several ideas.
- **Data as texture, but real.** Use mono eyebrows, live status chips, and
  tabular numbers. Never fabricate stats, testimonials, or claims.
- **Atmosphere without noise.** Layered glows and scattered brand marks fill
  dead space. If the user says "too dark" or "empty", adjust in small steps.
- **Voice is design material.** Sentence case, periods, no exclamation marks,
  no marketing register. Copy that sounds like a person is a visual upgrade.

## Pairing

[`design-space`](../design-space/SKILL.md) runs before this skill and hands over
the page. If color, typography, or UI guideline skills are installed (for
example better-colors, better-typography, better-ui), load them as advisory
guidelines while you build. Component-level polish skills complement this one.
This skill owns the brand-level loop.
