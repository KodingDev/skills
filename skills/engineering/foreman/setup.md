# Setting up a program

Run this once, before the loop. The output is two thin files plus a Linear project. The
invariants live in SKILL.md — the files below hold only what varies per program. If a
line would be true of every program, it belongs in the skill, not the playbook: delete it.

## Inputs

You need a fixed plan before orchestration starts: an architecture spec, design reports,
or an approved plan document. Foreman executes a plan; it does not produce one. If no
plan exists, stop and plan first, then come back.

## 1 · Tracker project and tickets

Build the project with the user, not for them, in whatever issue tracker they use. Per
ticket:

- One vertical slice with a crisp acceptance line — a ticket a reviewer can hold in
  their head as one PR.
- Cite the spec sections that define its target shape — the workplan pastes from these.
- Encode real dependencies as blocked-by edges. These, plus lane disjointness, are the
  only scheduling constraints; do not invent phases.

Group tickets into lanes by file scope. Two tickets share a lane only when their file
scopes overlap; lanes run parallel, tickets within a lane run serial.

## 2 · PLAYBOOK.md

Location: with the plan docs (e.g. `plans/<program>/PLAYBOOK.md`). Contents — variables
only:

```
# Playbook — <program name>

## Ground truth
Spec documents and their authority order. What wins when spec and code disagree.

## Repos and branching
Repo paths; base branch; any submodule or environment trap that fails silently
(check these first, always).

## Lanes
Lane → tickets → file scope. Serial orders within lanes. Which milestone opens/closes
the program.

## Authorization (if any) and stop-and-ask
Any standing grant the user chooses to give (e.g. push branches and open PRs for these
tickets without per-PR approval), scoped to these tickets exactly; absent a grant,
normal approval rules apply. Per-instance approvals (deploys, anything
customer-visible). The stop-and-ask list: the specific situations where the foreman
stops — an unexplained behavior change, two lanes needing one file, a spec found
materially wrong, a ticket's real scope exceeding its brief.

## Verification recipes
Per slice type, what "verified" means and the evidence artifact it produces: the exact
suite commands, the screenshot set for visual slices, the before/after capture for perf
claims, known flakes and vacuous-pass traps. Keep tests scarce and load-bearing —
mechanism tests with shared builders, not fixture walls.
```

## 3 · WORKPLAN.md

One entry per ticket, a few lines each:

```
## T<n> · <ticket-id> · <title> — spec: <sections>
**Files:** exhaustive scope.
**Shape:** commit/PR structure and fan-out guidance (workers per what).
**Done-when extras:** deltas beyond the ticket's acceptance line.
**Traps:** ticket-specific forbiddens and known landmines.
```

End the file with a `## Standing deltas` section, empty at start. Review feedback that
changes a target shape gets appended here, dated, so later tickets inherit it.

## 4 · Kickoff

Write the kickoff prompt for the orchestrator session and hand it to the user. It says:
invoke `/foreman`, read PLAYBOOK.md then WORKPLAN.md, confirm understanding of the lanes
and first schedule in a few sentences, verify preconditions, open the first unblocked
tickets, run the loop. Include how the user wants milestone notifications (each PR
opened, each merge, any blocker — not routine progress).

If the playbook carries a standing authorization, get the user's explicit sign-off on
it before the first push.
