# Engineering

Skills for daily code work.

| Skill | What it does |
| --- | --- |
| [`canon`](./canon/SKILL.md) | Canon-over-headcanon discipline for studying an existing system — a port, a library, a bug: it is deterministic, there is always a pointer, there is always a source, and it was built the smart generic way. |
| [`cdk-best-practices`](./cdk-best-practices/SKILL.md) | Audit AWS CDK code against the best-practices rule catalog and produce a prioritized, `file:line` report, or fix in place on code you just wrote. |
| [`dotnet-profiling`](./dotnet-profiling/SKILL.md) | Command-line profiling and diagnostics for .NET, routed by which reader you have: `dotnet-counters`/`dotnet-trace`/`dotnet-gcdump`/`dotnet-dump` print to stdout, dotTrace snapshots are readable only through Rider's MCP tools (and only Timeline ones), and dotMemory has no agent path at all. |
| [`foreman`](./foreman/SKILL.md) | User-invoked (`/foreman`). Delivery orchestration for big changes: tracker tickets, worktree-per-ticket branches, worker fan-out, one human-reviewable PR per ticket per repo — every line reviewed, velocity from disjoint lanes. |
| [`function-design`](./function-design/SKILL.md) | Design and review functions for explicit dependencies, meaningful contracts, and one level of abstraction; includes TypeScript/C# examples and enforcement guidance. |
| [`golden`](./golden/SKILL.md) | Build-time bias toward the durable version of whatever's being built — golden from the start, exactly as simple as the problem's shape; the same bar as a review lens. |
| [`lean-containers`](./lean-containers/SKILL.md) | Container image discipline for writing or reviewing Dockerfiles: slim over alpine, layer-order caching, `.dockerignore`, multi-stage builds, digest pinning. |
| [`orchestrate`](./orchestrate/SKILL.md) | Judgment for multi-agent work: builder/critic splits, model tiering, context hygiene, deterministic pre-extraction. |
| [`pair`](./pair/SKILL.md) | User-invoked (`/pair`). Pair-programming mode: one move per turn, narrated, keyboard handed back at a live decision point, the small things treated as the real work. |
| [`red-team`](./red-team/SKILL.md) | User-invoked (`/red-team`). Spawn an adversary subagent (fork or fresh) that argues against a point, run a two-to-four-round bout, and return a verdict: what survived, what changed, what is still open. |
| [`rehab`](./rehab/SKILL.md) | User-invoked (`/rehab`). Rehabilitate a sloppy AI-assisted codebase: triage, fix the map the agent reads, diet the rules file, convert prose rules into enforced checks, pay down debt behind characterization tests, hold the line. |
