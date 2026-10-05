# foreman

A Claude Code mod that shows the lanes of a foreman program: what each lane does, what waits on you, and what each lane uses.

Agents write the content. The mod draws it and adds what it can see for itself: agent liveness, stalls, memory, CPU, and listening ports.

## Install

```sh
claude plugin marketplace add KodingDev/skills
claude plugin install foreman@kodingdev
```

## Use

- `/lanes` opens the pane on the current program.
- `/lanes <program>` switches the pane to another program.
- `/lanes stop <lane>` stops the agent of that lane.

The band above the prompt lists what needs you, stalled agents, and permission denials. The status line shows the lane count, stalls, needs, and the ETA. Both hide when nothing is open.

## The report tool

Agents call `mcp__foreman__report` after each change, with only what changed. The input schema in [`hooks/register.tsx`](hooks/register.tsx) describes each field:

- `program`: the program id. Every session on one program sends the same id.
- `lanes`: each lane that changed, with `lane`, `title`, and `status`. Optional: `agent`, `worktree`, `summary`, `eta`, `todos`, and `resources`. A sent lane replaces the lane of the same name.
- `closed`: the names of lanes that are done.
- `needs`: each decision or review that waits on you now. It replaces the last list. If it is left out, the last list stays.
- `eta`: a rough estimate for the whole program.

The [`foreman`](../../skills/engineering/foreman/SKILL.md) skill tells its agents to send these reports.

## What it observes

- **Stalls**: a running subagent with no tool call for 10 minutes. A toast tells you once.
- **Usage per lane**: the memory, CPU, and process count of every process whose working folder is inside the lane's `worktree`, with its children. The session's own processes do not count.
- **Ports**: each TCP port that a lane process listens on, marked `seen`.
- **Memory**: a toast when one process uses 24 GB or more.

Usage needs `ps` and `lsof`, so it shows on macOS and Linux only.

## Storage

Each session writes its report to `~/.claude/plugins/data/foreman-kodingdev/programs/<program>/<session>.json`. The pane merges the files of every live session on the program. A program with no file from the last day is hidden, and its files are removed on the next session start.
