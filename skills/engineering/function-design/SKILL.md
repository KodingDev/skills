---
name: function-design
description: >
  Designs and reviews individual functions for explicit dependencies, meaningful
  contracts, and one level of abstraction. Use when the user asks to improve a
  specific function or method, mentions a hidden dependency, an honest function,
  mixed abstraction levels, or "the perfect function", or wants Logan Smith's
  function-design methodology applied. For module-level or whole-diff shape,
  prefer golden.
---

# Function design

Make a function understandable from its contract and locally understandable in
its implementation. Three questions drive the work: what does it depend on,
what does its signature promise, and at what level does its body speak?

This is a lens for judgment, not a rulebook. Two reasonable engineers can draw
the lines differently. Present each finding as a tradeoff with a concrete cost,
not as a violation. A review request produces findings, not a refactor.

## 1. Make dependencies honest

An honest function reaches caller-controlled state only through its arguments,
including its receiver (`this`). Honest is not pure: in-place sorting and an
explicitly supplied stateful PRNG are honest. Do not impose purity by accident.

- Trace reads and writes through callees, callbacks, getters, and imported helpers.
  A clock, singleton, environment read, or global RNG hidden one call deep is
  still hidden. `const` does not make an object immutable.
- Aim for functional core, imperative shell. Pass a time value or config snapshot
  when that is enough; inject a narrow capability when the operation must interact.
- Keep framework hooks as thin adapters over ordinary functions.
- Separate computing a result from acting on it. When the result is expensive to
  materialize, return an iterator or take a caller-supplied consumer.
- Injection makes an effect explicit and replaceable, not deterministic. State
  what a callback or capability must guarantee.

## 2. Make the signature useful to its caller

Read a real call site before settling the API. The caller must see the required
inputs, meaningful outcomes, and important preconditions without reading the body.

- Replace ambiguous positional values with domain types or a purpose-built options
  object. An options bag that hides six responsibilities is not a fix.
- Ask only for what the operation needs: a field, not the entity; an iterable, not
  a concrete container; a narrow capability, not a service locator.
- Parse, don't validate: make illegal states unrepresentable with validated types
  such as normalized vectors, parsed config, or distinct IDs. Validate once at the
  boundary, then trust the type.
- Represent meaningful failure in the project's error convention. Keep "missing"
  distinct from "no" when callers care. Never terminate the process from a lookup.
- Use typestate or a receipt to encode required ordering. The receipt must prove the
  right object in its current state, not merely that a call happened once.
- Add a type for a real misuse risk, not for every conceivable precondition.

Read [examples.md](references/examples.md) before encoding an invariant in a type.
It covers the construction escape hatches in TypeScript and C#.

## 3. Stay at one level of abstraction

Apply the stepdown rule: outline the function in domain terms, then compare the
outline with the body. Each operation is a peer at the level the name promises.

- Extract a detail when the reader must zoom in and back out. A body that normalizes
  text, binary-searches, and decides business policy is the classic signal.
- Name a useful operation even with one caller. A pass-through alias needs another
  reason, such as a domain boundary or an interface adaptation.
- Prefer an existing algorithm with the right semantics. Do not ban loops.
- When several functions coordinate one invariant, move it into a data structure.
  A case-insensitive index owns normalization and lookup together.
- Keep useful glue. `stepOne(); stepTwo();` with empty names hides the problem
  instead of fixing it. No line limit or complexity score proves a consistent level.

## Report

Write each material finding in this shape:

<template>
**`path:line` — <short name>**
Gap: <hidden dependency, contract gap, or level mix>
Cost: <concrete failure or change scenario it causes>
Fix: <smallest useful correction>
</template>

Drop a finding that has no concrete cost. When you implement fixes, test the
invariants and boundary behavior, not the helper layout.

Use [tooling.md](references/tooling.md) only when the user asks for enforcement.

Done when:

- [ ] Every function in scope got all three questions.
- [ ] Every finding names a concrete cost, not only a principle.
- [ ] No finding claims a linter proves abstraction or a type proves its constructor's math.

## Source

Distilled from Logan Smith's [How to write the perfect function](https://youtu.be/2OMRWPOSw9s):
[honesty, 11:12](https://youtu.be/2OMRWPOSw9s?t=672),
[signatures, 26:00](https://youtu.be/2OMRWPOSw9s?t=1560), and
[abstraction, 37:33](https://youtu.be/2OMRWPOSw9s?t=2253).
The references contain original applications and corrections, not a transcript.
