# Codex brief

Fill in every section. Codex reads only this file.

## Goal

One or two sentences: the end state when the task is done.

## Why

The reason for the change, in one or two sentences. Codex uses it to decide the cases the brief does not cover.

## Context

- Worktree: absolute path.
- Files to read first: absolute paths, with what each one holds.
- Sources for any external behaviour (an engine, a spec, an API): file and line, or URL. Codex cites the source in the code. When no source is given, Codex asks in its report and does not guess.

## Scope

- Files Codex can change.
- Files Codex reads but does not change.

## Do

Numbered steps, in order.

## Tests

- The tests to add or change, and the behaviour each one proves.
- The commands to run, scoped to the changed code: the tests, plus the repo's lint and typecheck commands. Codex runs each one before it reports.

## Rules

- Leave all changes uncommitted. The reviewer commits.
- Write code and tests only. The reviewer writes docs, commit messages, and pull request text.
- Follow the style of the code around each change.
- Add a comment only for a constraint that the code cannot show.

## Done when

The checkable condition: for example, "the named tests pass and `<command>` exits 0".

## Report

End with:

- each file changed, with one line on what changed;
- each command run, with its result and test counts;
- open questions and assumptions.
