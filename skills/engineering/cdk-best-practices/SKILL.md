---
name: cdk-best-practices
description: Audit an AWS CDK module, construct, stack, or package against AWS CDK best practices (project structure, IAM/grants, constructs, testing, CDK Nag, removal policies, anti-patterns). Use when the user asks to review/check/audit CDK code, a CDK construct or stack, a cdk module, or asks "is this CDK code following best practices".
---

# CDK Best Practices

Audit AWS CDK (TypeScript/Python/etc.) code against established best practices and anti-patterns.
Produce a prioritized, file:line-referenced report.

The full rule catalog with rationale and good/bad examples is in **`rules.md`** (read it before
auditing). Below is the workflow and the rule index.

## Workflow

1. **Scope the target.** Identify what to audit:
   - A single file/construct → audit that file.
   - A CDK package/module → focus on `bin/`, `lib/` (stacks + constructs), `test/`, `cdk.json`, `package.json`.
   - If unclear, ask which directory or file is the CDK code.

2. **Read `rules.md`** in this skill directory for the complete checklist, rationale, and code examples.

3. **Gather signals.** Use `grep`/Glob/Read over the target. The rules table below lists concrete
   grep signals for each check. Run them, then Read the surrounding code to confirm a true positive
   (a grep hit is a candidate, not a verdict — e.g. `process.env` in `bin/` is allowed).

4. **Classify each finding** by severity:
   - **High** — security or data-loss risk: overly broad IAM, hardcoded names blocking replacement,
     stateful resources that can lose data, missing removal/retention decisions on stateful resources.
   - **Medium** — maintainability/correctness: env vars inside constructs, CfnParameter for config,
     stacks used as modeling unit, missing tests, no CDK Nag, deploy-time decisions.
   - **Low** — style/convention: wildcard imports, missing JSDoc, snapshot-only testing.

5. **Report.** Group by severity. For each finding give: `file:line`, the rule name, what was found,
   why it matters (one line), and the concrete fix. If the code notably follows some practices, end with a
   short "Strengths" note — skip it rather than padding. Do not rewrite the user's code unless they ask — recommend.

## Rule index

Read `rules.md` for full detail. The `#` column matches the rule numbers in `rules.md` exactly —
cite these in findings. Quick grep signals (confirm each hit by reading the code):

| # (in rules.md) | Rule | Severity | Grep signal (candidate) |
|---|------|----------|-------------------------|
| 1 | Least-privilege grants (`grantRead` over `grantReadWrite`/`grantFullAccess`) | High | `grantReadWrite\|grantFullAccess\|grantWrite` |
| 2 | No broad IAM actions (`*`, `iam:*`, `s3:*`) in `PolicyStatement` | High | `actions:.*\*\|'\*'\|"\*"` near `PolicyStatement` |
| 3 | Recognize the IAM-role approach (CDK-managed / pre-created / customized) | — | `Role.fromRoleArn\|new Role` |
| 3b/4 | No hardcoded physical names | High | `bucketName:\|tableName:\|functionName:\|queueName:\|roleName:` |
| 5 | Decide at synthesis time, not deploy time (no `CfnParameter`/`CfnCondition`/`Fn.if`) | Medium | `CfnParameter\|CfnCondition\|Fn\.conditionIf\|Fn\.if` |
| 6 | Explicit removal policy + log retention on stateful resources | High | `new Bucket\|new Table\|new Database`; check for `removalPolicy`/`RETAIN`/`retention` |
| 7 | Don't change/churn logical IDs of stateful resources (don't nest in volatile constructs) | High | stateful resources inside deeply nested/renamed custom constructs |
| 8 | Three key directories (`bin/`, `lib/`, `test/`); organized `lib/` as it grows | Low | project layout |
| 9 | `cdk.json` committed w/ feature flags intact; `cdk.context.json` NOT committed | Medium | `cdk.json` `context` block; `.gitignore` |
| 10 | Single purpose per package (App vs Construct Library); one app per repo | Low | stacks + entry point mixed with publishable library |
| 11 | Project-local tooling via `npx` (avoid global CDK CLI version drift) | Low | `package.json` devDeps `aws-cdk`; scripts using global `cdk` |
| 12 | Multi-account separation; start simple | Low | env/account config |
| 13 | Model with constructs, deploy with stacks (logical units = Construct, not Stack) | Medium | many `new Cfn`/L2 resources directly in a `Stack` subclass |
| 14 | Configure via typed props, not `process.env` inside constructs/stacks (only `bin/`) | Medium | `process.env` (flag outside `bin/`); constructors lacking a `Props` interface |
| 15 | Custom construct anatomy: props + ctor + public attrs + JSDoc + secure defaults | Medium | custom `extends Construct` missing props/JSDoc/public readonly |
| 16 | Prefer L2; escape hatch (`node.defaultChild`) / overrides; wrap bare L1 (`CfnXXXX`) | Low | direct `new Cfn` usage where an L2 exists |
| 17 | Specific imports, not wildcard (`import * as cdk`) | Low | `import \* as` |
| 18 | Co-locate infrastructure + runtime code (`Code.fromAsset` local path) | Low | `Code.fromAsset` |
| 19 | Evaluate third-party constructs before adopting | Low | non-`aws-cdk-lib`/`@cdklabs` construct deps in `package.json` |
| 20 | Fine-grained assertion tests exist (`aws-cdk-lib/assertions`, `Template.fromStack`) | Medium | presence of `test/`, `Template.fromStack` |
| 21 | Don't rely on snapshot-only testing (`toMatchSnapshot`) | Low | `toMatchSnapshot` without `hasResourceProperties` |
| 22 | Testing hygiene incl. asserting stateful logical IDs stay stable; no synth-time lookups | Medium | tests referencing logical IDs; `beforeEach` |
| 23 | CDK Nag wired in (`AwsSolutionsChecks` via `Aspects.of`) | Medium | `cdk-nag\|AwsSolutionsChecks` |
| 24 | CDK Nag suppressions have a `reason`, scoped (resource > stack) | Medium | `NagSuppressions` with/without `reason:` |
| 25 | Mutation Aspects cautious; validation/tagging Aspects safe | Medium | `implements IAspect`; `visit(` that mutates props |
| 26 | Mutation Aspects justified only for org-wide policy, not per-resource config | Medium | `IAspect` mutating individual resource config |
| 27 | Compliance is layered (constructs + Nag + boundaries/SCPs), not wrapper-construct alone | Medium | wrapper constructs as sole enforcement |

## Output template

```
# CDK Best Practices Audit — <target>

## High
- `lib/data-stack.ts:42` — **Hardcoded resource name** (rule 3b/4): `tableName: 'app-data'`.
  Blocks deploying twice in one account and any replacement. → Remove `tableName`; reference `table.tableName`.

## Medium
- ...

## Low
- ...

## Strengths (only if some are worth noting)
- Uses `bucket.grantRead(fn)` (least privilege) in `lib/api-stack.ts:31`.
- CDK Nag `AwsSolutionsChecks` wired in `bin/app.ts:12`.

## Summary
<n> High, <n> Medium, <n> Low. Top 3 fixes: ...
```

## Notes

- Language matters: signals above are TypeScript-centric. For Python CDK, adjust (`grant_read`,
  `removal_policy`, `os.environ`, `from aws_cdk import ...`).
- Tie every High/Medium finding back to a numbered rule in `rules.md` so the user can read the rationale.
