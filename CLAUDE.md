Skills live under `skills/`, in one bucket folder per purpose:

- `design/`: bound a design space, then build the identity.
- `engineering/`: daily code work.
- `planning/`: turn direction into a backlog that a team can execute.

Each skill is a directory. It holds a `SKILL.md` (the entry point) and the support files that `SKILL.md` references, for example `rules.md` and examples.

When you add or remove a skill:

- Every shipped skill must have a row in the top-level `README.md` and an entry in `.claude-plugin/plugin.json`. The row links the skill name to its `SKILL.md`.
- Each bucket folder has a `README.md` that lists its skills with one-line descriptions. Each row links the skill name to its `SKILL.md`.

Each skill is **model-invoked** or **user-invoked**:

- **Model-invoked** (default): the agent can start it without a prompt. The frontmatter `description` is for the model. Keep the "Use when the user asks.../mentions..." triggers, because auto-invocation reads them.
- **User-invoked**: the skill runs only when the human types its name. Set `disable-model-invocation: true`. Write a plain `description` for humans, without the trigger phrasing.
