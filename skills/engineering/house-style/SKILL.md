---
name: house-style
description: >
  The style for writing good code: the review bar that every change is
  written to and checked against, from the shape of a change down to names,
  comments, and commit messages. Use when writing or reviewing code, when opening or
  updating a pull request, or when the user says "house style", "my
  standards", or "nitpicks".
---

# House style

The review bar for every change. Write to it, and before you open or update a pull request, check every changed hunk against every rule that applies to it.

Three sibling skills carry the principles this file builds on. Apply them on every change:

- `golden` for the shape of what you build.
- `canon` for how you study the system you change.
- `function-design` for each function's dependencies, signature, and abstraction level.

Language rules live in references. Read the one for each language in the diff before you write or review it:

- TypeScript and JavaScript: [`references/typescript.md`](references/typescript.md).
- React and UI code: [`references/react.md`](references/react.md), with the TypeScript file.

## Authority

- This style is the authority. Existing code is not precedent: code that shipped fast is often below this bar.
- Every hunk that a change touches meets this style in full.
- A change reworks the code it touches into its intended shape, even when the diff grows.
- A cleanup of existing code goes in its own commit, on the same pull request.
- Where this style is silent, pick the plain shape.

## Shape of a change

- State the intended end state in one or two sentences before you write code. Build that state, as if the intended UX and architecture existed from day one.
- Search for real callers before you keep anything for compatibility. A mode, prop, wrapper, route alias, or fallback with no caller is deleted.
- One clear component or flow replaces mode flags. Split at a real boundary: state, layout, controls, or domain commands.
- Each shared rule lives in one place: feature flags, permissions, route gating, URL state, command naming, and every constant that more than one file uses.
- Scope the rework to what makes the final shape coherent.
- Name things for product intent. Implementation history stays in git.

## Deep modules

- A module is deep: a lot of behaviour behind a small interface. A shallow module, with an interface nearly as large as its implementation, merges into its caller or gets deeper.
- The interface is everything a caller must know: the signature, invariants, ordering, error modes, and performance.
- The interface is the test surface. A consumer that reaches inside means that the seam is in the wrong place.
- One adapter is a hypothetical seam. Two adapters is a real one. Add a port or an injection point when two implementations exist, typically production and test.
- Internal seams stay internal, even when tests use them.
- A module lives with the domain it serves. Code that fetches data holds only fetching. A domain rule, such as how ids roll up to a parent, lives with its domain.
- A package export path exposes a domain entry point.

## Data from the source

- Fix a wrong value at its producer: the pipeline, the API, the contract. A consumer shows what the source says, without case transforms, plain-text strippers, or replacement tables.
- A consumer uses only data that its producer emits.
- Domain terms stay as the source names them. When one looks wrong, a comment says that the source calls it this.
- Fetch in bulk, then look up. One call per entity is a loop of round trips.
- A feature toggle or an env flag exists only while it has a reason to be off.

## Control flow

- Return early. The happy path runs at the lowest indent.
- A ternary has two leaves. Three or more branches become early returns or a lookup.
- A ternary replaces an `if`/`else` that assigns or returns one of two values.
- A lookup is a map or a record. Related lookups share one object, keyed by one key.
- A pass-through (a wrapper that only forwards) is deleted, and its caller calls the real thing.
- A repeated guard becomes one helper that checks and fails, such as `ensurePermissions`.
- A framework response uses the framework helper: `forbidden()`, `notFound()`.

## Breathing room

- Prefer more lines and more named variables to a dense one-liner. An `await` gets its own variable before it enters a condition.
- A complex condition becomes a named boolean.
- A body splits into sections, with one blank line between sections.
- A value is built field by field. One response is never spread into another to merge them.

## Names

- A boolean variable or predicate is a question: `isVisible`, `hasItems`, `canSubmit`. A boolean prop follows the platform: `open`, `disabled`, `checked`.
- A count ends in `Count`: `savedCount`, `failedCount`.
- Event props are `onX`. The function behind one is named for the action, such as `selectItem`.
- A file is named for what it holds: `retry-policy.ts`, `date-range.ts`. Generic buckets (`utils`, `helpers`, `constants`, `types`) do not exist.

## State

