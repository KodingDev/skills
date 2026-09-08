# Reference

Verified against JetBrains and Microsoft docs, September 2026. JetBrains tools at 2026.2.1.

## Install matrix

| Tool | Install | Invoked as | Licence |
| --- | --- | --- | --- |
| dotTrace CLI | `dotnet tool install --global JetBrains.dotTrace.GlobalTools` | `dottrace`, or `dotTrace.exe` / `dotTrace.sh` from the zip | free to collect; analysis needs dotTrace or Rider |
| dotMemory CLI | NuGet `JetBrains.dotMemory.Console.<rid>` — `windows-x64`, `linux-x64`, `linux-arm64`, `macos-x64`, `macos-arm64` | `dotMemory.exe` / `./dotMemory.sh` | free to collect; analysis needs dotMemory or Rider |
| dotCover CLI | `dotnet tool install --global JetBrains.dotCover.CommandLineTools` | `dotCover` | licensed |
| dotMemory Unit | NuGet `JetBrains.DotMemoryUnit` + standalone launcher | test runner | free |
| Self-profiling API | NuGet `JetBrains.Profiler.SelfApi` | in-process API | free |
| dotnet-trace | `dotnet tool install --global dotnet-trace` | `dotnet-trace` | free |
| dotnet-counters | `dotnet tool install --global dotnet-counters`, or `dnx dotnet-counters` on .NET 10.0.100+ | `dotnet-counters` | free |
| dotnet-gcdump | `dotnet tool install --global dotnet-gcdump` | `dotnet-gcdump` | free |
| dotnet-dump | `dotnet tool install --global dotnet-dump` | `dotnet-dump` | free |

dotMemory has **no** `GlobalTools` package. Restore the RID-specific NuGet package or download
the zip; `dotnet tool install` fails.

## dotTrace CLI

On macOS and Linux the .NET tool exposes exactly two commands — `start` and `attach`. `xmlfile`
is Windows-only. There is no `get-snapshot`, no `report`, and no snapshot-reading command.

```bash
dottrace start --framework=NetCore --profiling-type=Timeline --save-to=snapshot.dtp \
  "$(which dotnet)" ./MyNetCoreApp.dll
dottrace attach 1234 --profiling-type=Timeline --timeout=30s --save-to=./snap.dtp
```

| Option | Meaning |
| --- | --- |
| `--framework=Mono\|NetCore` | required; there is no default |
| `--profiling-type=Timeline\|Sampling\|Tracing\|LineByLine` | Sampling if omitted. Use Timeline for anything an agent will read back |
| `--save-to=<path>` | a directory or a file path |
| `--overwrite` | replace an existing snapshot |
| `--timeout=<hh:mm:ss>\|<n>{s\|m\|h\|d}` | ends the session and saves |
| `--collect-data-from-start=on\|off` | skip startup noise when off |
| `--profile-child[=<mask>]` | follow child processes |
| `--service-input=null\|stdin\|<file>` | accept control messages |
| `--service-output=auto\|on\|off` | status messages on stdout |
| `--use-api` | let the app drive collection through `JetBrains.Profiler.Api` |
| `--propagate-exit-code` | return the profiled app's exit code (65 on profiler failure regardless) |
| `--time-measurement=CpuInstruction\|ThreadTime` | Sampling/Tracing/LineByLine only; default CpuInstruction |
| `--disable-tpl` | Timeline only; faster, but no `Task` nodes or async continuations |

**The extension is `.dtp` for every profiling type**, Timeline included — the CLI's own help
shows `snapshot.dtp` in its Timeline example. Older docs mentioning `.dtt` do not match this CLI.

**A snapshot is a file set.** `--save-to=snap.dtp` writes `snap.dtp` (a small index, a few hundred
bytes) plus `snap.dtp.0000`, `snap.dtp.0001`, and so on — Timeline runs produce twenty or more,
and the bulk file can be tens of megabytes. Copy or archive the whole set; the `.dtp` alone is useless.

