# Assigning

Propose who takes each ticket. Assignment is a **proposal for the user to approve**, not a
decree — you're matching work to people from incomplete information, and the user owns the final
call and the one fact you can't see: capacity.

## Inputs

- **Roster** (from the user) — names, strengths, and **rough current load**. This is the
  authoritative source. No roster → don't invent one; fall back to role-shaped assignment below.
- **Git-history ownership signal** (when a repo is present) — who has actually committed to the
  code a ticket touches. `git -C <repo> shortlog -sne --no-merges -- <path>` shows the area's
  owners. This is an *expertise* signal, not a capacity signal.

**Never fabricate capacity.** If the user didn't say how loaded someone is, you don't know it —
ask, or assign by fit and flag the load question. Inventing "Melody has bandwidth" is the one
move that makes the whole plan untrustworthy.

## Match on three axes

1. **Expertise** — who knows this code/domain. The git-history owner is the cheapest correct
   answer; a ticket in a module one person has always owned goes to them by default.
2. **Capacity** — who has room, per the user's roster. A perfect-fit owner who's overloaded is
   the wrong pick; the work waits or moves.
3. **Growth / spread** — sometimes assign *away* from the obvious owner to spread knowledge.
   Which brings up the real risk:

## Bus factor

A **bus-factor-1** area — one person is the only one who's ever touched it — is a delivery risk,
not just a staffing note. Surface it explicitly: "auth is bus-factor-1 (only Stella); these three
tickets all sit in it." Options to offer: pair a second person in, sequence a knowledge-spreading
slice early, or accept the risk consciously. Don't silently pile all of an owner's tickets back
onto them just because the git signal is unambiguous — that deepens the bus factor.

## WIP limits

Cap how much is **in progress** per person, not how much is assigned. Work-in-progress is where
throughput dies: someone with six started tickets finishes none. Default to a small WIP (1–2
active per person on a small team) and let the rest sit in the ordered backlog. If the sequence
(Stage 3) and the roster can't both be satisfied, that's a real finding — say so, don't paper
over it by overloading.

## Single-owner vs swarm

- **Single-owner** — default. One person owns a ticket end-to-end; clean accountability.
- **Swarm** — several people converge on one high-priority or high-risk ticket to land it fast.
  Use sparingly: for a critical-path blocker holding up everyone else, or a tracer bullet you
  want proven before fanning out. Swarming everything just hides poor slicing.

## No roster — role-shaped assignment

Without names, tag each ticket with the **profile** it needs instead of a person:

```
PSY-210  Per-mode proficiency data
  needs: owner of the proficiency/stats module (backend) + a frontend dev for the read UI
  bus-factor: stats module currently single-owner — flag before starting
```

The user maps profiles to humans. This keeps the plan useful without inventing a team.

## Done — checklist

- [ ] Every ticket has a proposed owner, or a role profile when no roster exists.
- [ ] Expertise picks lean on the git-history owner where a repo is present.
- [ ] No owner is loaded past the capacity the user gave; capacity is never invented.
- [ ] Bus-factor-1 areas are flagged with a concrete option, not just noted.
- [ ] WIP is capped per person; an unsatisfiable sequence-vs-capacity conflict is surfaced.
