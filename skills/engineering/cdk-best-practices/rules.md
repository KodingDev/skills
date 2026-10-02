# CDK best practices: rule catalog

This catalog lists AWS CDK best practices and the anti-patterns that they prevent. Each rule gives
what to check, why it is important, and good and bad examples. Cite these numbers in findings.

---

## IAM and permissions

### 1. Use the most restrictive grant method (least privilege)
Use the narrowest grant that satisfies the requirement. Each grant generates a least-privilege
policy and, for encrypted resources, the matching `kms:Decrypt`. Use grant methods in place of hand-written policies.

```ts
// Good
bucket.grantRead(processor);
table.grantReadData(handler);

// Avoid: grants more than needed
bucket.grantReadWrite(processor);
table.grantFullAccess(handler);
```
Common grants: S3 `grantRead/grantWrite/grantReadWrite/grantPut/grantDelete`; DynamoDB
`grantReadData/grantWriteData/grantReadWriteData/grantFullAccess`; SQS `grantSendMessages/grantConsumeMessages/grantPurge`;
SNS `grantPublish`. **Why:** each grant has the exact scope that it needs, and the synthesized template
shows that scope. Security teams review that template.

### 2. No broad actions in explicit policy statements
If grants do not cover the case and you need a `PolicyStatement`, scope its actions and resources. Do not
use `*` actions, or `iam:*`/`s3:*`, where specific actions work.

```ts
// Avoid
new PolicyStatement({ actions: ['s3:*'], resources: ['*'] });

// Good: Scoped
new PolicyStatement({ actions: ['s3:GetObject'], resources: [bucket.arnForObjects('uploads/*')] });
```

### 3. Three IAM-role approaches: recognize which one the project uses
The approaches are CDK-managed roles (the default, with automatic least privilege), pre-created roles, and
role customization. With pre-created roles, a separate team owns role creation, and you import roles with
`Role.fromRoleArn`. If developers cannot create roles, import the existing roles. Do not let the synth fail.

---

## Resource naming and determinism

### 3b / 4. Do not hardcode physical resource names
A name is single-use per account and region. A hardcoded name blocks a second deploy. It also blocks
replacement, because the new resource needs the name while the old one still holds it. Omit names, let
CDK generate them, and reference the attributes.

```ts
// Avoid
new Table(this, 'DataTable', { tableName: 'my-application-data', partitionKey: {...} });

// Good
const table = new Table(this, 'DataTable', { partitionKey: {...} });
new Function(this, 'Handler', { /* ... */ environment: { TABLE_NAME: table.tableName } });
```

### 5. Make decisions at synthesis time, not deploy time
Use the host language (`if`, ternary, loops). Do not use CloudFormation `Conditions`, `Fn::If`, or
`CfnParameter`. CFN expressions are much weaker than a programming language.

```ts
// Good: Decide at synth time
const isProd = props.environment === 'production';
new Table(this, 'DataTable', {
  billingMode: isProd ? BillingMode.PROVISIONED : BillingMode.PAY_PER_REQUEST,
  removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
  pointInTimeRecovery: isProd,
});
```

### 6. Set removal policies and log retention explicitly
By default, CDK retains data resources (orphaned, not deleted) and keeps logs forever. The result is
unexpected bills. Set `removalPolicy` and log retention for each resource. Check them with an Aspect
across the stack.

### 7. Do not change the logical ID of a stateful resource
A changed logical ID *replaces* the resource. For databases, buckets, and VPCs, this is data loss. The
logical ID comes from the construct `id` and its position in the tree. A refactor that moves or renames
constructs is therefore dangerous. Keep stateful resources out of volatile or renamed constructs, and
**write tests that assert their logical IDs stay stable** (rule 22). Consider a separate stateful stack
with termination protection.

---

## Project structure and organization

### 8. Three key directories
- `bin/`: the app entry point. It is the wiring diagram: which stacks exist, how they connect, and which
  env and context they get.
- `lib/`: stacks and constructs.
- `test/`: Jest unit tests.

As the project grows, split `lib/` into `stacks/` (deployment units), `constructs/` (reusable), and
`config/` (env-specific).

