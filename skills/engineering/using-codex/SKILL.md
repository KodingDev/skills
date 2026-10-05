---
name: using-codex
description: >
  Delegate code and test writing to the OpenAI Codex CLI. Use when handing an
  implementation task to Codex, running `codex exec`, resuming a Codex
  session, or reviewing a diff that Codex wrote.
---

# Using Codex

Codex writes the code and the tests. You own everything around it: the worktree, the brief, the review, the checks, the commits, and all prose (docs, commit messages, pull request text).

Every round goes through [`scripts/codex-run.sh`](scripts/codex-run.sh). Run it from this skill's folder. It refuses the main checkout, a detached HEAD, and the default branch. It keeps Codex in the `workspace-write` sandbox, and it records each round on disk.

## Steps

1. **Worktree.** Create a linked worktree on a feature branch for the task: `git worktree add <path> -b <branch>`. Codex works only there.
   Done when: `git -C <path> branch --show-current` prints the feature branch.

2. **Brief.** Copy [`brief.md`](brief.md) to a file outside the repo, and fill in every section. Paste the facts Codex needs. Codex has no memory of your conversation.
   Done when: every section has content, and every path is absolute.

3. **Round.** Run:

   ```sh
   scripts/codex-run.sh --worktree <path> --brief <brief file> [--model <m>] [--effort <low|medium|high>]
   ```

   A round can take longer than your tool's foreground limit. Then start the same command as a background job, and wait for its completion notice. To check a running round, read its `status` file.
   Done when: the round's `status` file says `exit <code>`.

4. **Result.** The script prints the round folder. Read `status`, then the diff itself (`git -C <path> diff`). `last.md` is Codex's own summary: use it for open questions, not as evidence.

   | Exit | Meaning | Action |
   | --- | --- | --- |
   | 0 | Codex finished. | Review the diff. |
   | 2 | The script refused to start. | Fix the cause in its message. |
   | 3 | Codex moved HEAD (it committed or switched branch). | Run `git reset <old HEAD>` from the message. It keeps the changes in the worktree. Say "no commits" in the next brief. |
   | other | Codex failed. | Read `stderr.log` and `events.jsonl`. |

5. **Review.** Check every changed hunk against [`review.md`](review.md), and against the repo's own review bar (for example, the `house-style` skill).
   Done when: each hunk is clean, or each finding is written down with its file and line.

6. **Fix round.** Write the findings as a short brief: one finding per item, with the file, the line, and the required change. Run step 3 with `--resume`, which continues the same Codex session. Repeat steps 4 to 6.
   After three fix rounds that still leave findings, stop. Report the open findings to the user.

7. **Land.** Run the repo's checks yourself (build, lint, typecheck, the tests for the code that changed). Commit with your own message.
   Done when: the checks pass and the commit is on the feature branch.

## Round files

Each round writes to `$USING_CODEX_HOME/<worktree folder>/<UTC stamp>/` (default `~/.cache/using-codex`): `brief.md`, `events.jsonl`, `stderr.log`, `last.md`, `session`, `status`, and `diffstat`. `--resume` reads `session` from the newest round of the same worktree.
