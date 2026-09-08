---
name: dotnet-profiling
description: >
  Command-line profiling and diagnostics for .NET, routed by which reader you
  actually have: the Rider MCP dotTrace tools, dotCover, dotMemory Unit, and the
  dotnet-* diagnostic tools. Use when the user asks to profile a .NET or C# app,
  chase a hot path, a memory leak, an allocation or startup regression, or measure
  coverage; or when the user mentions dotTrace, dotMemory, dotCover, dotnet-trace,
  dotnet-counters, dotnet-gcdump, or dotnet-dump.
---

# .NET Profiling from the CLI

A profiler writes a snapshot. Reading it is a separate capability, and you may not have it.
`dotTrace` writes a `.dtp` and `dotMemory` writes a `.dmw`; both are binary. Shelling out to a
profiler and then narrating a bottleneck from the exit code is fabrication.

Three readers exist. Establish which one you have **before** you collect, because it decides
how you collect.

## 1. Route before you collect

| The question | The tool | Who reads it |
| --- | --- | --- |
| Is this CPU, allocation, GC, contention, or thread-pool starvation? | `dotnet-counters collect` | you — CSV / JSON |
| Which methods burn the time? | `dotnet-trace collect` → `dotnet-trace report topN` | you — stdout |
| What is on the heap, by type and size? | `dotnet-gcdump collect` → `dotnet-gcdump report` | you — stdout |
| What still holds a reference to it? | `dotnet-dump collect` → `dotnet-dump analyze -c` | you — stdout |
| Call tree, timeline, SQL/HTTP/exception events, contention | dotTrace snapshot → **Rider MCP tools** | you — if Rider is running (§6) |
| Which lines does the suite cover? | `dotCover cover` → `dotCover report --json-report-output` | you — JSON / XML |
| Did this regress? | dotMemory Unit assertion in a test | pass / fail |
| Heap graph, retention paths, snapshot diffing | dotMemory → `.dmw` | **a human only** — no agent path exists |

Start at the top. `dotnet-counters` costs seconds and tells you which lower row is even the
right one. Reach for dotTrace when you need a call tree, a time-sliced view, or event streams
that `report topN` cannot express.

## 2. Measure a build worth measuring

Do all of these before you believe a number:

- Build and run **Release**. A Debug-build profile measures work the shipped binary never does.
- Detach the debugger. It suppresses JIT optimisations.
- Warm up, then measure. The first run pays JIT, assembly load, and cold-page costs.
- Take a **baseline** on the unchanged code, then a delta. A single absolute number proves nothing.

## 3. Nothing here stops on its own

`dotnet-trace collect` prints `Press <Enter> or Ctrl+C to exit...` and waits. An agent has no
Enter key, so an unbounded collect hangs the turn. Bound every session where you start it:

- `dotnet-trace collect --duration 00:00:00:30`
- `dotnet-counters collect --format json -o counters.json -- dotnet exec app.dll`
- dotTrace: `--timeout=30s`, or let a short-lived app exit on its own — the CLI saves on exit
- dotMemory: `--trigger-timer=10s`, or a stdin control message

For long sessions, drive the JetBrains profilers through their stdin protocol
(`--service-input=stdin`) and send `##dotMemory["get-snapshot"]` or `##dotTrace["disconnect"]`.
See `reference.md`.

## 4. Attach to the right process

- **Never profile `dotnet run`.** It spawns child processes, and the tool latches onto whichever
  one answers first — usually not the app. Publish first, or use `dotnet exec app.dll`.
- On macOS and Linux, `-p`/`--process-id` and `-n`/`--name` need the target and the tool to share
  `TMPDIR`. If they do not, the command times out with no useful error.
- Match bitness and run as the same user as the target, or as root.
- `dotnet-counters ps`, `dotnet-trace ps`, and `dotnet-dump ps` list attachable PIDs with their
  command lines. Use them instead of guessing from `ps aux`.

## 5. The dotnet-* loop

```bash
# 1. Which resource is the problem?
dotnet-counters collect -p <pid> --refresh-interval 1 --format json -o counters.json

# 2a. CPU: top methods by exclusive time
dotnet-trace collect -p <pid> --duration 00:00:00:30 -o trace.nettrace
dotnet-trace report trace.nettrace topN -n 20

# 2b. Memory: what is on the heap
dotnet-gcdump collect -p <pid> -o after.gcdump
dotnet-gcdump report after.gcdump

# 2c. Leak: what roots it
dotnet-dump collect -p <pid> -o app.dmp
dotnet-dump analyze app.dmp -c "dumpheap -stat" -c "gcroot <address>" -c exit
```

`dotnet-dump analyze -c` is the seam that makes SOS usable without a TTY: one `-c` per command,
ending with `-c exit`, or the session blocks forever.

The `cpu-sampling` profile no longer exists on `dotnet-trace collect` — it was removed for
sampling every thread regardless of CPU use. The default is now
`dotnet-common` + `dotnet-sampled-thread-time`.

## 6. The dotTrace loop, through Rider's MCP server

