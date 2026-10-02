# Building

Do the work: momentum, cycles, issues, design projects, user feedback, launches, changelog.

## Generate momentum

Source: [linear.app/method/building-with-momentum](https://linear.app/method/building-with-momentum)

- Act fast and make visible progress each day. Do not think or talk about doing something.
  Decide to do it or not: today, not tomorrow; this week, not next.
- If direction is unclear, **do not freeze**. Trust intuition and do something that seems to
  make sense. Talk to more users. Clarity arrives with the feedback.
- Make decisions that you can correct or revert. Reversibility makes fast action safe.

## Work in cycles

- **n-week cycles**, most commonly 2 weeks. Decide priorities and assign responsibilities per cycle.
- **Mix feature and quality work.** Bugs and fixes go in the cycle with features, not into a
  separate queue that nobody pulls.
- **Measure progress with actual work.** To see whether something is complete, show the diff in
  the code or the design file.

## Write issues, not user stories

Source: [linear.app/method/write-issues-not-user-stories](https://linear.app/method/write-issues-not-user-stories)

User stories translate customer desires into technical requirements. They are more than twenty
years old, and that translation layer is obsolete:

- Customers describe requirements directly.
- Common patterns (carts, todo lists, notifications) have settled standards.
- Strong product and engineering teams already know their users.

What is left is a ritual. It hides the actual work in roundabout language. It takes time to write
and read. It turns engineering into requirement compliance instead of thought about the whole
experience. It pushes product-level detail down to task level.

Four rules replace it.

**Describe a concrete task or problem.** An issue names work with a clear, defined outcome: code,
a design, a document, an action. Work without such an outcome is not an issue. It belongs in a
document or a conversation. Break large features into smaller, tangible pieces. Exploratory work
is allowed as a placeholder ("Explore designs") or as a deliverable ("Write project spec").

**Write clearly and directly.** Titles are short and simple, and they state the task, because
people read them in a list or on a board. Descriptions are optional. Include the context needed to
do the work, and link to deeper discussion. For feature requests and bug reports, **quote user
feedback directly instead of summarizing it**. Quotes are more authentic and faster to capture.
Link to the original conversation.

**Write your own issues.** The person who understands the work best writes it. Writing forces the
analysis that surfaces a better approach, a shortcut, or a missing piece of the plan. It shifts
focus from checking off tasks to delivering the project. Bugs and feature requests are the
exception. If someone else files one, frame it as a request or a problem. Let the assignee find
the solution. When the approach is settled, rewrite it as a task.

**Keep UX discussion at the product level.** Discuss customer experience during spec and roadmap
work, with designers, engineers, and customer-facing people in the room. Then the team understands
user needs, limits, and requirements without task-level restatement. Then delegate the work with an
expectation of delivery, and execution mode begins.

**Done when:** each issue names a task with a defined outcome, has a scannable title, and was
written by the person who does the work (or is an explicitly framed request that waits for rewrite).

### Filing into Linear

When the issues land in Linear (by hand, by API, or by an agent), three conventions apply:

- **Project vs parent issue.** A project is a 1-3 week outcome with its own milestones and status
  updates. A spec that breaks into a handful of tasks is a **parent issue with sub-issues**, about
  two levels deep. It is not a project. Use a project only when the work needs its own roll-up.
  A parent issue is the default for "one spec, several tickets".
- **Branch carries the key.** The branch name includes the issue key (`feat/ABC-123-...`). Linear
  then links the branch and PR to the issue and moves state on its own. If a branch was cut before
  the issue existed, rename it before the first push.
- **Spec on the parent, tasks on the children.** The parent issue holds the spec (the why, the
  scope, the acceptance criteria). Each sub-issue names one tangible task and links back. It does
  not restate the spec.

## Manage design projects

Source: [linear.app/method/manage-design-projects](https://linear.app/method/manage-design-projects)

Design looks incompatible with project management, because outcomes are unpredictable and
timelines are hard to estimate. Stage it instead of estimating it. You cannot put a date on "have
the right idea". You can bound the *phase* in which that idea is the job. Everything after that
phase is ordinary discrete work.

1. **Verify the problem.** Problem statements from customers and sales usually describe a
   *perceived solution*. Investigate the surface issue to find the root cause, and solve for that.
   Review requests across your feedback channels. Then write the project spec before you implement.
2. **Explore.** One placeholder issue ("Explore designs") holds this phase, for hours to days
   based on complexity. Explore **without judgment** about feasibility, design-system fit, or
   viability. Bad ideas are a natural step, and they clarify thinking. Combine research into best
   practices with experiments in the design tool.
3. **Use feedback.** Get teammate feedback early, while you still explore. If someone objects,
   **ask why**. Do not take it as a signal that the direction is bad. Alternate between requests
   for holistic review and questions about specific details, and say which you want. Unstated
   intent produces unhelpful tangents. Share screenshots or links in comments with targeted
   @mentions. A short video walkthrough with the link explains what changed and what feedback you
   need.
4. **Choose a direction.** Develop it with engineers involved. They surface technical limits and
   alternatives, and the collaboration deepens understanding of the problem. Turn it into a list of
   discrete design tasks done in sequence. Marking a task done feels good and pulls focus to the
   next task. One huge task does not.
5. **Hand over by not handing over.** Collaboration starts when the spec is written, not at the
   end. Designers and engineers work in the same project, not in separate team silos. Both file
   their own issues, and divided work becomes sub-issues. Each user-facing feature has a designer on
   the team. Implementation sub-issues reference the design decisions and files.

**Done when:** the root cause is stated (not the requested solution), exploration lived in its own
placeholder issue, and the remaining design work is a list of discrete closeable tasks.

## Build with users

Source: [linear.app/method/build-with-users](https://linear.app/method/build-with-users)

Early startup work is mostly learning what customers want: seek out users, iterate, stay flexible.
Two failure modes bound it. **Too vision-based** products miss user and market needs. **Too
reactive** products become Frankenstein creations without a clear purpose. Do not choose a side.
Keep refining the vision *based on* feedback.

- **Solve problems, not features.** Users project their needs from the product that they see
  today, not the one that you build. Ask questions back. Move the conversation from the feature
  request to the problem behind it. That shows whether the problem is valuable or nice-to-have,
  and it opens up multiple solutions to choose between.
- **Build for the right users.** Feedback from outside your target demographic sets you on the
  wrong path. For example, the needs of an enterprise customer mislead a product for early-stage
  startups.
- **Do not let feedback alone dictate the roadmap.** Strategic initiatives balance user needs
  against company needs.

## Launch and keep launching

Source: [linear.app/method/launching](https://linear.app/method/launching)

There is no single launch moment. One massive launch needs long preparation, concentrates risk,
and wastes the effort if it fails. Repeated launches build the narrative and the audience instead.
Each one reaches more people than the last, and each reminds people that you exist and move.
An early product has no universal fit, so launching to gain users and momentum beats waiting for
the right time.

Linear announced before the product was done, launched on seed funding, launched again on open
access and pricing, and launched again at Series A. A single launch would have taken 1.5 years to
reach the same place, with less learning and fewer customers.

## Build in public

Source: [linear.app/method/build-in-public](https://linear.app/method/build-in-public)

Showing your work feels risky, but it usually is not. Your speed is more likely to discourage
competitors than the visibility is to help them.

**Write a changelog.** Summarize the work each week, even with a small user base. The changelog:

- reminds the team what it accomplished and reinforces the habit of constant shipping,
- shows customers that the product improves,
- gives investors visible progress,
- proves how much got done when momentum feels stalled.
