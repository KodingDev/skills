Skills live under `skills/`, in one bucket folder per purpose:

- `design/`: bound a design space, then build the identity.
- `engineering/`: daily code work.
- `planning/`: turn direction into a backlog that a team can execute.

Each skill is a directory. It holds a `SKILL.md` (the entry point) and the support files that `SKILL.md` references, for example `rules.md` and examples.

When you add or remove a skill:

- Every shipped skill must have a row in the top-level `README.md` and an entry in the `skills` plugin's `skills` list in `.claude-plugin/marketplace.json`. The row links the skill name to its `SKILL.md`.
- Each bucket folder has a `README.md` that lists its skills with one-line descriptions. Each row links the skill name to its `SKILL.md`.

Each skill is **model-invoked** or **user-invoked**:

- **Model-invoked** (default): the agent can start it without a prompt. The frontmatter `description` is for the model. Keep the "Use when the user asks.../mentions..." triggers, because auto-invocation reads them.
- **User-invoked**: the skill runs only when the human types its name. Set `disable-model-invocation: true`. Write a plain `description` for humans, without the trigger phrasing.

Mods live under `mods/<mod>/`. Each mod is a Claude Code plugin of function hooks: `.claude-plugin/plugin.json`, `hooks/`, and its tests. A skill folder holds no plugin files, because `npx skills` installs the whole folder into every agent.

When you add or remove a mod:

- It must have an entry in `.claude-plugin/marketplace.json` with `"source": "./mods/<mod>"`, and a row in the README's Mods table.
- `claude plugin validate .` and `claude plugin test mods/<mod>` must pass.
