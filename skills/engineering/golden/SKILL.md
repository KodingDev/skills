---
name: golden
description: >
  Golden-from-the-start engineering: build the durable version of anything
  new, and hold existing code to the same bar. Use when designing or building
  a new feature, API, module, or package, when professionalizing a prototype,
  when reviewing a diff or module for shape and quality, or when the user says
  "golden", "gorgeous", "prod grade", or "built to last".
---

# Golden

Architecture audits repair codebases that were built badly. This skill is the other half.
When you build, build the version that never needs the audit. Make it golden from the start.
Make it exactly as simple as the shape of the problem — not more simple, and not more grand.

Two failure modes kill more codebases than bugs do. Prevent both:

- **The converter.** The correct architecture is in reach, but you ship a translation layer
  that puts new paint on the old mess. A wrapped bad shape is not a replaced shape. The mess
  is now load-bearing *and* hidden. If you can build the golden shape in this change, build
  it. If you cannot, say so and scope an honest intermediate step. Do not present a converter
  as the abstraction. Golden assumes zero refactor cost: no compatibility layer, no
  tombstones, no 1:1 port of a shape nobody wants, unless the user asks for compatibility.
  Replace and delete; history keeps the old shape.
- **The over-build.** Speculative generality, configuration that nobody asked for, a
  framework where a function is sufficient. If the user asks for a dump, give a dump — not a
  pipeline that parses and audits the dump. Deliver the shape of this problem, not the shape
  of each problem that it makes you think of.

## The bar

**One source of truth, declarative.** A new case must cost one configuration entry, not a new
code path. If you find parallel near-duplicates (three components that differ by a string,
four handlers that differ by a field), collapse them into one parameterized shape that data
controls. Behavior lives in one place. Variation lives in data.

**Nothing is special.** Each "special" case is a warning sign. An admin is a user with a
role. A scheduled report is a report with a timer. An alert channel is a transport plus a
format. Before you add a new kind, type, or flag with its own logic, ask what generic thing
it is. The special part is usually data (a name, a threshold, a table entry), not a type with
its own machinery.

**Boundaries hold.** A generic layer — engine, core, shared — carries no domain vocabulary,
in identifiers, comments, or branches. A product name in a shared module is a special case
wearing a name. The generic layer exposes a hook or a data slot; the domain fills it from
its own package.

**Schema-first contracts.** Define each data shape once — as a schema, type, dataclass, or
proto, whatever the stack offers. Derive the validation, the parsing, and the defaults from
that definition. A hand-written check beside a shape definition is the same contract written
two times, and worse.

**Composable pieces.** Build small modules with honest seams that connect. Then the next
thing is built *from* them, not beside them. If a consumer must reach inside a module, the
boundary is wrong.

**Damn simple.** Each file, flag, abstraction, and dependency earns its place, or you delete
it. Run the deletion test on your design before review: what here will a competent reader
delete? A carve-out too specific to generalize is debt at birth.

**Public surfaces get real contracts.** Give exported APIs precise signatures: named options,
enumerated variants, no stringly-typed grab bags. Give them real doc comments (TSDoc,
docstring, rustdoc — whatever the language uses): what the API does, its parameters, and the
constraint that is not obvious. This documents a contract. It does not narrate.

**No narration in the code.** Internals get zero comments by default. A comment earns its
place only when it states a *why* that is not obvious: a hidden constraint, or a workaround
for a specific bug. One line is the maximum. Delete everything else — what the next line
does, the plan, what changed, an essay above a statement. That text is chain-of-thought that
leaked into the file. Reasoning lives in the chat and in the PR conversation. The code stays
clean. Section banners, change-log comments, and notes git history already holds are
narration too.

**Tests are scarce and load-bearing.** A few generic tests through shared builders, not a
fixture wall or a test per named case. No hard-coded environment, no side effects, no
integration tests unless asked.

**Finish with a DX pass.** Working code is the floor. When the code works, spend one pass as
your own consumer. Call the API cold. Wire the component up fresh. Each point of friction is
a defect: a name that confuses, a boilerplate ritual, an error that does not say what to do.
Fix each defect now, while the context is loaded.

## As a review lens

On a diff, a PR, or an existing module, the bar above is the rubric. Name the golden shape
in a sentence or two, then fix what you found in place; list only when the user says
report-only.

## Contrast

Each case bespoke: each alert channel has grown its own delivery path, its own retry scheme,
and its own bookkeeping. One channel quietly hides a routing policy. The next channel will
grow all four again:

```ts
function sendSlackAlert(alert: Alert) {
  const hook = SLACK_HOOKS[alert.team] ?? DEFAULT_HOOK
  slackQueue.push({ hook, text: toMrkdwn(alert) })
  slackRetryTimers.set(alert.id, setTimeout(() => resendSlack(alert), 30_000))
}

function sendEmailAlert(alert: Alert) {
  mailer.send(emailRouting.lookup(alert.team), renderHtml(alert), { retries: 3 })
  sentEmailLog.push(alert.id)
}

function sendPagerAlert(alert: Alert) {
  if (alert.severity === "critical" || alert.team === "payments") {
    pagerClient.trigger(alert.id, alert.message.slice(0, 512))
  }
  pagedAlerts.add(alert.id)
}
```

One shape, cases as data: the machinery exists once. The part that made each channel
"special" survives as a field:

```ts
const CHANNELS: Record<Channel, ChannelSpec> = {
  slack: { deliver: postWebhook, format: toMrkdwn,   retries: 3 },
  email: { deliver: sendMail,    format: renderHtml, retries: 3 },
  pager: { deliver: triggerPage, format: toPlain,    retries: 5, minSeverity: "critical" },
}

function send(alert: Alert, channel: Channel) {
  const spec = CHANNELS[channel]
  if (spec.minSeverity && !atLeast(alert.severity, spec.minSeverity)) return
  withRetry(spec.retries, () => spec.deliver(spec.format(alert)))
}
```

## Done when

- The next likely case touches data, not logic. Name the case and make sure that this holds.
- No domain vocabulary in a generic layer; no tombstone the user did not ask to keep.
- Nothing wraps or converts a shape that you had the reach to replace.
- Each data shape is declared once, as a schema or type. Its validation, parsing, and
  defaults derive from that declaration.
- No consumer of a module reaches inside its boundary to do its job.
- The deletion test passes: no file, flag, or abstraction remains that a competent reader
  will delete.
- Public surfaces have precise signatures and doc comments. A cold consumer gets from import
  to a working call without the source.
- No comment in the diff narrates what the code says. Each comment that remains is a one-line
  *why* that is not obvious.
- Tests are few, generic, and side-effect free.
- You did the DX pass and corrected what it found. You did not file it.