### 9. `cdk.json` vs `cdk.context.json`
`cdk.json` holds the `app` command, the `watch` config, and the **feature flags** in `context`. Commit it.
**Do not remove feature flags.** They pin default behaviors across CDK versions, and a removed flag changes
the synthesized templates without a warning. `cdk.context.json` caches account lookups. **Do not commit it.**

### 10. One purpose per package
A package is a **CDK App** (stacks and an entry point, deployable) or a **Construct Library** (reusable
constructs, no stacks or entry point, published with semver). Apps depend on libraries, never the reverse.
Do not put more than one app in a repo, because it increases the deployment blast radius. Move a package to
its own repo when its lifecycle or team ownership diverges.

### 11. Project-local tooling via `npx`
Pin `aws-cdk` and `typescript` as devDeps, and run `npx cdk` / `npx tsc`. Then every developer and CI run
uses the same versions. Global installs cause version drift and a different synth output ("works on my machine").

### 12. Multi-account, and start simple
Separate the dev, test, and prod accounts. This contains the blast radius, sets permission boundaries, and
shows cost per stage. Start with one stack in one package. Add complexity only for a real requirement.

---

## Constructs

### 13. Model with constructs, deploy with stacks
A stack is the unit of *deployment*, not of *modeling*. Represent each logical multi-resource unit as a
**Construct**. Use stacks only to compose and connect constructs for deployment scenarios.

```ts
// Good: logical unit = construct
export class WebsiteConstruct extends Construct { /* bucket + distribution + records */ }
export class ProductionStack extends Stack {
  constructor(scope, id, props) { super(scope, id, props);
    new WebsiteConstruct(this, 'Website'); new ApiConstruct(this, 'Api'); }
}
```

### 14. Configure with props, not environment variables
Constructs and stacks take a typed props object, which gives full configurability in code. A `process.env`
read inside a construct is a hidden dependency on the machine. Read env only in the `bin/` entry point.

```ts
// Avoid: inside a construct
const tableName = process.env.TABLE_NAME;
// Good: props
export interface DataLayerProps { readonly tableName?: string; readonly removalPolicy?: RemovalPolicy; }
```

### 15. Anatomy and design of a custom construct
A custom construct has four parts:
1. A typed `Props` interface.
2. A constructor that creates and wires the children.
3. Public `readonly` properties that expose ARNs, names, and URLs for cross-references.
4. JSDoc.

Principles: configure through props. Give **secure defaults** ("pit of success", for example encryption on
by default). Expose the relevant attributes. Keep it self-contained: it creates its own roles and log groups.
Make it testable in isolation.

### 16. Use L2; use escape hatches when needed
Use L2 constructs by default. If an L2 does not expose a CFN property, use the **escape hatch**
(`node.defaultChild as CfnX`), then `addPropertyOverride` (CFN property paths) or
`addPropertyDeletionOverride`. Use raw L1 (`CfnXXXX`) only when no L2 exists. Consider a wrapper for it
in a custom L2-style construct.

### 17. Do not use wildcard imports
`import * as cdk from 'aws-cdk-lib'` hides what the code uses. Use specific imports
(`import { Bucket } from 'aws-cdk-lib/aws-s3'`).

### 18. Co-locate infrastructure and runtime code
Keep Lambda or Docker source in the same package or construct as the infra that deploys it
(`Code.fromAsset('lambda/api')`). Then they test together, version together, and do not drift.

### 19. Evaluate third-party constructs before adoption
On Construct Hub, check the maintenance cadence, license, docs, test coverage, dependency footprint, and
adoption. Confirm with the customer's security or architecture team. Some teams require approval for OSS deps.

---

## Testing

### 20. Fine-grained assertions are the primary strategy
Use `aws-cdk-lib/assertions` `Template.fromStack(...)` with `hasResourceProperties`, `resourceCountIs`,
`hasResource`, and `Match`. Test that resources exist, with the correct properties, counts, and IAM scope.

```ts
template.hasResourceProperties('AWS::DynamoDB::Table', { SSESpecification: { SSEEnabled: true } });
template.resourceCountIs('AWS::DynamoDB::Table', 1);
template.hasResource('AWS::DynamoDB::Table', { DeletionPolicy: 'Retain' });
```