Container magic differs by type, and it decides whether the Rider MCP tools can read it:
`MFDTEM` for Timeline, `MFDTPF` for Sampling/Tracing/LineByLine. Check with `head -c 8 snap.dtp`.

## dotMemory CLI

Commands: `get-snapshot`, `attach`, `start`, `start-net-core`. Windows adds `start-iis`,
`start-iis-express`, `start-windows-service`, `start-wcf-service`, `start-winrt`,
`profile-new-processes`, and the matching `list-*` commands.

```bash
dotMemory.exe get-snapshot 6844 --save-to-dir=C:\Snapshots
dotMemory.exe attach MyApp.exe --trigger-timer=30s
dotMemory.exe start --trigger-timer=30s C:\MyApp\MyApp.exe MyAppArg1
```

| Option | Meaning |
| --- | --- |
| `--save-to-dir=<dir>` / `--save-to-file=<path>` | where the `.dmw` workspace lands |
| `--trigger-timer=<30s>` | snapshot on an interval |
| `--trigger-mem-inc=<50%>` | snapshot when memory grows by a threshold — the leak trigger |
| `--trigger-delay=<5s>` | ignore the trigger until startup settles |
| `--trigger-on-activation` | snapshot the moment the profiler attaches, for a baseline |
| `--with-max-mem` | keep the snapshot taken at peak memory |
| `--service-output` | emit status messages on stdout |
| `--service-input=stdin\|<file>` | accept control messages |
| `--use-api` | let the app drive collection through `JetBrains.Profiler.Api` |

`--trigger-on-activation` plus `--trigger-mem-inc` gives a before/after pair from one run, which
is what a human needs to diff a leak.

**There is no reader.** Rider exposes five `dotTrace*` MCP tools and zero `dotMemory*` ones. A
`.dmw` is a ZIP holding `workspace.idx`, `workspace.json`, and a proprietary `ProfilingData`
payload; the JSON says nothing useful about the heap. Collect a `.dmw` only for a human.

## stdin control protocol

Both profilers read JSON-array messages on stdin when started with `--service-input=stdin`.

```
##dotTrace["get-snapshot", {pid:1234}]
##dotTrace["disconnect"]
##dotTrace["help"]

##dotMemory["get-snapshot", {pid:1234}]
##dotMemory["disconnect"]
```

With `--service-output`, dotMemory answers on stdout:

```
##dotMemory["workspace-saved", {path: "..."}]
```

Parse that line to learn the workspace path instead of globbing the output directory.

## Reading a snapshot: the Rider MCP tools

The only agent-accessible reader. Hosted inside a running Rider, so there is no CI or headless
story — in CI, collect the snapshot as a build artefact and analyse it later on a workstation.

| Tool | Returns |
| --- | --- |
| `dotTraceGetSnapshotInfo` | duration, selected range, active filter; tells you Timeline vs Performance |
| `dotTraceGetSnapshotFilters` | radio groups (`event`, `thread-state`, `fileio-direction`) and enums (`thread`, `subsystem`, `allocated-type`, GC buckets, CPU cores) with raw IDs |
| `dotTraceGetCallTree` | `LEGEND` of `<Id>: [SYS\|USR] <Fqn>` plus `STACKS` of `<Path> @<NodeId> (own; total; %)` |
| `dotTraceGetTimeline` | per-bucket CPU and GC, interval heatmaps, notable events, per-thread activity |
| `dotTraceGetTimelineEvents` | individual exceptions, SQL, HTTP, file I/O, JIT, contention, debug output |
| `dotTraceOpenReport` | renders an HTML report in a Rider editor tab from a strict JSON schema |

Shared parameters: `format` (`compact` default and preferred, or `json`), the `filter*` family,
and `timeRangeStart`/`timeRangeEnd` (`1000ms`, `1.5s`, `00:00:01.500`).
`dotTraceGetCallTree` adds `maxNodes`, `mergeMode` (`all`/`system`/`none`), `minOwnTimePercent`
(defaults to 1.0 — pass 0 to disable), `minTotalTimePercent`, and `nodeId`.
`dotTraceGetTimeline` adds `buckets` (default 50) and `filterIntervals`
(`ui-freeze`, `gc`, `http`, `tasks`, `jitting`, `fileio`, `sql`, `exception`, `contention`).
`dotTraceGetTimelineEvents` adds `eventTypes` and `maxEvents` (`0` = group summaries only).

