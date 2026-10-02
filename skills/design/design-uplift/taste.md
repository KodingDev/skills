# Taste rules and craft specifics

The principles behind "rich and clean in place of dev UI", with the techniques
that implement them, in priority order.

## Color

- **One accent, earned.** Pick a single brand hue with a bright companion (for
  example oklch(0.6 0.21 H) / oklch(0.75 0.14 H)). It appears where it means
  something: a display-type period, a hover, the mark at a key moment. An
  accent that is everywhere is nowhere.
- **Tinted neutrals.** Build the whole neutral ramp at low chroma on the hue of
  the accent (c 0.008-0.018). This one move is most of the difference between
  "dead admin panel" and "considered brand".
- **Show a ramp as one continuous strip.** Join the cells edge to edge in one
  rounded container, with labels in the cells (dark text on light steps). Never
  use a grid of separate swatch cards. A ramp is one object.
- **Status colors are functional, not brand.** Use four text-on-own-surface
  pairs (positive, warning, critical, info) at matched perceived brightness.
  Soften the red: pure high-chroma red on dark reads harsh, so drop the chroma
  to ~0.13. Badges can use the pairs freely. Long text goes on its own surface.
- **Sibling brands stay guests.** If the company runs other products, their
  colors never leak into the parent brand. If in doubt, drop them.

## Mark and lockup

- **Recenter the glyph optically.** Compute the true bounding box of the stroke
  (round caps included). Translate the geometry so the visual center sits at
  the viewBox center. An asymmetric mark centered by its box sits visibly off
  axis next to a wordmark. Users report it as "the alignment is uneven".
- **Match the lockup weights.** The stroke weight of the mark must equal the
  stem weight of the wordmark at display size. Fix either side: run a matrix of
  stroke weights against the face, and of font weights against the stroke. The
  answer is often "keep the stroke, drop the type one weight" (600 -> 500).
- **The small-size gauntlet is the law.** 20px kills opacity tints, thin double
  rings, hairline constellations, and fussy polar details. If a mark needs
  explanation at 20px, it dies.
- **Parametric marks win.** Define the mark as generator parameters (ray
  lengths, angles, stroke, core radius, offsets), never as hand-tuned paths.
  Ship the exact numbers in the toolkit, so the mark is regenerated, not
  redrawn.
- **Multiple readings are a feature.** The strongest marks read two or three
  ways at once (star + sparkle + xyz-axes). Name the readings in the toolkit.
- **Check every finalist against trends.** Sparkles read as "AI product", and
  four-point stars read as "generic magic". If the shape is close to a trend,
  the details that save it (uneven rays, a core dot, exact angles) are the
  identity. Lock them.

## Type

- Use two faces and a mono: a display face with character (500 wordmark / 600
  display), a neutral body face (400 / 600 emphasis), and a mono for data and
  eyebrows. Give each role a distinct weight. Set `font-synthesis: none`.
  Self-host woff2 files.
- When you compare candidate faces, embed each one with a
  `document.fonts.check()` badge that shows loaded or fallback. "The fonts all
  look the same" usually means similar faces, but prove that they load before
  you debug taste.
- Display faces with rectangular punctuation (Clash and similar) make an accent
  period read as a square. That can be a feature. Notice it, decide, and tell
  the user.

## Layout and presentation

- **Surface rhythm.** Use deep slabs for sections and raised cards inside them.
  Use at most one inverted paper slab per page, for the moment that matters.
  Keep radii concentric (slab 1.75rem, card 1rem, pills).
- **Names lead, numbers accompany.** A spec row puts the concept name in text
  color, with the value right-aligned in small mono. No "01 · 02" section
  numbering. No middot-glued labels ("Accent · earned, never default"). Use a
  name line and a quieter note line. Middots only separate values inside data
  strings.
- **Atmosphere without noise.** Use two or three layered radial glows in the
  accent hue, and scatter small solid-color brand marks in the empty half of a
  hero. Use solid dim colors from the neutral ramp, never opacity tints. Hide
  decorations on narrow viewports.
- **Paper slabs need composition.** A big light rectangle with a headline and a
  button "hurts eyes". Warm the paper slightly toward the accent hue, add a
  supporting line, and balance it with a large soft brand mark. If the result
  reads too dark overall, lighten in small steps (one gradient, +0.015 L).

## Voice and honesty

- Sentence case, periods, short declaratives. No exclamation marks, no
  em-dashes, no marketing register ("revolutionary", "ultimate", "passionate").
- Every claim is checkable: "within the hour" appears only where it is true.
  Never fabricate stats, testimonials, pricing, or team sections to fill a
  layout.
- Internal codenames never appear in public. Speak to capability.
- Copy is design. A rejected-copy column ("does not sound like us") in the
  toolkit teaches the voice faster than rules do.