### 21. No template snapshots
Tests use only fine-grained assertions. A template snapshot (`toMatchSnapshot()` on `template.toJSON()`)
is brittle: CDK upgrades, context, and metadata change it with no real change. Nobody reads its diff in review.
For refactor confidence, run `cdk diff` in CI.

### 22. Testing hygiene
- Move setup into `beforeEach` or helpers. Do not copy and paste it.
- Give tests descriptive names. Test one behavior per test.
- **Assert the logical IDs of stateful resources** (rule 7).
- Do not do network lookups during synthesis. Model all stages in code, so every commit synthesizes
  identically.

---

## Compliance and Aspects

### 23. Wire in CDK Nag early
CDK Nag checks the app against rule packs (AWS Solutions, HIPAA, NIST 800-53, PCI DSS) at synth time
through the Aspects mechanism. Add it from the first stack.

```ts
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
```

### 24. Handle Nag findings correctly
Fix the finding first. If you suppress it, **always include a `reason`**. Use
`NagSuppressions.addResourceSuppressions` (scoped) in place of `addStackSuppressions` (broad, use rarely).
Suppressions must be auditable.

### 25. Aspects: validation is safe, mutation needs caution
An Aspect applies an operation to every construct (visitor pattern). Validation or read-only Aspects
(CDK Nag) and tagging Aspects are safe. A **mutation Aspect** changes resource props, so the code and the
synthesized output disagree (code says `versioned:false`, the template says enabled). Add one with caution.
A custom construct with secure defaults is often the better choice.

### 26. When a mutation Aspect is justified
Use one for an org-wide constraint that must apply uniformly and cannot be omitted by accident, for example
`AddPermissionBoundary` on every role, or mandatory name prefixes. Test: "does this apply to *all* resources
of this type, with no exception?" Yes -> Aspect. "Most, but some opt out" -> custom construct with a prop.

### 27. Compliance is layered (defense in depth)
Do not rely on wrapper constructs alone. The layers:
1. Custom constructs: they make the secure path easy, at authoring time.
2. CDK Nag and Aspects: authoring time.
3. Permissions boundaries and SCPs: deploy time, and nobody can bypass them.
4. CloudFormation Guard.

Layers 1-2 catch issues early. Layers 3-4 are the hard backstop. Wrapper constructs also block the use of
AWS Solutions Constructs and Construct Hub constructs. Weigh that trade-off.

## Boundaries and cost

### 28. Stacks of different systems do not import each other
A stack that `import`s the stack class of another system, or takes its construct as a prop, welds two
deploy units together. Neither can deploy, test, or delete without the other, and a rename in one
breaks the synth of the other. Share across systems by contract: SSM parameters, CloudFormation
exports/`Fn.importValue`, or a typed lookup by a stable name. Keep the stack graph of each system
closed. Inside one system, constructs can pass between stacks. Cross-stack references exist for that.

### 29. Cost is a default, not an afterthought
Infrastructure code sets the bill. Choose the cheap default where the workload allows it:
- On-demand over provisioned capacity, until you measure a steady load.
- A log retention on every log group. Never infinite.
- No NAT gateway for a workload that can use public subnets with security groups, or VPC endpoints.
- The smallest instance or memory size that meets the measured need.
- Lifecycle rules on buckets that hold artifacts.

Flag a resource with open-ended cost (unbounded logs, provisioned capacity with no autoscaling, an idle
NAT) as a finding. Give the cheaper shape as the fix.

---

## Anti-pattern quick list
1. `process.env` inside constructs -> use props (rule 14)
2. Hardcoded resource names -> let CDK generate them (rule 3b/4)
3. `CfnParameter` for configuration -> decide at synth time (rule 5)
4. Wildcard imports -> specific imports (rule 17)
5. Broad IAM (`grantReadWrite` when `grantRead` is sufficient; `iam:*`) -> least privilege (rules 1-2)
6. Stateful resources nested in volatile constructs -> logical ID churn and data loss (rule 7)
7. Wrapper constructs as the only compliance enforcement -> layer it (rule 27)
8. One system's stack imports another's -> share by SSM/export contract (rule 28)
9. Open-ended cost (infinite logs, idle NAT, unmeasured provisioned capacity) -> cheap default (rule 29)
