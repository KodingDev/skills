---
name: house-style
description: >
  The style for writing good code: the review bar that every change is
  written to and checked against, from the shape of a change down to names,
  comments, and commit messages. Use when writing, editing, or reviewing code,
  when opening or updating a pull request, when fixing review comments, when
  refactoring or cleaning up, when doing UI work, or when the user says "house
  style", "standards", "nitpicks", "behave", or "too many comments".
---

# House style

The review bar for every change. Write to it, and before you open or update a pull request, check every changed hunk against every rule that applies to it.

## Before you write or review

1. List the languages in the diff.
2. Read the reference for each one, in full. Its rules are as binding as this file, and a review that skips it misses them.
   - TypeScript and JavaScript: [`references/typescript.md`](references/typescript.md).
   - React and UI code: [`references/react.md`](references/react.md), with the TypeScript file.
   - Python: [`references/python.md`](references/python.md).
   - Go: [`references/go.md`](references/go.md).
3. Find the repo's lint, format, and typecheck commands, and run them on the change.

## Honest functions

Most rules in this file follow from honest functions. Get these right first, and many comments, names, and review notes become unnecessary.

- A function's signature tells the whole truth: every input is a parameter, every outcome is in the return type. Hidden reads of globals, env, the clock, or I/O become parameters.
- A function works at one level of abstraction. A body that mixes orchestration with low-level detail splits, and each part gets a name that says what it does.
- Extract a function when its name tells a reader something the code does not, or when it has a second caller. A one-call helper with no clearer name stays inline, with a short comment if the section needs one.
- Types make illegal states unrepresentable, so a reader does not need a comment to learn the rules.
- A parameter takes the type that the callers already hold, not a custom shape or a container stricter than the body needs.
- A function takes three parameters or fewer. More become one options object.
- A boolean parameter does not exist. Each behaviour is its own named function.

## Authority

- This style is the authority. Existing code is not precedent: code that shipped fast is often below this bar.
- Every hunk that a change touches meets this style in full.
- A change reworks the code it touches into its intended shape, even when the diff grows.
- A cleanup of existing code goes in its own commit, on the same pull request.
- Where a language or its ecosystem has an established standard recommendation (its PEPs, its official style guide, its packaging authority), follow it.
- Where this style is silent, pick the plain shape.

## Prior art

- Before you design a format, a protocol, a schema, or a standard, search for the established ones that solve the same problem. Read their specs and their design rationale.
- Name the prior art in the design: what it does, which principles carry over, and why you adopt it, adapt it, or build your own. Even when you build your own, the established standard's principles shape the decisions.
- Before you add a rule, a helper, or a script, name the stock tool that already covers it. Write new code only for the gap that the tool leaves.

## Lint first

- A rule that a linter can check is enforced by the linter, not by review. Each language reference names its stock config.
- When a repo has no lint, format, or typecheck step in CI, adding one is part of the change that needs it.
- Review spends its attention on what no tool can check: shape, names, honesty, and fit with the code around it.

## Shape of a change

- State the intended end state in one or two sentences before you write code. Build that state, as if the intended UX and architecture existed from day one.
- Search for real callers before you keep anything for compatibility. A mode, prop, wrapper, route alias, or fallback with no caller is deleted.
- One clear component or flow replaces mode flags. Split at a real boundary: state, layout, controls, or domain commands.
- Order inside a file follows the language's convention, as its reference states.
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
- Domain terms stay as the source names them. When one looks wrong, a comment says that the source calls it this. A misspelling in the source stays only in the wire format, such as a JSON tag; the identifier uses correct English.
- An API sends raw values, such as enum members. The consumer derives display labels.
- Fetch in bulk, then look up. One call per entity is a loop of round trips.
- A feature toggle or an env flag exists only while it has a reason to be off.

## Control flow