- Values are immutable by default. Mutation applies only to values that the function created and that stay inside it, such as a local counter or a builder set. Arguments, module-level values, and anything the caller can see stay unchanged.
- A class is for a stateful thing with a lifecycle: a cache, a player, a connection. It owns private state, invariants, and disposal. Stateless code is plain functions.

## Errors

- Throw for bugs and broken invariants, with a custom error type and a descriptive message: `ConfigValidationError`.
- An expected failure that the caller must handle (cancelled, not found, rate-limited) is a returned discriminated union, written by hand.
- A `catch` does work: it recovers, translates, or adds context.
- A warning on a result is an error: throw, or return a typed failure.
- Do the write and handle the conflict error. Check-then-act is a race.
- Prefer an atomic operation to a toggle endpoint.
- A cache has a real bound.
- A user-facing numeric input clamps to a sane range, on change and on blur.
- State that never shipped has no versioning or migration.

## Comments and docs

- Comments are rare. A comment states a hidden constraint, an invariant, or a workaround, as the reason.
- A comment describes the code as it is now. History stays in git.
- Removed code leaves no trace: no gravestone comment (`// removed X`, `// moved to Y`, `// legacy, kept for Z`) and no commented-out code.
- A merged change has no TODOs.
- A comment names no environment or session detail, such as a production URL or a local machine.
- A cleanup keeps the useful comments that already exist: layout diagrams and real nuance.
- A line comment lives inside a function body. A top-level declaration that needs a comment gets a doc comment.
- A section inside a body can carry one line comment, multiline if needed, when its first line does not show its purpose. The comment gives the reason, never a heading that repeats the code.
- Every export has a doc comment: one or two sentences on what it does and what the types cannot say.
- A parameter tag carries a constraint that the type cannot express: units, ranges, "must be one path segment", "must be sorted". A tag that restates the name or the type is padding. The summary and the return type cover the return value.
- Add an example when the call shape is not obvious. The example is a fenced code block with a language tag, and it compiles.

## Writing

These rules apply to every comment, doc comment, error message, log line, pull request description, and commit message. UI copy follows the project's voice guide.

- Write in ASD-STE100 Simplified Technical English. A tired reader who is not a native speaker understands each sentence on one read.
- Instructions are imperative: one instruction per sentence, 20 words or fewer. Descriptions use the simple present: one fact per sentence, 25 words or fewer.
- Use the active voice and simple tenses.
- Use `must` for a requirement and `can` for a possibility.
- Put a condition before its command: "If the request fails, retry it once."
- End a sentence with a period. Two thoughts are two sentences.
- A noun cluster has three words or fewer. Break a longer one with "of", "for", or "in".
- One item, one name. Pick one verb for check/verify/confirm/validate and one noun for config/settings.
- State what a thing is, as a constraint: "Must be one path segment."
- Every word carries a fact. Cut filler: leverage, utilize, ensure, simply, just, robust, seamlessly, comprehensive, "in order to", "it is worth noting", "allows you to", "is designed to". Write "for example" and "that is", and name the items in place of "etc.".
- Keep complete grammar, with articles and "that".
- Code, identifiers, paths, and quoted errors stay exact.

## Tests

- Test code meets this whole style: named constants, honest types, breathing room, the same names.
- Tests are few and load-bearing: generic tests through shared builders and shared mocks. No side effects, no hard-coded environment.
- Assert on observable outcomes through the interface. A test that must change when the implementation changes tests past the interface.
- When a module gets deeper, delete the tests on its old shallow pieces and test the new interface.
- A test name is a sentence about behaviour. A format-string name (`"%j -> %j"`) is for a pure input-to-output table, inside a suite named for the function under test.
- A row's meaning goes in its test name. The runner does not print trailing comments.
- A test lives beside its code. Package code is tested in its package.
- Suites stay flat.

## Reuse before you write

- Search the codebase before you add a helper, a hook, or a dependency. Formatting, date math, timers, and lookups get re-implemented most often.
- Data goes through the project's data layer, and reloads through it.
- A change deletes the code it made obsolete, everywhere.

## Git

- Every commit message is a Conventional Commit.
- A branch name is a Conventional Commit type, a slash, and a kebab-case short name. With a Linear ticket, the id comes first: `feat/TEAM-123-linear-short-name`. Without one: `feat/short-name`.
- One pull request per ticket. A fix found in review is a commit on the open pull request.
- Every changed file in a pull request needed to change.