Sharp edges:

- Pass `nodeId` as a **quoted string**. It is an unsigned 64-bit decimal; sent as a JSON number it
  rounds through a double and selects the wrong node.
- A `nodeId` is bound to its filter context. Reuse the parent call's exact filters, time range,
  and `mergeMode` when drilling in, or you get "Node … is not found in the cache".
- Payload units follow the active event filter: nanoseconds for time/gc/jit/fileio (rendered as ms
  in the tree), bytes for `filterEvent=memory`.
- On Performance snapshots every filter and the time range are silently ignored with a warning,
  never an error — so a filter that appears to work may have done nothing.
- Deep recursive trees (Avalonia layout, WPF measure/arrange) can show ~0 ms own-time everywhere
  and exhaust `maxNodes` before reaching leaves. Raise to 200–300; if leaves stay unreachable,
  report the recursive subtree's total time rather than inventing a leaf.

Rider ships its own `dottrace-analyze` skill driving these tools, with an eight-step workflow and
app-type playbooks. It lives inside the Rider install at
`plugins/aidevtools/lib/modules/intellij.aidevtools.contrib.ide.rider.jar`, under
`bundledSkills/dottrace-analyze/`. Its triage thresholds are worth borrowing: GC time above 10%
of wall time means memory pressure; waiting above 50% means blocking; over 100 exceptions per
minute is an anti-pattern; a thread count above 3x cores risks starvation; any single method
above 40% own-time is a single bottleneck; over 50 SQL events in a short window suggests N+1.

## dotTrace SDK

The blog describing `dottrace-analyze` says it "uses the dotTrace SDK to read the profile". That
SDK ships as `JetBrains.DotTrace.Sdk.dll` and `JetBrains.dotTrace.SnapShotApi.dll` inside the Rider
install (`plugins/dotTrace.dotMemory/DotFiles/`). It is **not published on NuGet** — a search for
JetBrains profiler SDK packages returns only `JetBrains.Profiler.Api` and
`JetBrains.Profiler.SelfApi`, both of which write snapshots rather than read them. Treat the SDK
as an internal implementation detail reached through the MCP tools, not a supported dependency.

## Self-profiling, for processes you cannot attach to

`JetBrains.Profiler.SelfApi` downloads the profiler at runtime and drives it from inside the
app. Use it for a container, a staging box, or a crash window too short to attach to.

```csharp
DotTrace.Init();
var config = new DotTrace.Config();
config.SaveToDir("/tmp/snapshots");
DotTrace.Attach(config);
DotTrace.StartCollectingData();

SomeMethod();          // calls DotTrace.SaveData() to cut a snapshot

DotTrace.Detach();
```

dotMemory follows the same shape: `DotMemory.Init()`, a `DotMemory.Config`, then
`DotMemory.GetSnapshotOnce(config)`.

`JetBrains.Profiler.Api` is the sibling package. It marks regions from inside the app while an
external profiler runs with `--use-api`, so the snapshot covers the region you care about
instead of the whole process lifetime.

## dotCover

Commands in 2026.2: `cover`, `merge`, `report`, `version`, `help`.

```bash
dotCover cover --target-executable=<path> --snapshot-output=cover.dcvr --exclude-assemblies="*.Tests"
dotCover report --json-report-output=coverage.json
```

`--json-report-output` and `--xml-report-output` are the agent-readable seams.
`--json-report-covering-tests-scope=[none|assembly|type|method|statement]` sets granularity —
`statement` is large, so prefer `type` or `method` unless you need line detail.

Older `--reportType` / `--dcReportType` flags and the XML config file are gone in current
versions. Long argument lists go in a response file: `dotCover cover @args.txt`.

## dotMemory Unit

