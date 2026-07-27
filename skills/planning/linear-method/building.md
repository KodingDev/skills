# Building

Doing the work: momentum, cycles, issues, design projects, user feedback, launches, changelog.

## Generate momentum

Source: [linear.app/method/building-with-momentum](https://linear.app/method/building-with-momentum)

- Take swift action and make visible progress every day. Instead of thinking or talking about
  doing something, decide to do it or not to do it — today instead of tomorrow, this week
  instead of next.
- When direction is unclear, **don't freeze**. Trust intuition and do something that seems to
  make sense; talk to more users and clarity arrives with the feedback.
- Operate so decisions can be corrected or reverted — reversibility is what makes acting fast safe.

## Work in cycles

- **n-week cycles**, most commonly 2 weeks. Decide priorities and assign responsibilities per cycle.
- **Mix feature and quality work.** Bugs and fixes go in the cycle alongside features, not into a
  separate queue that never gets pulled.
- **Measure progress with actual work.** The clearest way to see whether something is complete is
  to show the diff in the code or the design file.

## Write issues, not user stories

Source: [linear.app/method/write-issues-not-user-stories](https://linear.app/method/write-issues-not-user-stories)

User stories were invented over twenty years ago to translate customer desires into technical
requirements. That translation layer is obsolete: customers describe requirements directly, common
patterns (carts, todo lists, notifications) have settled standards, and strong product and
engineering teams already know their users. What's left is a ritual that obscures the actual work
in roundabout language, takes time to write and read, turns engineering into requirement compliance
instead of thinking about the whole experience, and pushes product-level detail down to task level.

Four rules replace it.

**Describe a concrete task or problem.** An issue names work with a clear, defined outcome — code,
a design, a document, an action. Work without such an outcome isn't an issue; it belongs in a
document or a conversation. Break large features into smaller, tangible pieces. Exploratory work
is allowed as a placeholder — "Explore designs" — or framed as a deliverable — "Write project spec".

**Write clearly and directly.** Titles are short, simple, and state what the task is, because they
are read in a list or on a board. Descriptions are optional: include the context needed to do the
work and link out to deeper discussion. For feature requests and bug reports, **quote user
feedback directly instead of summarizing it** — quotes are more authentic and faster to capture —
and link to the original conversation.

**Write your own issues.** The person who understands the work best writes it. Writing forces the
analysis that surfaces a better approach, a shortcut, or a missing piece of the plan, and shifts
focus from checking off tasks to delivering the project. Bugs and feature requests are the
exception: when someone else files it, frame it as a request or a problem, let the assignee work
out the solution, and rewrite it as a task once the approach is settled.

**Keep UX discussion at the product level.** Customer experience is discussed during spec and
roadmap work, with designers, engineers, and customer-facing people in the room — so the team
understands user needs, limitations, and requirements without task-level restatement. Then the
work is delegated with an expectation of delivery, and execution mode begins.

**Done when:** every issue names a task with a defined outcome, has a scannable title, and was
written by the person doing the work (or is an explicitly-framed request awaiting rewrite).

## Manage design projects

Source: [linear.app/method/manage-design-projects](https://linear.app/method/manage-design-projects)

Design looks incompatible with project management because outcomes are unpredictable and timelines
hard to estimate. Stage it instead of estimating it — you can't put a date on "have the right idea",
but you can bound the *phase* in which having it is the job, and everything after that phase is
ordinary discrete work.

1. **Verify the problem.** Problem statements from customers and sales usually describe a
   *perceived solution*. Investigate the surface issue to find the root cause and solve for that.
   Review requests across your feedback channels, then write the project spec before implementing.
2. **Explore.** One placeholder issue — "Explore designs" — holds this phase, hours to days
   depending on complexity. Explore **without judgment** about feasibility, design-system fit, or
   viability; bad ideas are a natural step and clarify thinking. Combine research into best
   practices with experiments in the design tool.
3. **Use feedback.** Get teammate feedback early, while still exploring. When someone objects,
   **ask why** rather than taking it as a signal the direction is bad. Alternate between asking for
   holistic review and asking about specific details, and say which you want — unstated intent
   produces unhelpful tangents. Share via screenshots or links in comments with targeted @mentions;
   a short video walkthrough alongside the link explains what changed and what feedback you need.
4. **Choose a direction.** Flesh it out with engineers involved — they surface technical limits and
   alternatives, and the collaboration deepens understanding of the problem. Turn it into a list of
   discrete design tasks done in sequence: marking something done feels good and pulls focus to the
   next task, where one huge task doesn't.
5. **Hand over by not handing over.** Collaboration starts when the spec is written, not at the
   end. Designers and engineers work in the same project rather than separate team silos, both file
   their own issues, and divided work becomes sub-issues. Any user-facing feature has a designer on
   the team. Implementation sub-issues reference the design decisions and files.

**Done when:** the root cause is stated (not the requested solution), exploration lived in its own
placeholder issue, and remaining design work is a list of discrete closeable tasks.

## Build with users

Source: [linear.app/method/build-with-users](https://linear.app/method/build-with-users)

Early startup work is mostly learning what customers want: seek out users, iterate, stay flexible.
Two failure modes bound it — **too vision-based** products miss user and market needs; **too
reactive** products become Frankenstein creations without a clear purpose. Keep refining the vision
*based on* feedback rather than choosing a side.

- **Solve problems, not features.** Users project their needs from the product they can see today,
  not the one you're building. Ask questions back and move the conversation from the feature
  request to the problem behind it — that reveals whether the problem is valuable or nice-to-have,
  and opens up multiple solutions to choose between.
- **Build for the right users.** Feedback from outside your target demographic sets you on the
  wrong path — an enterprise customer's needs will mislead a product for early-stage startups.
- **Don't let feedback alone dictate the roadmap.** Strategic initiatives are what balance user
  needs against company needs.

## Launch and keep launching

Source: [linear.app/method/launching](https://linear.app/method/launching)

There is no singular launch moment. One massive launch needs long preparation, concentrates risk,
and wastes the effort if it fails. Repeated launches build the narrative and the audience instead —
each one reaches more people than the last, and each is a reminder that you exist and are moving.
An early product has no universal fit, so launching to gain users and momentum beats waiting for
the right time.

Linear announced before the product was done, launched on seed funding, launched again on open
access and pricing, launched again at Series A. A single launch would have taken 1.5 years to reach
the same place, with less learning and fewer customers.

## Build in public

Source: [linear.app/method/build-in-public](https://linear.app/method/build-in-public)

Showing your work feels risky and usually isn't — competitors are more likely to be discouraged by
your speed than helped by the visibility.

**Write a changelog.** Summarize the work weekly, even with a small user base. It reminds the team
what it accomplished and reinforces the habit of shipping constantly, shows customers the product
is improving, gives investors visible progress, and — when momentum feels stalled — proves how much
actually got done.
