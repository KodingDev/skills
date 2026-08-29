# Taste rules and craft specifics

The principles behind "rich and clean instead of dev UI", with the concrete
techniques that implement them. Everything here was battle-tested against a
real art director's reads; the priority order matters.

## Color

- **One accent, earned.** Pick a single brand hue with a bright companion
  (e.g. oklch(0.6 0.21 H) / oklch(0.75 0.14 H)). It appears where it means
  something: a display-type period, a hover, the mark in a key moment. If the
  accent is everywhere it is nowhere.
- **Tinted neutrals.** Build the whole neutral ramp at low chroma on the
  accent's hue (c 0.008–0.018). This single move is most of the difference
  between "dead admin panel" and "considered brand".
- **Ramps display as continuous strips**, cells joined edge-to-edge in one
  rounded container with in-cell labels (dark text on light steps). Never a
  grid of orphaned swatch cards — a ramp is one object.
- **Status colors are functional, not brand**: four text-on-own-surface pairs
  (positive/warning/critical/info) at matched perceived brightness. Soften the
  red — pure high-chroma red on dark reads harsh (drop chroma to ~0.13).
  Badges wear the pairs freely; long text prefers its own surface.
- **Sibling brands stay guests.** If the company runs other products, their
  colors never leak into the parent brand. Drop them entirely if in doubt.

## Mark and lockup

- **Optically recenter the glyph.** Compute the true stroke bounding box
  (including round caps) and translate the geometry so the visual center sits
  at the viewBox center. An asymmetric mark centered by box rides visibly
  off-axis next to a wordmark — users notice as "the alignment is uneven".
- **Weight-match the lockup.** The mark's stroke weight must equal the
  wordmark's stem weight at display size. Fix EITHER side: run a matrix of
  stroke weights against the face, and of font weights against the stroke.
  Often the answer is "keep the stroke, drop the type a weight" (600 → 500).
- **The small-size gauntlet is the law.** 20px kills: opacity tints, thin
  double rings, hairline constellations, fussy polar details. If it needs
  explanation at 20px, it dies.
- **Parametric marks win.** Define the mark as generator parameters (ray
  lengths, angles, stroke, core radius, offsets), never as hand-tuned paths.
  Ship the exact numbers in the toolkit so it's regenerated, not redrawn.
- **Multiple readings are a feature.** The strongest marks read two or three
  ways at once (star + sparkle + xyz-axes). Name the readings in the toolkit.
- **Trend check every finalist.** Sparkles read "AI product" right now; four-
  point stars read "generic magic". If the shape is trend-adjacent, the saving
  details (uneven rays, a core dot, exact angles) ARE the identity — lock them.

## Type

- Two faces + a mono: characterful display (500 wordmark / 600 display),
  neutral body (400 / 600 emphasis), mono for data and eyebrows. Distinct
  weights per role, `font-synthesis: none`, self-hosted woff2.
- When comparing candidate faces, embed each with a `document.fonts.check()`
  loaded/fallback badge — "the fonts all look the same" is usually similar
  faces, but prove loading before debugging taste.
- Display faces with rectangular punctuation (Clash et al.) make an accent
  period read as a square. That can be a feature — notice it, decide, tell
  the user.

## Layout and presentation

- **Surface rhythm**: deep slabs for sections, raised cards inside, at most
  one inverted paper slab per page for the moment that matters. Radii
  concentric (slab 1.75rem, card 1rem, pills).
- **Names lead, numbers accompany.** Spec rows put the concept name in text
  color with the value right-aligned in small mono. No "01 · 02" section
  numbering. No middot-glued labels ("Accent · earned, never default") — use
  a name line plus a quieter note line. Middots only separate values inside
  data strings.
- **Atmosphere without noise**: two or three layered radial glows in the
  accent hue plus a scattering of small solid-color brand marks in the empty
  half of a hero. Solid dim colors from the neutral ramp, never opacity tints.
  Hide decorations on narrow viewports.
- **Paper slabs need composition.** A big light rectangle with a headline and
  button "hurts eyes" — warm the paper toward the accent hue slightly, add a
  supporting line, and balance with a large soft brand mark. If it then reads
  too dark overall, lighten in small steps (one gradient, +0.015 L).

## Voice and honesty

- Sentence case, periods, short declaratives. No exclamation marks, no
  em-dashes, no marketing register ("revolutionary", "ultimate", "passionate").
- Every claim checkable: "within the hour" appears only where true. Never
  fabricate stats, testimonials, pricing, or team sections to fill a layout.
- Internal codenames never appear publicly; speak to capability.
- Copy IS design: a rejected-copy column ("does not sound like us") in the
  toolkit teaches the voice faster than rules do.
