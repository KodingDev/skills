---
name: canon
description: >
  Canon-over-headcanon discipline for understanding an existing system: it is
  deterministic, there is always a pointer, there is always a source, and it
  was built the smart generic way. Use when reimplementing or porting a
  reference or decompiled implementation, when reading a library, runtime, or
  serialized format from the outside, when a fix drifts toward
  a hardcoded value, a name-matching heuristic, a carve-out, or a new bespoke
  subsystem, or when the user says "canon", "headcanon", "no magic", "not
  special", or "follow the pointer".
---

# Canon

Golden governs what you build. Canon governs what you study: the reference you
port, the library you read, the bug you chase. The system in front of you is a
deterministic machine. Every behavior it shows has exactly one mechanism, the
mechanism is generic, and the mechanism is already written down — in the
source, in the data, in the format. That record is canon. A story about what
the system might do is headcanon, and headcanon is not a finding.

## The creed

**It is deterministic.** Same input, same path, same output, every run.
"Weird", "flaky", and "sometimes" describe your visibility, not the machine.
When behavior differs between two runs or two objects, an input differs. Diff
the inputs until you hold the one that differs.

**There is always a pointer.** Data reaches data through stored links: an
import table, an object path, an ID, an offset, a foreign key. Start from a
known root and resolve the chain, link by link. A constructed path — string
templating, a naming convention, a guessed directory layout — is a guess
wearing the costume of a lookup: right until the first entry that breaks the
pattern, and that break is a bug you wrote. The resolved pointer is right for
the same reason the system is right: it reads the same bytes. A key into a
keyed table is not a constructed path; the smell is an assembled location
where the system stores a reference.

**There is always a source.** Every value and behavior you reproduce is defined
upstream: the reference code, the format spec, the system's own
implementation, the actual bytes. A fix cites its source. A transform that the reference never
performs does not enter the port because the output "looks wrong" — the
discrepancy enters somewhere real, and the work is to find where.

**It was built the smart way.** Libraries, runtimes, and formats are golden
systems: generic machinery, variation as data. If your model of the system requires it to be
hacky, your model is wrong — not the system. The case in front of you rides
the same generic mechanism as every case beside it. The system has no
subsystem for it, so your model of the system has none either.

## Smells: headcanon

Each of these is the shape of a mechanism you invented instead of found. Each
pairs with its canon replacement.

- **The constructed path.** A lookup assembled from a naming convention,
  because the stored reference looked opaque. Replace with pointer resolution
  from a known root. One resolver retires the whole bug class.

- **The invented taxonomy.** Classifying entries by matching names, prefixes,
  or substrings, when the system stores the real classification — a type
  field, an archetype, the structure it files things under. A word-list
  classifier is a convention guess plus a maintenance burden. Replace with the
  stored classification, read from where the system reads it.

- **The invented correction.** A conversion, offset, or fudge factor the
  reference never performs, added because the output "looks wrong". Replace
  with a trace of both pipelines to the exact site where the values diverge.
  The divergence is never "for no reason".

- **The downstream patch.** A consumer branch that compensates for a wrong
  value emitted by a producer you control. The authority is upstream: fix the
  producer, and every consumer mirrors it for free. A compensation in one
  consumer leaves the wrong value live for the next.

- **The bespoke subsystem.** A new type, node kind, or system minted for the
  one case that misbehaved. The mechanism was always generic; the bug lives in
  the data it read — a stale link, a wrong flag. Replace with the generic
  mechanism plus the case as data.

- **The accumulating cutouts.** A per-entry override list that grows as you
  patch. Each cutout is your theory failing once. At the second cutout, stop
  patching: the theory is wrong. Return to the mechanism question below.

## Contrast

Guessed: the path is assembled from a convention and hopes it holds. Every
entry that deviates becomes an override:

```ts
const OVERRIDES: Record<string, string> = {
  // grows forever: each entry is the convention failing once
}

function assetFor(row: Row) {
  return OVERRIDES[row.name] ?? `assets/${row.name}.dat`
}
```

Read: the row already stores the pointer, because the system needed it too.
Resolve it the way the system does, and the whole apparatus — the helper, the
override table, the convention — dissolves into a call at the use site:

```ts
const asset = resolve(row.assetRef)
```

## The loop

When behavior surprises you:

1. Ask the mechanism question: "what code or data decides this?" — never "what
   do I add to compensate?"
2. Locate the thing that decides it — reference file, upstream source, spec,
   bytes — and read it.
3. Follow the pointers from a known root down to the concrete failing case.
4. Only then change something. The diff cites a source for every value,
   transform, and path it introduces.

"Unknown mechanism" is a finding, not an exit. Before you name one, show the
first divergence point: where the real system and yours part ways.

## Done when

- Every claim about the system cites where the system says it: a `file:line`,
  a byte offset, a table entry.
- The diff contains no value or transform you cannot trace to a source.
- Every lookup resolves a stored pointer. No path or key in the diff was
  constructed from a convention.
- Case behavior flows as data through generic machinery. No new type exists
  for one case.
- Every value is corrected at the producer that owns it. No consumer
  compensates downstream for an upstream authority you control.
- Anything still unexplained is named as an unknown mechanism — not patched
  around.
