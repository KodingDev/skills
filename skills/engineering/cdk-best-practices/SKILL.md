---
name: cdk-best-practices
description: Audit an AWS CDK module, construct, stack, or package against AWS CDK best practices (project structure, IAM/grants, constructs, testing, CDK Nag, removal policies, anti-patterns). Use when the user asks to review/check/audit CDK code, a CDK construct or stack, a cdk module, or asks "is this CDK code following best practices".
---

# CDK Best Practices

Audit AWS CDK code (TypeScript, Python, and other languages) against best practices and
anti-patterns. Produce a prioritized report with `file:line` references.

The full rule catalog is in **`rules.md`**. It gives the rationale and good and bad examples
for each rule. Read it before you audit. The workflow and the rule index are below.

## Workflow

1. **Scope the target.** Identify the code to audit:
   - For a single file or construct, audit that file.
   - For a CDK package or module, examine `bin/`, `lib/` (stacks and constructs), `test/`,
     `cdk.json`, and `package.json`.
   - If the target is not clear, ask which directory or file contains the CDK code.

2. **Read `rules.md`** in this skill directory. It contains the full checklist, the rationale,
   and code examples.

3. **Gather signals.** Use grep, Glob, and Read on the target. The rules table below gives a
   grep signal for each rule. Run the signals. Then read the code around each hit to make sure
   that the hit is a true positive. A grep hit is a candidate, not a verdict. For example,
   `process.env` in `bin/` is permitted.

4. **Classify each finding** by severity:
   - **High** — a security risk or a data-loss risk. Examples: broad IAM, hardcoded names that
     block replacement, stateful resources that can lose data, stateful resources without a
     removal or retention decision.
   - **Medium** — a maintainability or correctness problem. Examples: env vars inside
     constructs, CfnParameter for configuration, stacks as the modeling unit, missing tests,
     no CDK Nag, deploy-time decisions.
   - **Low** — a style or convention problem. Examples: wildcard imports, missing JSDoc,
     snapshot-only tests.

5. **Report.** Group the findings by severity. For each finding, give the `file:line`, the
   rule name, what you found, one line on why it is important, and the fix. If the code
   follows some practices well, end with a short "Strengths" note. If there are no strengths,
   omit the note. Recommend each fix. Do not rewrite the code unless the user asks.

## Rule index

Read `rules.md` for the full detail. The `#` column matches the rule numbers in `rules.md`
exactly. Cite these numbers in your findings. Each grep signal gives candidates only. Read
the code to confirm each hit.

| # (in rules.md) | Rule | Severity | Grep signal (candidate) |
|---|------|----------|-------------------------|
| 1 | Least-privilege grants (`grantRead` over `grantReadWrite`/`grantFullAccess`) | High | `grantReadWrite\|grantFullAccess\|grantWrite` |
| 2 | No broad IAM actions (`*`, `iam:*`, `s3:*`) in `PolicyStatement` | High | `actions:.*\*\|'\*'\|"\*"` near `PolicyStatement` |
| 3 | Recognize the IAM-role approach (CDK-managed / pre-created / customized) | — | `Role.fromRoleArn\|new Role` |
| 3b/4 | No hardcoded physical names | High | `bucketName:\|tableName:\|functionName:\|queueName:\|roleName:` |
| 5 | Decide at synthesis time, not deploy time (no `CfnParameter`/`CfnCondition`/`Fn.if`) | Medium | `CfnParameter\|CfnCondition\|Fn\.conditionIf\|Fn\.if` |
| 6 | Explicit removal policy + log retention on stateful resources | High | `new Bucket\|new Table\|new Database`; check for `removalPolicy`/`RETAIN`/`retention` |
| 7 | Keep the logical IDs of stateful resources stable (no nesting in volatile constructs) | High | stateful resources inside deeply nested or renamed custom constructs |
| 8 | Three key directories (`bin/`, `lib/`, `test/`); organized `lib/` as it grows | Low | project layout |
| 9 | `cdk.json` committed with feature flags intact; `cdk.context.json` NOT committed | Medium | `cdk.json` `context` block; `.gitignore` |
| 10 | Single purpose per package (App vs Construct Library); one app per repo | Low | stacks + entry point mixed with publishable library |
| 11 | Project-local tooling via `npx` (no global CDK CLI version drift) | Low | `package.json` devDeps `aws-cdk`; scripts that use global `cdk` |
| 12 | Multi-account separation; start simple | Low | env/account configuration |
| 13 | Model with constructs, deploy with stacks (logical unit = Construct, not Stack) | Medium | many `new Cfn`/L2 resources directly in a `Stack` subclass |
| 14 | Configure via typed props, not `process.env` inside constructs/stacks (only `bin/`) | Medium | `process.env` (flag outside `bin/`); constructors without a `Props` interface |
| 15 | Custom construct anatomy: props + ctor + public attrs + JSDoc + secure defaults | Medium | custom `extends Construct` without props/JSDoc/public readonly |
| 16 | Prefer L2; escape hatch (`node.defaultChild`) / overrides; wrap bare L1 (`CfnXXXX`) | Low | direct `new Cfn` usage where an L2 exists |
| 17 | Specific imports, not wildcard (`import * as cdk`) | Low | `import \* as` |
| 18 | Co-locate infrastructure + runtime code (`Code.fromAsset` local path) | Low | `Code.fromAsset` |
| 19 | Evaluate third-party constructs before adoption | Low | non-`aws-cdk-lib`/`@cdklabs` construct deps in `package.json` |
| 20 | Fine-grained assertion tests exist (`aws-cdk-lib/assertions`, `Template.fromStack`) | Medium | presence of `test/`, `Template.fromStack` |
| 21 | No snapshot-only testing (`toMatchSnapshot`) | Low | `toMatchSnapshot` without `hasResourceProperties` |
| 22 | Testing hygiene: assert that stateful logical IDs stay stable; no synth-time lookups | Medium | tests that reference logical IDs; `beforeEach` |
| 23 | CDK Nag wired in (`AwsSolutionsChecks` via `Aspects.of`) | Medium | `cdk-nag\|AwsSolutionsChecks` |
| 24 | CDK Nag suppressions have a `reason` and a narrow scope (resource > stack) | Medium | `NagSuppressions` with/without `reason:` |
| 25 | Mutation Aspects cautious; validation/tagging Aspects safe | Medium | `implements IAspect`; `visit(` that mutates props |
| 26 | Mutation Aspects only for org-wide policy, not per-resource configuration | Medium | `IAspect` that mutates individual resource configuration |
| 27 | Compliance is layered (constructs + Nag + boundaries/SCPs), not a wrapper construct alone | Medium | wrapper constructs as the only enforcement |

## Output template

```
# CDK Best Practices Audit — <target>

## High
- `lib/data-stack.ts:42` — **Hardcoded resource name** (rule 3b/4): `tableName: 'app-data'`.
  Blocks a second deploy in one account and any replacement. → Remove `tableName`; reference `table.tableName`.

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

- The signals above are for TypeScript. For Python CDK, adjust them (`grant_read`,
  `removal_policy`, `os.environ`, `from aws_cdk import ...`).
- Tie each High and Medium finding to a numbered rule in `rules.md`. Then the user can read
  the rationale.
