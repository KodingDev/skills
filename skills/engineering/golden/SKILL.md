---
name: golden
description: >
  Golden-from-the-start engineering: build the durable version of anything
  new. Use when designing or building a new feature, API, module, or package,
  when professionalizing a prototype, or when the user says "golden",
  "gorgeous", "prod grade", or "built to last".
---

# Golden

Architecture audits exist to dig codebases out of holes that were dug at build
time. This skill is the other half: when you are the one building, build the
version that never needs the audit. Golden from the start — and exactly as
simple as the problem's shape, no simpler and no grander.

Two failure modes kill more codebases than bugs do. Kill both:

- **The converter.** The correct architecture is in reach, but you ship a
  translation layer from the old mess to a new coat of paint. Wrapping a bad
  shape is not replacing it; the mess is now load-bearing *and* hidden. If the
  golden shape is buildable in this change, build it. If it genuinely isn't,
  say so out loud and scope the honest intermediate step — don't dress a
  converter up as the abstraction.
- **The over-build.** Speculative generality, config nobody asked for, a
  framework where a function would do. When the user asks for a dump, they get
  a dump — not a parsing-and-auditing pipeline around it. Deliver the shape of
  the problem, not the shape of every problem it reminds you of.

## The bar

**One source of truth, declarative.** A new case costs one config entry, not a
new code path. When you catch parallel near-duplicates (three components that
differ by a string, four handlers that differ by a field), collapse them into
one parameterized shape driven by data. Behavior lives in one place; variation
lives in data.

**Nothing is special.** Every "special" case is a smell: an admin is a user
with a role, a scheduled report is a report with a timer, an alert channel is
a transport plus a format. Before adding a new kind/type/flag with its own
logic, ask what generic thing it actually is — the special part is usually
data (a name, a threshold, a table entry), not a type with its own machinery.

**Schema-first contracts.** Define each data shape once — schema, type,
dataclass, proto, whatever the stack offers — and derive from it: validation,
parsing, defaults. Hand-rolled checking beside a shape definition is the same
contract written twice, worse.

**Composable pieces.** Small modules with honest seams that click together, so
the next thing gets built *from* them rather than beside them. If a consumer
would need to reach inside, the boundary is drawn wrong.

**Damn simple.** Every file, flag, abstraction, and dependency earns its place
or goes. Run the deletion test on your own design before anyone reviews it:
what here would a competent reader delete? Over-specific carve-outs that don't
generalize are debt at birth.

**Public surfaces get real contracts.** Exported APIs get precise signatures —
named options, enumerated variants, no stringly-typed grab bags — and real doc
comments (TSDoc, docstring, rustdoc, whatever the language uses): what it
does, its parameters, the non-obvious constraint. This is documentation of a
contract, not narration.

**No narration in the code.** Internals get zero comments by default. A
comment earns its place only by stating a non-obvious *why* — a hidden
constraint, a workaround for a specific bug — and one line is the ceiling.
Everything else (what the next line does, the plan, what changed, a paragraph
essay above a statement) is chain-of-thought leaked into the file: delete it.
Reasoning lives in the chat and the PR conversation; the code stays clean.

**Finish with a DX pass.** Working is the floor. Once it works, spend one pass
as your own consumer: call the API cold, wire the component up fresh. Every
point of friction — a confusing name, a boilerplate ritual, an error that
doesn't say what to do — is a defect to fix now, while the context is loaded.

## Contrast

Every case bespoke — each alert channel has grown its own delivery path, its
own retry scheme, its own bookkeeping, and one of them is quietly hiding a
routing policy. The next channel will grow all four again:

```
function sendSlackAlert(alert) {
  hook = SLACK_HOOKS[alert.team] or DEFAULT_HOOK
  slackQueue.push({ hook, text: toMrkdwn(alert) })
  slackRetryTimers[alert.id] = scheduleResend(alert, 30s)
}

function sendEmailAlert(alert) {
  mailer.send(emailRouting.lookup(alert.team), renderHtml(alert), retries: 3)
  sentEmailLog.append(alert.id)
}

function sendPagerAlert(alert) {
  if (alert.severity == "critical" or alert.team == "payments") {
    pagerClient.trigger(alert.id, truncate(alert.message, 512))
  }
  pagedAlerts.add(alert.id)
}
```

One shape, cases as data — the machinery exists once, and what made each
channel "special" survives as a field:

```
CHANNELS = {
  slack: { deliver: postWebhook, format: toMrkdwn,   retries: 3 },
  email: { deliver: sendMail,    format: renderHtml, retries: 3 },
  pager: { deliver: triggerPage, format: toPlain,    retries: 5, minSeverity: "critical" },
}

function send(alert, channel) {
  spec = CHANNELS[channel]
  if (spec.minSeverity and alert.severity < spec.minSeverity) return
  withRetry(spec.retries, () => spec.deliver(spec.format(alert)))
}
```

## Done when

- Adding the next likely case touches data, not logic — name the case and
  check.
- Nothing wraps or converts a shape you had the reach to replace.
- Every data shape is declared once (schema or type) and its validation,
  parsing, and defaults derive from that declaration.
- No consumer of any module reaches inside its boundary to get its job done.
- The deletion test passes: no file, flag, or abstraction a competent reader
  would remove.
- Public surfaces have precise signatures and doc comments; a cold consumer
  gets from import to working call without reading the source.
- No comment in the diff narrates what the code already says; any that remain
  are one-line non-obvious whys.
- You did the DX pass and fixed what it surfaced — not filed it.
