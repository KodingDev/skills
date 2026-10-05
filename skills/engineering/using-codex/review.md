# Review of a Codex diff

Check every changed hunk. Codex output fails in these known ways. Apply the repo's own review bar as well.

- **Scope.** Every changed file is in the brief's scope. A change outside it goes back, even when it looks right.
- **Guessed behaviour.** Every engine default, spec rule, magic number, and file offset cites a source. A value with no source is a guess.
- **Name matching.** Logic that branches on a string name, a path pattern, or a hand-built path, where the data has a real field to read.
- **Silent fallbacks.** A default, an empty value, or a skipped item where the input is invalid. Invalid input fails with an error that names it.
- **Dead code.** Unused exports, parameters, branches, and helpers. Old code that the change replaced and that is still in place.
- **Pass-through code.** Re-exports and wrappers that only forward a call.
- **Comments.** Comments that narrate the change or restate the code.
- **Types.** `any`, casts, and non-null assertions that hide a real type.
- **Tests.** Each test proves behaviour, and fails when that behaviour breaks. Tests that check only shape, mock the module under test, or snapshot a large blob go back.
- **Test claims.** Run the tests yourself. Codex's report of a pass is not evidence.
