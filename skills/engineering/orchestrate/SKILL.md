---
name: orchestrate
description: >
  Orchestrate multi-agent work. Use when dispatching subagents or parallel
  agents, running a workflow, fanning out over many files or chunks, mining,
  migrating, or auditing at scale, or choosing which model tier runs each
  stage.
---

# Orchestrate

Multi-agent work fails in known ways: one agent grades its own work, expensive models do
simple work, subagents drown in pasted conversation history, and fleets of agents read raw
data that a one-line script can filter. The rules below are the judgment layer. They apply
to each dispatch mechanism: subagent tools, workflow scripts, and parallel sessions.

## Builder and critic never share incentives

Do not try to make one agent honest with itself. An agent that produced work, or that can see
the reasoning behind it, cannot see that the reasoning was wrong. Its second pass comes back
clean, and that is a warning sign. Split the roles:

- The builder builds. The critic sees only the artifact (diff, spec, report) and its rubric.
  The critic never sees the builder's reasoning or your opinion of the work.
- If the mechanism permits it, give critics no edit tools. Make report-only structural, not
  requested.
- For contested or load-bearing findings, make the critic adversarial. Tell it to *refute*
  the claim, not to confirm the claim. If a finding survives a genuine refutation attempt,
  act on it.

## Tier the models to the work

Match model strength to what each stage demands, not to what feels respectful of the task:

- **Compile cheap.** Use the cheapest capable tier, with wide fan-out, for extraction,
  classification, per-chunk summarization, and each stage whose prompt fully specifies the
  job.
- **Judge expensive.** Use the strongest tier, with few agents, for synthesis across many
  reports, for adversarial verification, and for each task that needs taste or cross-cutting
  judgment.
- **One brain reads the result.** Read the final synthesis yourself, one time. Do not
  delegate your own conclusion. Do not read again the raw inputs that the fleet covered.

The expensive failure is to give each subagent your own tier: a 25-agent fan-out at flagship
prices for work that a small model does the same.

## Facts in, verdicts out

A subagent starts blank and returns a result. Control both ends:

- **In:** give exactly what the task needs. Paste content into the prompt. Do not make agents
  discover it again. State the output format. Never send conversation history. Never send
  your reasoning about the user's intent.
- **Out:** accept verdicts, findings, and facts. Reasoning chains, hedges, and narration from
  a subagent are contamination. Specify a structured result and consume only that.
- **Persist before you synthesize.** Write fleet findings to a file as they land; a
  compaction must not lose what the fleet paid for.
- **Reap what you spawned** when a stage closes: agents, dev servers, shells, worktrees.

## Determinism before tokens

Before an agent reads anything, do the deterministic work with deterministic tools:

- **Shrink the corpus first.** Use grep, jq, or scripts to filter gigabytes down to the
  megabytes that matter. Agents read the residue, never the raw pile. If code can express the
  filter, the filter is not the job of an agent.
- **Known work-list → deterministic fan-out.** If you can enumerate the items up front
  (files, chunks, findings), dispatch one agent per item from a script or loop that you
  control. Use model-driven "continue until done" loops only for discovery of unknown size.
- **Pin the chunking.** Split the inputs so that each chunk fits in the context of a worker,
  with room to think. A worker that got a truncated chunk returns confident garbage, not an
  error.

## Done when

- No agent read raw data that a script can filter first.
- Each stage runs on the cheapest tier that can do it. Only the judgment stages are
  expensive.
- No verdict came from an agent that saw the reasoning that it judged.
- A script or loop that you control fanned out each enumerable work-list. Each chunk fit
  whole in the context of its worker.
- You formed the final conclusion yourself, from the synthesis, in one read.
