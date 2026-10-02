# The exploration-pass loop

## Setup

- Work in a scratchpad directory. It holds one `explorations.html`, which a
  generator script rebuilds each pass (a python heredoc works well), and a
  `fonts/` dir of woff2 files.
- Publish everything as a self-contained artifact. Inline the fonts as base64
  data URIs, because CSP blocks external hosts. Inline all CSS. Republish the
  same file path every pass, so the URL is stable and the user can follow on
  any device.
- Keep two artifacts with two jobs. The explorations page holds the history; if
  the user wants continuity, append passes to it. The prototype or toolkit page
  always shows the current state, and you can rebuild it freely.

## Anatomy of a pass

1. Generate options from code where possible. Parametric SVG beats
   hand-authored paths: n-point stars, arcs, masks, stroke geometry. Because
   the output is deterministic, "same but heavier" is easy to reproduce in the
   next pass.
2. Every mark tile shows the mark at ~96px, a size row (32px, 20px), and a
   mini nav lockup next to the wordmark. Weak marks die at 20px. Show it.
3. When candidates get serious, add real contexts: browser tab (~15px), round
   avatar, app icon with gradient, nav lockup, and an accent-colored variant.
   A mark that looks strong at large size can still fail here.
4. Serve locally (`python3 -m http.server`), take a screenshot in a real
   browser, and inspect the render. Common bugs to catch:
   - SVG groups pasted without an `<svg>` wrapper render nothing.
   - Mask ids collide between tiles. Prefix every id per tile.
   - A missing charset causes mojibake. Use entities.
   - A stale server on the port serves old files. Kill all `http.server`
     processes before you start. A server from a previous session that holds
     the port serves stale content, and your edits look ignored.
5. Publish. Then tell the user what is in the pass, and give your honest
   ranked read.

## Reading the user

- Terse picks ("w2, w9", "B is the winner") are the norm. Track the winners
  across passes, because they compound.
- "More experimental" or "crazy stuff" means new concepts, not parameter
  tweaks.
- If the user says "keep all of that", confirm which set they mean before you
  rebuild. If a correction arrives mid-build, recover the earlier state. The
  session transcript at ~/.claude/projects/<project>/<session>.jsonl contains
  every generator script that you ran. Grep it; do not rebuild it from memory.
- A reference image or screenshot from the user outranks your read of the
  render. They see things that you do not (uneven alignment, "eyes hurt").
- If they say that a thing is wrong ("still broken", "too dark"), fix it in
  small steps. Change one variable at a time, verify, and do not over-correct.

## Locking and convergence

- Maintain the locked list: typeface, mark geometry, tokens, voice. State it
  back at each convergence point, so drift is visible.
- The final mark ships with exact geometry (grid, ray lengths, stroke, caps,
  core, optical-centering offset). Then it can be regenerated, never redrawn.
- These toolkit sections earn their place:
  - the mark (geometry, clearspace, minimum sizes, surface variants)
  - misuse (rendered wrong versions, with a one-line reason each)
  - lockup specs
  - color (swatches, continuous ramp strips, status pairs)
  - type roles with live samples
  - voice do/don't with real example copy
  - surface rhythm

  Skip copy-paste code blocks (designers do not want them) and fabricated
  sample data.

## Fresh-eyes revision round (optional)

Write a brief file in the repo. It states what the project is, how to view the
rendered output, and the task: a full revision into a `revisions/` dir, with
the originals untouched. Spell out the locked decisions precisely, so the
reviewer spends opinions on layout, copy, and gaps and does not reopen them.
After the round, diff the output (strip base64 first), render both, and
cherry-pick.

- Expect to reject: fabricated testimonials, stats, pricing, or team sections;
  accent as default; banned glyphs; fake interactive UI.
- Expect to adopt: better copy lines, missing narrative beats, structural ideas
  (sticky nav, FAQ), and per-item reason lines.

## Handoff

End with durable assets staged in the repo: specs as self-contained HTML, the
mark as standalone SVG, and the fonts. Add an IMPLEMENTATION.md brief with the
canonical references, the non-negotiables, the stack verification steps, and
the user's process rules (branching, no pushes without approval,
screenshot-verified done).
