# Symptom -> check catalog

There are two families. **Code slop** is what the agent wrote. **Context rot** is what the
agent read. Rot is quieter, and it is usually the real reason that "the AI won't listen".
Audit it first. Each symptom has a tell that confirms it and a check that kills it. A symptom
without its check installed recurs.

## Context rot

**Stale structural claims.** The rules file says 11 packages. The tree has 16, and no doc
mentions the largest new package. *Tell:* count each thing that an orienting doc counts.
*Check:* a test derives the number from the tree and fails when the doc disagrees. Never
hand-write a count.

**Dead paths.** README layout blocks, `exports` targets, or import examples point at files
that a refactor deleted. *Tell:* resolve each path that a doc or manifest names. *Check:* CI
resolves each `exports` or path claim. Contract data validates against its schemas.

**The plan graveyard.** Completed plans stay in the present tense ("Problems: no service
interfaces", all fixed months ago). Agent scratch sits committed beside live specs. Each agent
that reads the repo root gets false information. *Tell:* plans with no status field. *Check:*
a status header is required. Scratch directories are gitignored. A plan is deleted on merge
or moved to the tracker.

**The scar log.** A rules file only grows: one appended line per past annoyance, including
bans on things that the docs hallucinated. Nothing retires, so each rule dilutes the rest.
*Tell:* prohibitions with no matching lint rule. *Check:* each prohibition becomes a
deterministic check or is deleted. The rules file has a word budget.

**Dead enforcement rituals.** No CI invokes the lint or test scripts. Suppression comments
sit in directories that the linter ignores. A "mandatory" size cap has dozens of live
opt-outs. This enforcement theater is worse than nothing, because it reads as coverage.
*Tell:* diff what the scripts promise against what the CI workflow runs. *Check:* CI runs the
floor (lint + typecheck + test) in each repo. A suppression for an inactive rule is a lint
error. Opt-outs are capped, and each carries a tracking reference.

**The misaimed gate.** A gate runs but points at a convention that nobody follows. Examples:
a branch-name regex arm that matches zero live branches, or a required check that exempts the
directory where the work happens. It passes forever, so nobody questions it. *Tell:* for each
gate, find the last time it rejected something. *Check:* align the gate to the observed
convention, or the convention to the gate. Pick one. A gate that never fired is misaimed or
unnecessary.

**Process theater.** The tracker is a map that agents read, and it rots like any doc. Cycles
complete nothing and are emptied after the fact. WIP is triple the stated limit. Statuses
stay frozen in flight for months. The operating model describes labels that do not exist.
*Tell:* compare what the process docs claim against what the tracker data shows ran.
*Check:* run the ritual honestly or delete it. No silent theater. If the work already made a
strategy pivot, record it in one short status update. Or escalate it as a decision that the
owner must make now.

**Repo-level forking.** `thing.old/` sits beside `thing/`. A second full checkout serves as a
long-lived branch. It carries uncommitted work that nobody can review and nobody can cleanly
lose. *Tell:* sibling directories that share a name or a history. *Check:* use branches and
worktrees. Nothing that duplicates a repo lives past the week.

**Fix-spam seams.** Five or more consecutive one-line fixes hit one subsystem. The code was
generated against a spec that the agent did not understand, and trial and error converged it.
*Tell:* read the git log per scope, not per repo. *Check:* add a characterization test at that
seam before the next fix, not after the next regression.

## Code slop

**Sibling duplication.** The same retry loop is byte-identical in three fetchers. Five ad-hoc
HTTP clients have three timeout policies, and the shared constructor sits unused. Agents
inline instead of reuse, so the call graph loses its reuse edges. *Tell:* jscpd or dupl at a
low threshold. Grep for the constructor that the copies bypass. *Check:* a duplication gate in
CI at the baseline of today, which ratchets down. A second implementation of an existing
concern reuses the first or deletes it.

**God functions and files.** A 300-line function does validation, writes, notifications, and
business logic. A manager file has 1,700 lines. *Tell:* a size outlier listing. *Check:*
`max-lines-per-function` and `max-lines` as errors, with the opt-out count capped. Without the
cap, the budget becomes paperwork.

**Defensive spam.** try/catch wraps code that cannot fail meaningfully. Null-checks come
before each access. Errors are swallowed. Bare excepts appear. These are web-app reflexes
pasted into each domain. *Tell:* catch-blocks per KLOC. *Check:* no-empty, no-useless-catch,
and bare-except bans. Each catch-all that stays carries a one-line why.

**Comment narration.** Comments restate the next line. Section-divider art and boilerplate
docstrings appear. This is chain-of-thought leaked into the file. *Tell:* comment density
*plus judgment*. Dense comments that encode non-obvious domain semantics are load-bearing and
stay. Narration goes. *Check:* lint bans decorative dividers. Narration dies in review, and
its pattern joins the golden examples.

**Speculative surface.** A public barrel exports twenty symbols. A third of them have zero
consumers outside the demo page that exists to demo them. *Tell:* knip, ts-prune, or
deadcode, with demo and gallery code excluded from usage counts. *Check:* an unused-export
gate at baseline. A public export requires a real consumer.

**Convention drift.** The code has three ways to fetch, two state managers, and mixed naming.
Each new file mimics a different ancestor, so inconsistency compounds. *Tell:* pick one job
(fetching, errors, state) and list its implementations. *Check:* boundary and import lint
rules for what is mechanical. One golden example per pattern for what is not. The agent
copies what it reads.

**Suppression escapes.** `any`, `@ts-ignore`, bare `oxlint-disable` or `#pragma`: each one
silently repeals a rule. *Tell:* count them. Then read whether they carry reasons. *Check:* a
justified-suppression rule. A disable without `-- <reason>` is an error. Blanket ignores are
scoped to vendored code only.

**AI tells.** Em-dashes in string literals, decorative comment dividers, and apologetic
naming (`newHelper2`, `improvedUtils`). They are cosmetic, but they mark passages that nobody
read after generation. Grep them to find the unread code. *Tell/Check:* cheap custom lint
rules. A banned-token rule is about 20 lines and permanent.
