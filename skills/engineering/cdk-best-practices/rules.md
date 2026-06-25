# CDK Best Practices — Rule Catalog

Established AWS CDK best practices and the anti-patterns they prevent. Each rule: what to check,
why it matters, and ✅/❌ examples. Cross-reference findings to these numbers.

---

## IAM & Permissions

### 1. Use the most restrictive grant method (least privilege)
Always use the narrowest grant that satisfies the requirement. Each grant generates a least-privilege
policy and (for encrypted resources) the matching `kms:Decrypt`. Prefer grant methods over hand-written policies.

```ts
// ✅ Good
bucket.grantRead(processor);
table.grantReadData(handler);

// ❌ Avoid — grants more than needed
bucket.grantReadWrite(processor);
table.grantFullAccess(handler);
```
Common grants: S3 `grantRead/grantWrite/grantReadWrite/grantPut/grantDelete`; DynamoDB
`grantReadData/grantWriteData/grantReadWriteData/grantFullAccess`; SQS `grantSendMessages/grantConsumeMessages/grantPurge`;
SNS `grantPublish`. **Why:** each grant is scoped to exactly what it needs and shows up that way in the
synthesized template — which is what security teams want to see.

### 2. No overly broad actions in explicit policy statements
When `PolicyStatement` is necessary (grants don't cover the case), scope actions and resources. Never `*`
actions or `iam:*`/`s3:*` where specific actions work.

```ts
// ❌ Anti-pattern
new PolicyStatement({ actions: ['s3:*'], resources: ['*'] });

// ✅ Scoped
new PolicyStatement({ actions: ['s3:GetObject'], resources: [bucket.arnForObjects('uploads/*')] });
```

### 3. Three IAM-role approaches — recognize which the project uses
CDK-managed roles (default, automatic least-privilege), pre-created roles (a separate team owns role
creation — import with `Role.fromRoleArn`), and role customization. Where developers can't create roles
directly, recognize that constraint and import existing roles rather than failing the synth.

---

## Resource Naming & Determinism

### 3b / 4. Don't hardcode physical resource names
Names are single-use per account/region. Hardcoding blocks deploying twice and blocks any
replacement (new resource needs the name while the old still holds it). Omit names; let CDK generate
them and reference attributes.

```ts
// ❌ Anti-pattern
new Table(this, 'DataTable', { tableName: 'my-application-data', partitionKey: {...} });

// ✅ Best practice
const table = new Table(this, 'DataTable', { partitionKey: {...} });
new Function(this, 'Handler', { /* ... */ environment: { TABLE_NAME: table.tableName } });
```

### 5. Make decisions at synthesis time, not deploy time
Use the host language (`if`, ternary, loops) — not CloudFormation `Conditions`/`Fn::If`/`CfnParameter`.
CFN expressions are far weaker than a real language.

```ts
// ✅ Decide at synth time
const isProd = props.environment === 'production';
new Table(this, 'DataTable', {
  billingMode: isProd ? BillingMode.PROVISIONED : BillingMode.PAY_PER_REQUEST,
  removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
  pointInTimeRecovery: isProd,
});
```

### 6. Define removal policies and log retention explicitly
CDK defaults retain data resources (orphaned, not deleted) and keep logs forever → surprise bills.
Set `removalPolicy` and log retention deliberately per resource. Validate with an Aspect across the stack.

### 7. Don't change the logical ID of stateful resources
Changing a logical ID *replaces* the resource. For DBs, buckets, VPCs this means data loss. Logical ID
derives from the construct `id` and its position in the tree, so refactors that move/rename constructs are
dangerous. Keep stateful resources out of volatile/renamed constructs, and **write tests asserting their
logical IDs stay stable** (rule 22). Consider a separate stateful stack with termination protection.

---

## Project Structure & Organization

### 8. Three key directories
`bin/` = app entry point (the wiring diagram: which stacks exist, how connected, env/context passed in);
`lib/` = stacks + constructs; `test/` = Jest unit tests. As it grows, organize `lib/` into
`stacks/` (deployment units), `constructs/` (reusable), `config/` (env-specific).

### 9. `cdk.json` vs `cdk.context.json`
`cdk.json` holds the `app` command, `watch` config, and **feature flags** in `context` — commit it, and
**don't remove feature flags** (they pin default behaviors across CDK versions; removing them silently
changes synthesized templates). `cdk.context.json` caches account lookups — **do not commit it**.