- Return early. The happy path runs at the lowest indent.
- A ternary has two leaves. Three or more branches become early returns or a lookup.
- A ternary replaces an `if`/`else` that assigns or returns one of two values.
- A lookup is a map or a record. Related lookups share one object, keyed by one key.
- Async work that a user can abandon (by navigating away, typing again, or closing a dialog) takes a cancellation signal and passes it down to every call it makes.
- A pass-through (a wrapper that only forwards) is deleted, and its caller calls the real thing.
- A variable that only renames or repacks a value already in scope is deleted. Use the value directly.
- A repeated guard becomes one helper that checks and fails, such as `ensurePermissions`.
- A framework response uses the framework helper: `forbidden()`, `notFound()`.

## Breathing room

- Prefer more lines and more named variables to a dense one-liner, when each name adds meaning. An `await` gets its own variable before it enters a condition.
- A complex condition becomes a named boolean.
- A literal with meaning (a timeout, a limit, a status string) is a named constant. `0`, `1`, `""`, and an index stay inline.
- A body splits into sections, with one blank line between sections.
- A value is built field by field. One response is never spread into another to merge them.

## Names

- A boolean variable or predicate is a question: `isVisible`, `hasItems`, `canSubmit`. A boolean prop follows the platform: `open`, `disabled`, `checked`.
- A count ends in `Count`: `savedCount`, `failedCount`.
- Event props are `onX`. The function behind one is named for the action, such as `selectItem`.
- A name is the plain domain noun, in full: `Camera`, `PostHog`, `GameDataApi`. No hedge or mode prefix (`Maybe`, `Show`) and no private abbreviation.
- Generic code uses generic words. A domain word appears only in the module of the domain that owns it.
- A file is named for what it holds: `retry-policy.ts`, `date-range.ts`. Generic buckets (`utils`, `helpers`, `constants`, `types`) do not exist.

## State

- Runtime state lives in a store or a context, scoped to its instance. Mutable module-level state does not exist.
- Values are immutable by default. Mutation applies only to values that the function created and that stay inside it, such as a local counter or a builder set. Arguments, module-level values, and anything the caller can see stay unchanged.
- A class is for a stateful thing with a lifecycle: a cache, a player, a connection. It owns private state, invariants, and disposal. Stateless code is plain functions.

## APIs

- A router is named for its resource, and its procedures are plain verbs: `user.get`, `user.list`, `user.update`. A qualifier tells two lookups apart: `user.get` and `user.getByEmail`.
- A transport condition (unauthorized, forbidden, not found, rate-limited) throws the framework's error with the standard code, such as `TRPCError`. Shared client handling covers it.
- A domain outcome that the UI branches on, such as "code already redeemed", returns as a union in the data. It stays typed per procedure, out of retries, and out of the error logs.
- A list endpoint pages by cursor: it returns `{ items, nextCursor }` with an opaque cursor. It adds `totalCount` only when the UI shows a total.

## Errors

- Throw for bugs and broken invariants, with a custom error type and a descriptive message: `ConfigValidationError`.
- An expected failure that the caller must handle (cancelled, not found, rate-limited) is a returned discriminated union, written by hand.
- A `catch` does work: it recovers, translates, or adds context.
- Fail loudly. When valid input makes a check fail, fix the check or the producer of the data. The consumer never catches the error to hide it.
- A warning on a result is an error: throw, or return a typed failure.
- Do the write and handle the conflict error. Check-then-act is a race.
- Prefer an atomic operation to a toggle endpoint.
- A cache has a real bound.
- A user-facing numeric input clamps to a sane range, on change and on blur.
- State that never shipped has no versioning or migration.

## Logging

Code is traceable: from the logs alone, a reader can follow one request or job from its start to its result.

