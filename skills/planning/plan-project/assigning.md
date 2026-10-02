# Assigning

Propose who takes each ticket. An assignment is a **proposal for the user to approve**, not a decree. You match work to people from incomplete information. The user owns the final call and the one fact that you cannot see: capacity.

## Inputs

- **Roster** (from the user): names, strengths, and **rough current load**. This is the authoritative source. If there is no roster, do not invent one. Use role-shaped assignment (below).
- **Git-history ownership signal** (when a repo is present): who has committed to the code that a ticket touches. `git -C <repo> shortlog -sne --no-merges -- <path>` shows the owners of the area. This is an *expertise* signal, not a capacity signal.

**Never fabricate capacity.** If the user did not say how loaded someone is, you do not know it. Ask, or assign by fit and flag the load question. An invented "Melody has bandwidth" makes the whole plan untrustworthy.

## Match on three axes

1. **Expertise**: who knows this code or domain. The git-history owner is the cheapest correct answer. By default, a ticket in a module that one person has always owned goes to that person.
2. **Capacity**: who has room, per the user's roster. A perfect-fit owner who is overloaded is the wrong pick. The work waits or moves.
3. **Growth and spread**: sometimes assign *away* from the obvious owner to spread knowledge. This addresses the real risk, the bus factor.

## Bus factor

A **bus-factor-1** area, where only one person has ever touched the code, is a delivery risk, not a staffing note. Surface it explicitly: "auth is bus-factor-1 (only Stella); these three tickets all sit in it." Offer options: pair a second person in, sequence a slice that spreads knowledge early, or accept the risk consciously. Do not give all of an owner's tickets back to them because the git signal is clear. That deepens the bus factor.

## WIP limits

Cap how much each person has **in progress**, not how much is assigned. Work in progress is where throughput dies: someone with six started tickets finishes none. Default to a small WIP (1-2 active per person on a small team), and keep the rest in the ordered backlog. If the sequence (Stage 3) and the roster cannot both be satisfied, that is a real finding. Say so. Do not hide it by overloading people.

## Single-owner vs swarm

- **Single-owner**: the default. One person owns a ticket end-to-end, with clean accountability.
- **Swarm**: several people work on one high-priority or high-risk ticket to land it fast. Use it rarely: for a critical-path blocker that holds up everyone else, or a tracer bullet that must be proven before fan-out. To swarm everything hides poor slicing.

## No roster: role-shaped assignment

Without names, tag each ticket with the **profile** that it needs, not a person:

```
PSY-210  Per-mode proficiency data
  needs: owner of the proficiency/stats module (backend) + a frontend dev for the read UI
  bus-factor: stats module currently single-owner - flag before starting
```

The user maps profiles to people. The plan stays useful without an invented team.

## Done: checklist

- [ ] Every ticket has a proposed owner, or a role profile when no roster exists.
- [ ] Where a repo is present, expertise picks use the git-history owner.
- [ ] No owner is loaded past the capacity that the user gave. Capacity is never invented.
- [ ] Bus-factor-1 areas are flagged with a concrete option, not only noted.
- [ ] WIP is capped per person. A conflict between sequence and capacity is surfaced.
