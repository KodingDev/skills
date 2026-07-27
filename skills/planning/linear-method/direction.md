# Direction

Shaping *what* to build: initiatives, goals, prioritization, scope, specs, backlog.

Direction work is where the method spends its patience. Everything in `building.md` is biased
toward acting fast, and that only stays safe when the thing being built fast is the right thing —
so this is the one place where a couple of weeks of thinking before starting is the recommended
default rather than the failure mode.

## Set the product direction with initiatives

Source: [linear.app/method/product-direction](https://linear.app/method/product-direction)

Direction is the highest-leverage work in building a product and a company. An **initiative**
articulates a vision and how you intend to build toward it; the set of them becomes a product
timeline that execution reads from.

- Write initiatives so a team working independently can still make a call without asking.
- Keep them visible to the whole company. Visible initiatives are why people can see their work
  matters, and transparency is what makes the direction trusted rather than announced.
- Reserve capacity against them for unexpected work. An initiative that consumes 100% of a team
  is a plan that breaks on the first incident.

**Done when:** every planned project sits under a named initiative, and each initiative states the
vision and the intended path, not just a theme.

## Set useful goals

Source: [linear.app/method/set-useful-goals](https://linear.app/method/set-useful-goals)

The usual objection to goal-setting at an early stage is that you lack the data to set a defensible
number. True, and not a reason to skip it — the goal's job here is to create direction and a
measurable notion of forward, not to be forecast-accurate.

- With no user data yet, a goal is useful if it **propels you forward in some measurable way** —
  it does not need to be derived from evidence you don't have.
- **Work backwards.** 10 users requires 1 user, which requires a product that is discoverable and
  usable. Name the step immediately before the target, and make that the goal.
- Scale in visible rungs — 10 users → 100 users → $1,000 MRR. Successful startups start with
  something small, figure it out, then scale.

**Done when:** the goal names a number and a date, and the immediately preceding rung is named too.

## Prioritize enablers and blockers

Source: [linear.app/method/prioritize-enablers-and-blockers](https://linear.app/method/prioritize-enablers-and-blockers)

Resources and time are finite, so every priority call must be explainable. Classify each candidate:

- **Enabler** — adds value the product doesn't have yet.
- **Blocker** — friction or a gap that prevents people from using what's already there.

Then answer three questions, in order:

1. **Impact** — if this succeeds, does it move a higher-level goal?
2. **Timeliness** — must this be done now, or can it be done later without penalty?
3. **Compounding** — does building it now create advantage, or create complexity and support cost?

Not all friction is a blocker. Separate *prevents use* from *improves the experience*.

Linear launched with Google Login only and deferred email and other methods — velocity elsewhere
was worth more than authentication completeness.

**Done when:** each prioritized item carries an enabler/blocker label and a now-or-later answer,
and each deprioritized item has a stated reason.

## Scope projects down

Source: [linear.app/method/scope-projects](https://linear.app/method/scope-projects)

The size limit is not an estimation convention — it's a forcing function. A three-week ceiling
makes the team cut to the most important feature set, because there is no room for anything else.
Loosen the ceiling and that pressure disappears.

- A project should be **completed in 1–3 weeks by 1–3 people**. Smaller work takes hours or a day.
- Short timelines force you to pick the most important feature set — that's the mechanism, not a
  side effect.
- Small teams move faster and cut management and communication overhead.
- Early on you cannot predict whether a project will be impactful, so large bets are expensive
  guesses. Continuous shipping buys quick feedback loops with customers instead.
- **When scope can't be reduced, break it into stages.** Ship an early version to yourselves and
  private beta users inside the first week, collect feedback immediately, fix in the weeks after.

Linear's Cycles and Projects each took roughly two weeks to design and build in MVP form.

**Done when:** no project exceeds 3 weeks / 3 people, or is explicitly staged into ones that don't,
with the first stage shippable to internal or beta users.

## Specs, owners, and the backlog

- **Every project has one named owner**, responsible for writing the brief and for delivery.
- **Write project specs, and aim for brevity.** Short specs get read; long ones get skimmed. The
  owner writes the spec and gathers feedback until the right approach is identified — expect a
  couple of weeks of thinking before building starts.
- **Keep the backlog manageable.** A focused backlog is what makes cycle planning fast. Prune it;
  an item nobody will ever pull is noise with a due date.
- **Understand your users.** Keep collected feedback as a research library to develop against,
  not as a queue to service.

**Done when:** each project has one owner and a spec short enough to read in one sitting, and the
backlog contains only work someone would plausibly pull into a cycle.