### 10. Single purpose per package
A **CDK App** (stacks + entry point, deployable) or a **Construct Library** (reusable constructs, no
stacks/entry point, published & semver'd). Apps depend on libraries, never the reverse. Don't put multiple
apps in one repo (inflates deployment blast radius). Move packages to their own repo when lifecycle or
team ownership diverges.

### 11. Project-local tooling via `npx`
Pin `aws-cdk` and `typescript` as devDeps and run `npx cdk` / `npx tsc` so every dev and CI run uses the
same versions. Global installs cause version drift → different synth output ("works on my machine").

### 12. Multi-account & start simple
Separate dev/test/prod accounts (blast-radius containment, permission boundaries, cost visibility).
Start with a single stack in a single package; add complexity only when a real requirement demands it.

---

## Constructs

### 13. Model with constructs, deploy with stacks
Stacks are the unit of *deployment*, not *modeling*. Represent each logical multi-resource unit as a
**Construct**; use Stacks only to compose/connect constructs for deployment scenarios.

```ts
// ✅ logical unit = construct
export class WebsiteConstruct extends Construct { /* bucket + distribution + records */ }
export class ProductionStack extends Stack {
  constructor(scope, id, props) { super(scope, id, props);
    new WebsiteConstruct(this, 'Website'); new ApiConstruct(this, 'Api'); }
}
```

### 14. Configure with props, not environment variables
Constructs/stacks take a typed props object — full configurability in code. Reading `process.env` inside a
construct creates a hidden dependency on the machine. Limit env lookups to the `bin/` entry point.

```ts
// ❌ inside a construct
const tableName = process.env.TABLE_NAME;
// ✅ props
export interface DataLayerProps { readonly tableName?: string; readonly removalPolicy?: RemovalPolicy; }
```

### 15. Anatomy & design of a custom construct
Four parts: (1) typed `Props` interface, (2) constructor that creates+wires children, (3) public
`readonly` properties exposing ARNs/names/URLs for cross-references, (4) JSDoc. Principles: configure via
props; **sensible secure defaults** ("pit of success" — e.g. encryption on by default); expose relevant
attributes; self-contained (creates its own roles/log groups); testable in isolation.

### 16. Prefer L2; escape hatches when needed
Default to L2 constructs. If an L2 doesn't expose a CFN property, use the **escape hatch**
(`node.defaultChild as CfnX`), then `addPropertyOverride` (CFN property paths) or
`addPropertyDeletionOverride`. Use raw L1 (`CfnXXXX`) only when no L2 exists — consider wrapping it in a
custom L2-style construct.

### 17. Avoid wildcard imports
`import * as cdk from 'aws-cdk-lib'` obscures what's actually used. Prefer specific imports
(`import { Bucket } from 'aws-cdk-lib/aws-s3'`).

### 18. Co-locate infrastructure and runtime code
Keep Lambda/Docker source in the same package/construct as the infra that deploys it
(`Code.fromAsset('lambda/api')`) — test together, version in sync, no infra/app drift.

### 19. Evaluate third-party constructs before adopting
On Construct Hub, check maintenance cadence, license, docs, test coverage, dependency footprint, adoption.
Confirm with the customer's security/architecture team — some require approval for OSS deps.

---

## Testing

### 20. Fine-grained assertions are the primary strategy
Use `aws-cdk-lib/assertions` `Template.fromStack(...)` with `hasResourceProperties`, `resourceCountIs`,
`hasResource`, and `Match`. Test that resources exist with correct properties, counts, IAM scoping.

```ts
template.hasResourceProperties('AWS::DynamoDB::Table', { SSESpecification: { SSEEnabled: true } });
template.resourceCountIs('AWS::DynamoDB::Table', 1);
template.hasResource('AWS::DynamoDB::Table', { DeletionPolicy: 'Retain' });
```

### 21. Snapshot tests are supplementary
`expect(template.toJSON()).toMatchSnapshot()` is useful for refactor confidence but brittle (CDK upgrades,
context, metadata cause false failures). Don't rely on snapshots as the only tests.

### 22. Testing hygiene
Refactor setup into `beforeEach`/helpers (no copy-paste); descriptive test names; one behavior per test;
**assert stateful resource logical IDs** (rule 7); avoid network lookups during synthesis — model all
stages in code so every commit synthesizes identically.

---

## Compliance & Aspects

### 23. Wire in CDK Nag early
CDK Nag validates against rule packs (AWS Solutions, HIPAA, NIST 800-53, PCI DSS) at synth time via the
Aspects mechanism. Add from the first stack.

```ts
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
```

### 24. Handle Nag findings properly
Prefer fixing. If suppressing, **always include a `reason`**, and prefer
`NagSuppressions.addResourceSuppressions` (scoped) over `addStackSuppressions` (broad; use sparingly).
Suppressions should be auditable.

### 25. Aspects — validation safe, mutation cautious
Aspects apply an operation to every construct (visitor pattern). Validation/read-only Aspects (CDK Nag) and
tagging Aspects are generally safe. **Mutation Aspects** that change resource props create a disconnect
between code and synthesized output (code says `versioned:false`, template says enabled) — introduce with
caution; often a custom construct with secure defaults is better.

### 26. When mutation Aspects ARE justified
Org-wide constraints that must apply uniformly and can't be accidentally omitted — e.g.
`AddPermissionBoundary` on every role, mandatory name prefixes. Test: "does this apply to *all* resources
of this type without exception?" Yes → Aspect. "Most, but some opt out" → custom construct with a prop.

### 27. Compliance is layered (defense in depth)
Don't rely on wrapper constructs alone. Layers: (1) custom constructs (make secure path easy, authoring
time), (2) CDK Nag + Aspects (authoring time), (3) permissions boundaries + SCPs (deploy time, can't
bypass), (4) CloudFormation Guard. Layers 1–2 catch issues early; 3–4 are the hard backstop. Wrapper
constructs also block consuming AWS Solutions Constructs / Construct Hub constructs — weigh that trade-off.

---

## Anti-pattern quick list
1. `process.env` inside constructs → use props (rule 14)
2. Hardcoded resource names → let CDK generate (rule 3b/4)
3. `CfnParameter` for configuration → decide at synth time (rule 5)
4. Wildcard imports → specific imports (rule 17)
5. Overly broad IAM (`grantReadWrite` when `grantRead` suffices; `iam:*`) → least privilege (rules 1–2)
6. Nesting stateful resources in volatile constructs → logical ID churn / data loss (rule 7)
7. Wrapper constructs as sole compliance enforcement → layer it (rule 27)