Rider bundles an MCP server exposing five read tools plus a report renderer:
`dotTraceGetSnapshotInfo`, `dotTraceGetSnapshotFilters`, `dotTraceGetCallTree`,
`dotTraceGetTimeline`, `dotTraceGetTimelineEvents`, `dotTraceOpenReport`. They take a snapshot
path and return agent-readable text. This is the only way an agent reads a dotTrace snapshot.

**Preconditions — check all three before collecting:**

- Rider is **running** with the solution open. The MCP server is hosted in the IDE; there is no
  standalone binary and no CLI equivalent.
- A valid **dotTrace licence** (dotUltimate or All Products Pack). Without it every call fails.
- `rootFolder` must be a path Rider currently has open. A path Rider does not know is rejected,
  and the error lists the open projects — read it and retry with one of those.

**Collect with `--profiling-type=Timeline`.** This is the load-bearing detail. The CLI writes two
different containers, and only one of them reads back:

| Profiling type | Container magic | Rider MCP tools |
| --- | --- | --- |
| `Timeline` | `MFDTEM` | reads it — verified end to end |
| `Sampling` / `Tracing` / `LineByLine` | `MFDTPF` | rejected: "Try opening … with the latest dotTrace version" |

That rejection was reproduced across CLI 2026.1.5.1, 2026.2.1, and 2026.3.0-eap01 against Rider
2026.3 EAP, so it is the container, not a version skew. JetBrains' own bundled skill documents
Performance snapshots as call-tree-capable, so this may be an EAP defect — but until it reads on
your build, **collect Timeline or you get nothing**. Timeline is also the richer mode: it is the
only one carrying time ranges, filters, and SQL/HTTP/exception/contention events.

```bash
dotnet tool install --global JetBrains.dotTrace.GlobalTools
dottrace start --framework=NetCore --profiling-type=Timeline \
  --save-to=./snaps/app.dtp "$(which dotnet)" ./bin/Release/net10.0/App.dll
```

A snapshot is **not one file**. It is `app.dtp` plus `app.dtp.0000`, `.0001`, and so on — the
`.dtp` is a small index. Move or copy the whole set together, and pass the `.dtp` as the path.

Then work the snapshot in this order, and pass `format: compact` throughout — it is terser and
pre-parsed for agents:

1. `dotTraceGetSnapshotInfo` — confirms it opens, gives duration, says Timeline or Performance.
2. `dotTraceGetTimeline` — CPU buckets, GC pauses, and interval channels (`ui-freeze`, `sql`,
   `http`, `fileio`, `jitting`, `contention`). Find the hot window.
3. `dotTraceGetCallTree` with `filterThreadState=running`, a `minOwnTimePercent` floor, and the
   hot `timeRangeStart`/`timeRangeEnd`. Output is a `LEGEND` of `[SYS|USR]` methods plus `STACKS`
   lines carrying `@NodeId` and own/total/percent.
4. `dotTraceGetCallTree` again with a saved `nodeId` to drill in. **Reuse the parent call's exact
   filters** — a node ID is a hash of its path under those filters, and changing any of them
   returns "Node … is not found in the cache". Only the thresholds and `maxNodes` are safe to change.
5. `dotTraceGetTimelineEvents` with `maxEvents=0` for group summaries — this is how you spot an
   N+1 query pattern.

Then read the source of every `USR` method you name. A finding built from a fully-qualified name
alone is generic and worthless; the value is in what the code actually does at that line.

If Rider is not running or the licence is missing, say so and fall back to §5. Do not collect a
snapshot you cannot read and then imply you analysed it.

## 7. dotMemory has no agent path

There are no `dotMemory*` MCP tools — dotTrace has five, dotMemory has zero. A `.dmw` workspace
is a ZIP whose payload is proprietary binary. Nothing reads it but the dotMemory GUI or Rider.

So for memory work, prefer §5 (`dotnet-gcdump report`, `dotnet-dump analyze`), which answers
"what is on the heap" and "what roots it" in plain stdout. Collect a `.dmw` only when a human
asked for one to open themselves — then hand over the path and say plainly that you did not read it.

## 8. Turn the finding into a gate

A profiling result that lives in a chat message regresses again next month. When the user has a
number worth defending, convert it:

- **Memory**: a dotMemory Unit assertion inside the existing test suite.
- **Coverage**: `dotCover report --json-report-output` in CI, with a threshold.
- **Throughput**: a BenchmarkDotNet benchmark, not a profiler run.

Propose the gate. Do not add it unless the user agrees — it changes their CI.

## Before you claim a finding

- [ ] Release build, no debugger, warmed up
- [ ] Baseline and delta, not one number
- [ ] The measurement covers the code path in question, confirmed from the report itself
- [ ] Source read for every user-code method you name
- [ ] Every artefact is either read or explicitly handed over by path
- [ ] Anything you did not read is described as collected, never as analysed

`reference.md` — install matrix, every dotTrace and dotMemory CLI flag, the stdin control
protocol, the Rider MCP tool parameters and triage thresholds, dotCover, dotMemory Unit, and the
self-profiling API for processes you cannot attach to.
