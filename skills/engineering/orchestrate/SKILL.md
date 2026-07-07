---
name: orchestrate
description: >
  Orchestrate multi-agent work. Use when dispatching subagents or parallel
  agents, running a workflow, fanning out over many files or chunks, mining,
  migrating, or auditing at scale, or choosing which model tier runs each
  stage.
---

# Orchestrate

Multi-agent work fails in predictable ways: one agent grading its own
homework, expensive models doing grunt work, subagents drowning in pasted
conversation history, and fleets of agents re-reading raw data a one-line
script could have filtered. The rules below are the judgment layer — they
apply whatever the dispatch mechanism (subagent tools, workflow scripts,
parallel sessions).

## Builder and critic never share incentives

Don't try to make one agent honest with itself. An agent that produced work —
or can see the reasoning that produced it — cannot fathom that the reasoning
was wrong; its second pass comes back suspiciously clean. Split the roles:

- The builder builds. The critic sees only the artifact (diff, spec, report)
  and its rubric — never the builder's reasoning or the orchestrator's opinion
  of the work.
- Give critics no edit tools where the mechanism allows it; report-only should
  be structural, not requested.
- For contested or load-bearing findings, make the critic adversarial: prompt
  it to *refute* the claim, not to confirm it. A finding that survives a
  genuine refutation attempt is worth acting on.

## Tier the models to the work

Match model strength to what each stage actually demands, not to what feels
respectful of the task:

- **Compile cheap.** Extraction, classification, per-chunk summarization, and
  any stage whose prompt fully specifies the job — cheapest capable tier, wide
  fan-out.
- **Judge expensive.** Synthesis across many reports, adversarial verification,
  and anything requiring taste or cross-cutting judgment — strongest tier,
  few agents.
- **One brain reads the result.** The orchestrator reads the final synthesis
  itself, once — it does not delegate its own conclusion, and it does not
  re-read the raw inputs the fleet already covered.

Defaulting every subagent to the orchestrator's own tier is the expensive
failure: a 25-agent fan-out at flagship pricing to do what a small model does
identically.

## Facts in, verdicts out

A subagent starts blank and returns a result — treat both ends strictly:

- **In:** exactly what the task needs — paste content into the prompt rather
  than having agents rediscover it; state the output format explicitly. Never
  conversation history, never your reasoning about the user's intent.
- **Out:** verdicts, findings, and facts. Reasoning chains, hedging, and
  narration from a subagent are contamination — specify a structured result
  and consume only that.

## Determinism before tokens

Before any agent reads anything, do the deterministic work with deterministic
tools:

- **Shrink the corpus first.** grep/jq/scripts filter gigabytes to the
  megabytes that matter; agents read the residue, never the raw pile. If a
  filter can be expressed as code, it is not an agent's job.
- **Known work-list → deterministic fan-out.** When the items are enumerable
  up front (files, chunks, findings), dispatch one agent per item from a
  script or loop you control. Model-driven "keep going until done" loops are
  for genuinely unknown-size discovery only.
- **Pin the chunking.** Split inputs to fit comfortably in a worker's context
  with room to think; a worker that got a truncated chunk returns confident
  garbage, not an error.

## Done when

- No agent read raw data a script could have filtered first.
- Every stage runs on the cheapest tier that can do it verbatim; judgment
  stages are the only expensive ones.
- No verdict came from an agent that saw the reasoning it was judging.
- Enumerable work-lists were fanned out by a script or loop you control, and
  every chunk fit its worker's context whole.
- The orchestrator formed the final conclusion itself, from the synthesis, in
  one read.
