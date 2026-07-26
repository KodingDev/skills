# Symptom → check catalog

Two families. **Code slop** is what the agent wrote; **context rot** is what
the agent read. Rot is the quieter and usually the real reason "the AI won't
listen" — audit it first. For each symptom: the tell that confirms it, and
the check that kills it. A symptom without its check installed will recur.

## Context rot

**Stale structural claims.** The rules file says 11 packages; the tree has
16, and the largest arrival is mentioned nowhere. *Tell:* count anything an
orienting doc counts. *Check:* a test that derives the number from the tree
and fails when the doc disagrees — never hand-write a count.

**Dead paths.** README layout blocks, `exports` targets, or import examples
pointing at files a refactor deleted. *Tell:* resolve every path a doc or
manifest names. *Check:* CI resolves every `exports`/path claim; contract
data validates against its schemas.

**The plan graveyard.** Completed plans in present tense ("Problems: no
service interfaces" — all fixed months ago), agent scratch committed beside
live specs. Any agent reading the repo root is now being lied to. *Tell:*
plans with no status field. *Check:* status header required; scratch
directories gitignored; plans deleted on merge or moved to the tracker.

**The scar log.** A rules file that only ever grows — one appended line per
past annoyance, including bans on things the docs themselves hallucinated.
Nothing is retired, so every rule dilutes the rest. *Tell:* prohibitions with
no matching lint rule. *Check:* every prohibition becomes a deterministic
check or gets deleted; the rules file has a word budget, not a growth habit.

**Dead enforcement rituals.** Lint/test scripts no CI invokes; suppression
comments in directories the linter ignores; a "mandatory" size cap with
dozens of live opt-outs. Enforcement theater — worse than nothing, because it
reads as covered. *Tell:* diff what the scripts promise against what the CI
workflow actually runs. *Check:* CI runs the floor (lint + typecheck + test)
everywhere; suppressions for inactive rules are themselves lint errors;
opt-outs are capped and each carries a tracking reference.

**The misaimed gate.** Enforcement that runs but points at a convention
nobody follows — the branch-name regex arm matching zero live branches, the
required check exempting the directory where the work happens. It passes
forever, so it never gets questioned. *Tell:* for each gate, find the last
time it actually rejected something. *Check:* align the gate to the observed
convention (or the convention to the gate — pick one); a gate that has never
fired is either misaimed or unnecessary.

**Process theater.** The tracker is a map agents read, and it can rot like
any doc: cycles that complete nothing and get emptied retroactively, WIP
triple the stated limit, statuses frozen in-flight for months, labels the
operating model describes that don't exist. *Tell:* compare what the process
docs claim against what the tracker data shows actually ran. *Check:* run the
ritual honestly or delete it — no silent theater; a strategy pivot the work
already made gets recorded in one short status update, or escalated as a
decision the owner must make now.

**Repo-level forking.** `thing.old/` beside `thing/`; a second full checkout
serving as a long-lived branch, carrying uncommitted work that can neither be
reviewed nor cleanly lost. *Tell:* sibling directories sharing a name or a
history. *Check:* branches and worktrees; nothing that duplicates a repo
outlives the week.

**Fix-spam seams.** Five-plus consecutive one-line fixes to one subsystem —
code generated against a spec it didn't understand, converged by trial.
*Tell:* read the git log per scope, not per repo. *Check:* a characterization
test at that seam before the next fix, not after the next regression.

## Code slop

**Sibling duplication.** The same retry loop byte-identical in three
fetchers; five ad-hoc HTTP clients with three timeout policies while the
shared constructor sits unused. Agents inline instead of reuse — the call
graph loses its reuse edges. *Tell:* jscpd / dupl at a low threshold; grep
for the constructor the copies bypass. *Check:* duplication gate in CI at
today's baseline, ratcheting down; second implementation of an existing
concern reuses the first or deletes it.

**God functions and files.** The 300-line function doing validation, writes,
notifications, and business logic; the 1,700-line manager. *Tell:* size
outlier listing. *Check:* `max-lines-per-function` / `max-lines` as errors —
with the opt-out count capped, or the budget becomes paperwork.

**Defensive spam.** try/catch around code that can't fail meaningfully,
null-checks before every access, swallowed errors, bare excepts — web-app
reflexes pasted into every domain. *Tell:* catch-blocks per KLOC. *Check:*
no-empty / no-useless-catch / bare-except bans; every surviving catch-all
carries a one-line why.

**Comment narration.** Comments restating the next line, section-divider art,
boilerplate docstrings — chain-of-thought leaked into the file. *Tell:*
comment density *plus judgment*: dense comments encoding non-obvious domain
semantics are load-bearing and stay; narration goes. *Check:* decorative
divider bans lint-side; narration dies in review and its pattern joins the
golden examples.

**Speculative surface.** A public barrel exporting twenty symbols where a
third have zero consumers outside the demo page that exists to demo them.
*Tell:* knip / ts-prune / deadcode, with demo and gallery code excluded from
usage counts. *Check:* unused-export gate at baseline; a public export
requires a real consumer.

**Convention drift.** Three ways to fetch, two state managers, mixed naming —
each new file mimicking a different ancestor, so inconsistency compounds.
*Tell:* pick one job (fetching, errors, state) and list its implementations.
*Check:* boundary/import lint rules for what's mechanical; one golden example
per pattern for what isn't — the agent copies what it reads.

**Suppression escapes.** `any`, `@ts-ignore`, bare `oxlint-disable` /
`#pragma` — each one a rule silently repealed. *Tell:* count them; then read
whether they carry reasons. *Check:* justified-suppression rule — a disable
without `-- <reason>` is itself an error; blanket ignores scoped to vendored
code only.

**AI tells.** Em-dashes in string literals, decorative comment dividers,
apologetic naming (`newHelper2`, `improvedUtils`). Cosmetic, but they mark
passages nobody read after generation — grep them to find the unread code.
*Tell/Check:* cheap custom lint rules; a banned-token rule is ~20 lines and
permanent.
