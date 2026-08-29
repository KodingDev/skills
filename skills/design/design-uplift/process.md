# The exploration-pass loop, in detail

## Setup

- Work in a scratchpad directory: one `explorations.html` rebuilt per pass by a
  generator script (python heredoc works well), plus a `fonts/` dir of woff2s.
- Everything publishes as a self-contained artifact: fonts inlined as base64
  data URIs (CSP blocks external hosts), all CSS inline. Republish the SAME
  file path every pass so the URL is stable and the user can follow along on
  any device.
- Two artifacts, two jobs: an explorations page (history, grows by appending
  passes when the user wants continuity) and a prototype/toolkit page (always
  current state, rebuilt freely).

## Anatomy of a pass

1. Generate options programmatically where possible (parametric SVG beats
   hand-authored paths: n-point stars, arcs, masks, stroke geometry). Determinism
   makes "same but heavier" trivially reproducible next pass.
2. Every mark tile shows: the mark at ~96px, a size row (32px, 20px), and a
   mini nav lockup next to the wordmark. Weak marks die at 20px — show it.
3. When candidates get serious, add real contexts: browser tab (~15px), round
   avatar, app icon with gradient, nav lockup, accent-colored variant. This is
   what killed two "finalists" that looked great big.
4. Serve locally (`python3 -m http.server`), screenshot in a real browser,
   inspect the render. Common self-caught bugs: SVG groups pasted without an
   `<svg>` wrapper (renders nothing), mask id collisions between tiles (prefix
   every id per tile), mojibake from a missing charset (use entities), stale
   server on the port serving old files (kill all `http.server` before start —
   a previous session's server squatting the port serves you stale content
   while your edits look ignored).
5. Publish, then give the user: what's in the pass, and your honest ranked read.

## Reading the user

- Terse picks ("w2, w9", "B is the winner") are the norm. Track winners across
  passes; they compound.
- "More experimental" / "crazy stuff" = new concepts, not parameter tweaks.
- "Keep all of that" — confirm WHICH set they mean before rebuilding; when a
  correction arrives mid-build, recover the earlier state (the session
  transcript at ~/.claude/projects/<project>/<session>.jsonl contains every
  generator script you ran — grep it rather than reconstructing from memory).
- A reference image or screenshot from the user outranks your read of the
  render. They see things you don't (uneven alignment, "eyes hurt").
- When they say a thing is wrong ("still broken", "too dark"), fix in SMALL
  steps — one variable at a time, verify, don't over-correct.

## Locking and convergence

- Maintain the locked list: typeface, mark geometry, tokens, voice. State it
  back at convergence moments so drift is visible.
- The final mark ships with exact geometry (grid, ray lengths, stroke, caps,
  core, optical-centering offset) so it can be regenerated, never redrawn.
- Toolkit sections that earn their place: the mark (geometry + clearspace +
  min sizes + surface variants), misuse (RENDERED wrong versions with a
  one-line reason each), lockup specs, color (swatches + continuous ramp
  strips + status pairs), type roles with live samples, voice do/don't with
  real example copy, surface rhythm. Skip: copy-paste code blocks (designers
  don't want them), fabricated sample data.

## Fresh-eyes revision round (optional)

Write a brief file in the repo: what the project is, how to view rendered
output, the task (full revision to a `revisions/` dir, originals untouched),
and the locked decisions spelled out precisely so the reviewer spends opinions
on layout/copy/gaps instead of relitigating. Afterward diff (strip base64
first), render both, and cherry-pick. Expect to reject: fabricated
testimonials/stats/pricing/team, accent-as-default, banned glyphs, fake
interactive UI. Expect to adopt: better copy lines, missing narrative beats,
structural ideas (sticky nav, FAQ), per-item reason lines.

## Handoff

End by staging durable assets in the repo (specs as self-contained HTML, the
mark as standalone SVG, fonts) plus an IMPLEMENTATION.md brief: canonical
references, non-negotiables, stack verification steps, and the user's process
rules (branching, no pushes without approval, screenshot-verified done).