NuGet `JetBrains.DotMemoryUnit`, run through a standalone launcher, works with MSTest, NUnit,
and xUnit.net. The value is that a memory fact becomes a red test, not a paragraph.

```csharp
dotMemory.Check(memory => Assert.That(
  memory.GetObjects(where => where.Type.Is<Foo>()).ObjectsCount,
  Is.EqualTo(0)));
```

## dotnet-trace

Commands: `collect`, `collect-linux`, `convert`, `ps`, `list-profiles`, `report`.

```bash
dotnet-trace collect -p <pid> --duration 00:00:00:30 -o trace.nettrace
dotnet-trace collect -- dotnet exec app.dll
dotnet-trace report trace.nettrace topN -n 20 --inclusive
dotnet-trace convert trace.nettrace --format Speedscope
```

- `--duration` takes `dd:hh:mm:ss`. `00:00:00:30` is thirty seconds.
- `--format` accepts `Chromium`, `NetTrace` (default), `Speedscope`.
- Profiles: `dotnet-common`, `dotnet-sampled-thread-time`, `gc-verbose`, `gc-collect`, `database`.
  Omitting `--profile`, `--providers`, and `--clrevents` enables the first two.
- `report topN` defaults to exclusive time; `--inclusive` totals the whole subtree.
- `collect-linux` is a preview verb needing root and kernel 6.4+. It captures native and kernel
  frames, but `convert` and `report` may not accept its output yet.
- Speedscope and Chromium conversions are lossy and one-way. Keep the `.nettrace`.

## dotnet-counters

Commands: `collect`, `monitor`, `ps`.

```bash
dotnet-counters collect -p <pid> --refresh-interval 1 --format json -o counters.json
dotnet-counters collect --format json --counters System.Runtime,Microsoft.AspNetCore.Hosting -- dotnet mvc.dll
```

`--format` accepts `csv` or `json`. `--counters` takes `provider_name[:counter_name]`; a bare
provider yields all of its counters. `System.Runtime` covers GC, JIT, thread pool, lock
contention, exceptions, and working set — enough to route the investigation.

Use `collect` and not `monitor` from an agent. `monitor` renders a live TUI that gives you
nothing to parse.

## dotnet-gcdump

Commands: `collect`, `ps`, `report`.

```bash
dotnet-gcdump collect -p <pid> -o after.gcdump
dotnet-gcdump report after.gcdump
```

`report` prints a heap-stat table — size, count, and type — to stdout, on every platform. That
matters because the `.gcdump` file itself opens only in PerfView or Visual Studio on Windows.
`report -p <pid>` skips the file and reports on a live process.

`collect` triggers a full gen-2 collection and can suspend a large-heap process for a long time.
Its buffer can grow to 256 MB inside the target. Do not run it against a memory-constrained
container or a latency-sensitive production process without saying so first.

## dotnet-dump

Commands: `collect`, `analyze`, `ps`.

```bash
dotnet-dump collect -p <pid> --type Heap -o app.dmp
dotnet-dump analyze app.dmp -c "dumpheap -stat" -c "gcroot 00007f6ad09421f8" -c exit
```

`--type` accepts `Full` (default), `Heap`, `Mini`, `Triage`. `Heap` is the usual choice for a
leak; `Triage` strips PII, which matters for a customer dump.

The leak sequence is always the same three commands:

1. `dumpheap -stat` — which type grew
2. `dumpheap -mt <MethodTable>` — addresses of its instances
3. `gcroot <address>` — the reference chain that keeps it alive

Other commands worth knowing: `dumpheap -type <partial-name> -stat` to scope by namespace,
`dumpheap -min 100000 -stat` for the large objects, `syncblk` for lock owners in a deadlock,
`clrstack -all` for every thread's stack, `pe` to print an exception, `finalizequeue` for objects
awaiting finalisation.

`analyze` needs a matching-bitness tool, and on macOS supports .NET 5 and later. Inside a
container it needs `ptrace` — start the container with `--cap-add=SYS_PTRACE`.
