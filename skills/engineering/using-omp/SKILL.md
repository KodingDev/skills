---
name: using-omp
description: >
  Delegate code and test writing to the omp (oh-my-pi) coding agent CLI, driving
  a fast model. Use when handing an implementation task to omp, running
  `omp -p`, resuming an omp session, or reviewing a diff that omp wrote.
---

# Using omp

omp writes the code and the tests. You own everything around it: the worktree, the brief, the review, the checks, the commits, and all prose (docs, commit messages, pull request text).

Every round goes through [`scripts/omp-run.sh`](scripts/omp-run.sh). Call the scripts by their absolute path in this skill's folder. It refuses the main checkout, a detached HEAD, and the default branch. `omp -p` has no sandbox and no approval prompt, so the refusals and the `--tools` list are the boundary. The default list is `read,bash,edit,write,grep,glob`: no browser, no web, no subagents. The script records each round on disk. It needs `omp` and `jq` on the PATH.

The default model is `opencode-zen/deepseek-v4.1-flash` with `--thinking low`, and a round stops after 45 minutes. omp loads the repo's `AGENTS.md` and `CLAUDE.md` by itself, so the brief need not repeat repo-wide rules. It does not know your personal rules (commit author, no trailers, writing style). Put those in the brief.

## Steps

1. **Worktree.** Create a linked worktree on a feature branch for the task: `git worktree add <path> -b <branch>`. omp works only there.
   Done when: `git -C <path> branch --show-current` prints the feature branch.

2. **Brief.** Copy [`brief.md`](brief.md) to a file outside the repo, and fill in every section. Paste the facts omp needs. omp has no memory of your conversation. Write the file with your file-write tool. A shell heredoc runs the backticks and `$` in it, and the brief reaches omp with holes.
   Done when: every section has content, and every path is absolute. The script refuses a brief that still holds template text.

3. **Round.** Run:

   ```sh
   scripts/omp-run.sh --worktree <path> --brief <brief file> --detach [--model <m>] [--thinking <level>] [--tools <list>] [--max-time <t>]
   scripts/omp-wait.sh <round folder>...
   ```

   `--detach` prints the round folder and returns at once. Run `omp-wait.sh` as a background command: it ends when every round it names ends, and its completion notice wakes you. One wait can cover the rounds of several worktrees. Do other work in the meantime.
   Done when: `omp-wait.sh` printed `exit <code>` and the stats for the round.

4. **Result.** Read `status` and `stats` in the round folder, then the diff itself (`git -C <path> diff`). `last.md` is omp's own report: use it for open questions and brief errors it found, not as evidence. A high `tool_errors` count or a round with no `edit` or `write` calls means the model struggled: read `events.jsonl`.

   | Exit | Meaning | Action |
   | --- | --- | --- |
   | 0 | omp finished. | Review the diff. |
   | 2 | The script refused to start. | Fix the cause in its message. |
   | 3 | omp moved HEAD (it committed or switched branch). | Run `git reset <old HEAD>` from the message. It keeps the changes in the worktree. Say "no commits" in the next brief. |
   | other | omp failed or hit `--max-time`. | Read `stderr.log` and `events.jsonl`. |

5. **Review.** Check every changed hunk against [`review.md`](review.md), and against the repo's own review bar (for example, the `house-style` skill).
   Done when: each hunk is clean, or each finding is written down with its file and line.

6. **Fix round.** Write the findings as a short brief: one finding per item, with the file, the line, and the required change. Run step 3 with `--resume`, which continues the same omp session. Repeat steps 4 to 6.
   After three fix rounds that still leave findings, stop. Report the open findings to the user.

7. **Land.** Run the repo's checks yourself (build, lint, typecheck, the tests for the code that changed). Commit with your own message.
   Done when: the checks pass and the commit is on the feature branch.

## Writing a brief for a fast model

Do the investigation and the design yourself. Give the model the typing. A brief that worked named the exact files, the exact current lines and the target lines, the shape of the test, the exact commands, and the checks. It asked for red then green, with the red output in the report. It also listed "change only these files". The model then followed the steps precisely, and it caught errors in the brief. Read its report for those.

## Round files

Each round writes to `$USING_OMP_HOME/<worktree folder>/<UTC stamp>/` (default `~/.cache/using-omp`): `brief.md`, `events.jsonl`, `stderr.log`, `last.md`, `session`, `status`, `stats`, `diffstat`, and `runner.log` for a detached round. `--resume` reads `session` from the newest round of the same worktree. `stderr.log` often holds harmless MCP connect warnings.

Defaults also come from `USING_OMP_MODEL`, `USING_OMP_THINKING`, `USING_OMP_TOOLS`, and `USING_OMP_MAX_TIME`.
