<p align="center">
  <img src="./assets/banner.svg" alt="skills — for coding agents that should know better" width="100%">
</p>

[![skills.sh](https://skills.sh/b/KodingDev/skills)](https://skills.sh/KodingDev/skills) · [MIT](./LICENSE)

Agent skills I actually use to get real work done with coding agents — not vibe
coding. Each one is a single folder: a `SKILL.md` and whatever files it needs.
No runtime, no config, nothing to wire up.

They follow the [skills.sh](https://skills.sh) format, so they run in Claude
Code, pi, and anything else that speaks Agent Skills. Small, easy to adapt,
composable, and model-agnostic. Fork them, tweak them, make them yours.

## Quickstart

```bash
npx skills@latest add KodingDev/skills
```

Pick the skills you want and which agents to install them on. That's it.

## What's inside

### Engineering

- **[cdk-best-practices](./skills/engineering/cdk-best-practices/SKILL.md)** —
  point it at AWS CDK code (a file, a construct, a whole package) and it audits
  against a 27-rule catalog: least-privilege grants, broad IAM, hardcoded names,
  removal policies, construct anatomy, CDK Nag, and more. Returns a prioritized
  `file:line` report with a concrete fix per finding.

## Adding a skill

Drop a folder under a bucket, write `SKILL.md`, then register it in the README,
its bucket README, and `plugin.json`. Conventions live in
[`CLAUDE.md`](./CLAUDE.md).

```
skills/<bucket>/<skill>/SKILL.md   the skill, plus any support files it reads
.claude-plugin/plugin.json         manifest skills.sh installs from
```

MIT © Stella Inwood