- Log at every boundary: an incoming request or job, every call to an external system, and every write to persistent state. Each entry carries the outcome and the duration.
- Log every decision that changes the path: a fallback taken, a retry, a skip, a cache miss that falls through to the source.
- A `catch` that recovers logs what it caught and what it did instead.
- Logs are structured: a short fixed message plus key-value fields. Values go in fields, never interpolated into the message.
- Every entry in one request or job carries the same correlation id, passed through to each downstream call.
- Levels have one meaning each. `error`: someone must act. `warn`: degraded but handled. `info`: a boundary or a decision. `debug`: detail for one investigation.
- Logs go through the project's logger. Ad-hoc `console.log` lines are debug leftovers and leave before merge.
- Logs carry identifiers, never secrets, tokens, or personal data.
- A log message and an error message follow the Writing rules: what happened, the cause if known, then the next action.

## Comments and docs

- A comment describes what the code does and why, as it is now. How the code came to be (the request, the bug that prompted it, the earlier version) stays in git.
- A comment earns its place when the code alone does not tell a reviewer what happens: a hidden constraint, an invariant, a workaround, a technicality, or what a block of steps achieves together.
- Removed code leaves no trace: no gravestone comment (`// removed X`, `// moved to Y`, `// legacy, kept for Z`) and no commented-out code.
- A merged change has no TODOs.
- Code carries no tracker ids, plan steps, milestone codes, or status notes. A ticket links to the code, never the reverse.
- Emphasis is a plain sentence. A hard constraint uses `must`, not capitals or bold.
- An example uses an obvious placeholder (`42`, `user@example.com`), never a real id.
- A comment names no environment or session detail, such as a production URL or a local machine.
- A cleanup keeps the useful comments that already exist: layout diagrams and real nuance.
- When you edit a file, bring the comments in the code you touch up to these rules: remove narration, banners, and change logs.
- Reasoning that the user needs goes in the chat response.
- A line comment lives inside a function body. A top-level declaration that needs a comment gets a doc comment.
- A section inside a body can carry one short comment that describes what the section does, when its first line does not show it. Such a comment is also a sign that the section could be its own function.
- Every export has a doc comment: one or two sentences on what it does and what the types cannot say. A doc comment uses the language's block form, multiline, as the reference shows.
- A parameter tag carries a constraint that the type cannot express: units, ranges, "must be one path segment", "must be sorted". A tag that restates the name or the type is padding. The summary and the return type cover the return value.
- Add an example when the call shape is not obvious. The example is a fenced code block with a language tag, and it compiles.

Docs outside the code (READMEs, design docs, agent docs) exist to explain what is unclear and to cut discovery time. Every line they hold is one more thing that can disagree with the code.

- A doc describes behaviour and intent. A directory pointer is fine ("routes live in `app/`"). Type, function, and file names stay in the code.
- A doc holds no fact that the code or the environment already states and that drifts: counts ("three consumers"), versions ("npm 10.2"), lists of callers, option tables copied from source. A reader who needs the number counts it.
- A doc covers what a reader cannot find by looking. When the code answers the question, the doc has nothing to add.

## Writing

These rules apply to every comment, doc comment, error message, log line, pull request description, and commit message. UI copy follows the project's voice guide.

- Write the least text that carries the facts. Prose is for reasoning that needs connected sentences. Steps are a numbered list, parallel facts are a bulleted list, and comparisons are a table.
- Lead with the result or the decision. Detail follows, in the order that the reader needs it.
- Use progressive disclosure: the summary on top, then details under headings, in collapsed sections, or behind links. A reader who stops after the first paragraph still has the answer.
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
- State what is true. Text never restates the request, who asked, or why the text was written.
- Code, identifiers, paths, and quoted errors stay exact.
- Everything that lands in the codebase is plain ASCII: `-` or `--` for dashes, straight quotes, `->` for arrows, regular spaces, and no emoji. Content that is meant to hold unicode, such as i18n strings and fixtures, keeps it.

## Tests

