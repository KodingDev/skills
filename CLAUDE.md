Skills live under `skills/`, grouped into bucket folders by purpose:

- `engineering/` — daily code work

Each skill is a directory containing a `SKILL.md` (the entry point) plus any
support files it references (e.g. `rules.md`, examples).

When adding or removing a skill:

- Every shipped skill must have a row in the top-level `README.md` (skill name
  linked to its `SKILL.md`) and an entry in `.claude-plugin/plugin.json`.
- Each bucket folder gets a `README.md` listing its skills with one-line
  descriptions, skill name linked to its `SKILL.md`.

Each skill is **model-invoked** or **user-invoked**:

- **Model-invoked** (default) — the agent can reach it on its own. The frontmatter
  `description` is model-facing: keep the "Use when the user asks…/mentions…"
  triggers so auto-invocation fires.
- **User-invoked** — reachable only when the human types its name. Set
  `disable-model-invocation: true` and write a plain human-facing `description`,
  dropping the trigger phrasing.
