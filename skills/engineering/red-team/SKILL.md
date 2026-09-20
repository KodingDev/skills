---
name: red-team
description: >
  Spawn an adversary that argues against a point you hold, run a short bout,
  and keep what survives. For decisions, designs, and plans that feel settled
  too fast.
disable-model-invocation: true
---

# Red team

A point that nobody has attacked is not settled. It is untested. One brain that holds a
position cannot see the hole in it: the reasoning that produced the position is the same
reasoning that checks it. So put the position in front of a second brain whose only job is to
break it, argue it out for a few rounds, and keep what is left standing. The argument is the
mechanism. Better ideas fall out of it.

The invocation names a point: a design choice, a plan, a claim about the code, a call the user
is about to make. If no point came, ask "what are we arguing about?" and stop. Do not pick one.

## Roles

**Blue** is the main session. Blue holds the point and defends it. Blue also runs the bout:
spawns red, relays rounds, calls the end, and writes the verdict.

**Red** is a subagent. Red has one goal: prove the point wrong, or find the strongest reason
that it is weaker than it looks. Red does not propose a full alternative unless the attack
needs one to land. Red never grades its own hits.

Red and blue never share incentives. Blue does not tell red what it hopes to hear. Red does
not soften a hit because blue is the one that spawned it.

## Spawn red

Pick the spawn by how much ground the argument needs:

- **Fork** (`subagent_type: "fork"`) when the point rests on things this session already
  learned: the codebase, the constraints, the user's taste. Red starts with the same ground
  as blue and no time is lost on catch-up. This is the default.
- **Fresh agent** when the point is load-bearing enough that shared context is a risk. A fork
  inherits blue's reasoning, and can inherit blue's blind spot with it. A fresh agent gets
  only the brief below and read access to the repo. Use fresh for a second bout after a fork
  came back too agreeable.

One red per bout. Do not fan out. Do not let red spawn its own agents. Red gets no edit
tools; if the mechanism permits it, say so in the brief.

Give red this brief, filled in:

```
You are the red team. Your job is to break the position below, not to improve it.

Position: <one or two sentences, stated as strongly as blue holds it>
Ground: <what is fixed and not up for argument: constraints, decisions already made>
Stakes: <what happens if the position is wrong>

Rules:
- Attack the position, not a weaker version of it. If you must restate it, restate it stronger.
- Every objection names a concrete failure: inputs, state, sequence, and what goes wrong.
- Rank objections by how much of the position they take down. Lead with the biggest.
- Read the code or docs before you assert what they do. Cite file:line.
- Concede an objection the moment it is refuted. Do not repeat it in other words.
- No hedges, no "it depends", no list of considerations. Say what breaks and why.

Return: objections ranked, each with its failure scenario and evidence.
```

## The bout

A bout is two to four rounds. One round is: red attacks, blue answers, both mark what moved.

**Blue answers honestly.** For each objection: refute it with evidence, concede it, or narrow
the position so it no longer applies. A concession is a win for the bout, not a loss for
blue. Do not defend a point because you stated it. Do not concede a point because red was
loud.

**Continue the same red.** Send the reply with `SendMessage` to the agent that made the
attack, so red keeps its own thread. A new red per round restarts the argument.

**Track the ledger in-thread.** After each round, hold a short list: objections refuted (with
the evidence), objections conceded (with what changed), objections still open. A round that
adds nothing to the ledger is the last round.

**Call it.** The bout ends when red has no objection that blue has not answered, when the
position has changed enough that it is a different position, or at round four. Do not run
until red agrees. Red is not supposed to agree.

## Verdict

Blue writes the verdict for the user. Short, and it stands on its own:

- **Position now.** The point as it stands after the bout, in one or two sentences. If it
  changed, say what it was and what it became.
- **What red won.** Each conceded objection and the change it forced.
- **What red lost.** The strongest refuted objection and the evidence that refuted it. One
  line each; the user needs to know the point was actually tested.
- **Still open.** Anything that neither side could settle from the repo. This is where the
  user's call lives.
- **Recommendation.** What blue would do now, and why.

The verdict is the deliverable. The user does not need the transcript. If the user asks for
it, give the ledger, not the raw rounds.

## What red-team is not

It is not a review. A review checks work against a bar; red-team checks a point against its
strongest opponent. Use `code-review` or `golden` for a diff.

It is not a second opinion. A second opinion is allowed to agree. Red is not.

It is not a way to avoid a decision. If the verdict leaves the point open, the point is the
user's to close. Say so and stop.