- Test code meets this whole style: named constants, honest types, breathing room, the same names.
- Tests are few and load-bearing: generic tests through shared builders and shared mocks. No side effects, no hard-coded environment.
- Assert on observable outcomes through the interface. A test that must change when the implementation changes tests past the interface.
- When a module gets deeper, delete the tests on its old shallow pieces and test the new interface.
- A test double replaces only a true external system: a third-party API, the clock, randomness. Your own modules and services run for real, and the database runs on a local stand-in such as PGlite.
- A snapshot is inline (`toMatchInlineSnapshot`) and holds small, stable, serialized output, such as a generated schema or a help text. Snapshot files do not exist. Infrastructure tests assert with fine-grained assertions.
- Most wiring is covered by cross-module tests: several real modules composed through their public interfaces, with only external systems replaced.
- Each critical user flow (sign in, checkout, publish) has one end-to-end test, on a short named list. A change that touches a listed flow updates its test.
- A test name is a sentence about behaviour. A format-string name (`"%j -> %j"`) is for a pure input-to-output table, inside a suite named for the function under test.
- A test's meaning goes in its name. A comment in a test only explains a fixture value that looks wrong.
- A row's meaning goes in its test name. The runner does not print trailing comments.
- A test lives where the language's test runner expects it, as the language reference states. Package code is tested in its package.
- Suites stay flat.

## Reuse before you write

- Search the codebase before you add a helper, a hook, or a dependency. Formatting, date math, timers, and lookups get re-implemented most often.
- Data goes through the project's data layer, and reloads through it.
- A change deletes the code it made obsolete, everywhere.

## Verification

- "Done", "fixed", and "works" mean that you ran it and saw the result. When you did not run it, say "untested" and list what changed.
- A UI change is verified by a screenshot of the correct result.
- Verify a fix that someone waits on before you commit or push it.

## Debugging

- Reproduce the failure before you change code.
- Form one hypothesis, test that one hypothesis, and confirm it before you move on.
- Keep a list of what you tried and ruled out. Never repeat an attempt that already failed.
- When a fix gets "still broken" or "same error", the fix was wrong. Stop patching, and go back to the root cause.
- For an environment problem (a stale dev server, a cache, a hot reload that missed), apply the operational fix: restart, clear, rebuild. Code stays as it is.

## Toolchain

- `mise.toml` pins every runtime and tool version for the repo: Node, pnpm, Python, uv, and the rest. It is the one source of those versions.
- Per-tool version pins (`.nvmrc`, `.node-version`, `.python-version`, `.tool-versions`, the `packageManager` field in `package.json`) do not exist.
- CI installs the toolchain through mise, so local and CI run the same versions on every platform.

## Generated code

- A generated file is output. A fix goes to the generator or its input, never to the file.
- A generated file is committed in the same commit as its source.
- CI runs every generator and fails on any diff.

## Git

- Every commit message is a Conventional Commit.
- A branch name is a Conventional Commit type, a slash, and a kebab-case short name. With a Linear ticket, the id comes first: `feat/TEAM-123-linear-short-name`. Without one: `feat/short-name`.
- One pull request per ticket. A fix found in review is a commit on the open pull request.
- Every changed file in a pull request needed to change.
- A commit holds only maintained files: code, tests, schemas, docs. Scratch output, captures, raw dumps, and temp or absolute local paths stay out.
- Committed text names no private, local, or reverse-engineered source that it was derived from.

## Pull requests

- The title is a Conventional Commit: `type(scope): summary`.
- Use the repository's pull request template when it has one. When the conventions are not written down, infer them from recent merged pull requests.
- A pull request describes its own diff against its base. A stacked pull request describes only its own slice.
- The body describes the code as it is: what the change is and how it behaves. It explains why the change exists, then what it does.
- Session detail stays out of the body and the commits: rebase history, what conflicted, "this changed because", local machine or environment notes, failures that already existed. Put that in chat.
- The body states the checks that ran (typecheck, tests, lint) and the ones that did not, with the reason.
- A UI change includes a screenshot.
- Commits and bodies carry no AI attribution and no trailer of any kind: no session links, no `Co-authored-by`, no "generated with".
- Name a pull request or a ticket by its id and its title together: "web #406: retry failed uploads once".
