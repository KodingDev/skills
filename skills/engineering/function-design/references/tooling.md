# Enforcement in TypeScript and C#

Use this reference when asked to enforce the methodology. Inspect existing checks
first and extend them where practical. Verify current tool documentation and installed
versions before configuring rules; these are candidates, not a required tool stack.

## Match the guarantee to the mechanism

| Desired guarantee | TypeScript | C# | Limit |
| --- | --- | --- | --- |
| No specified ambient APIs in core code | ESLint/Oxlint restricted properties/imports/globals; focused custom rules | BannedApiAnalyzers in core projects; symbol-aware Roslyn rules | A denylist does not detect every hidden effect or transitive helper. |
| Core cannot depend on adapters | dependency-cruiser or existing package-boundary checks | ArchUnitNET or existing architecture tests | Dependency direction alone does not prove behavior. |
| Preconditions and states are explicit | Validated branded/encapsulated types, discriminated unions | Validated domain types, state-specific APIs, project result conventions | Constructors, aliases, casts, defaults, and deserialization can undermine guarantees. |
| Queries do not mutate inputs | Selective readonly/immutability rules | Immutable APIs and targeted analyzers | Readonly access is not deep immutability or determinism. |
| Complex control flow gets reviewed | Cognitive complexity, depth and parameter-count checks | SonarAnalyzer.CSharp and existing analyzer rules | Metrics do not measure semantic abstraction or responsibility. |

Make enforceable architectural violations build failures where requested. Treat
heuristics as review signals rather than pretending they prove the design. Do not
silently replace a project's warning/error policy or lower existing validation.

## TypeScript

- [ESLint restricted properties](https://eslint.org/docs/latest/rules/no-restricted-properties):
  disallow direct `Date.now` and `Math.random` access in selected core files. Add
  appropriate restrictions for zero-argument `new Date()`, `fetch`, environment
  access, and project stores; a single property rule does not cover these all.
- [dependency-cruiser](https://github.com/sverweij/dependency-cruiser): validate
  dependency direction and cycles. Include relevant adapters and external modules
  in the policy rather than banning only one filesystem import spelling.
- [typescript-eslint readonly parameters](https://typescript-eslint.io/rules/prefer-readonly-parameter-types/)
  and [eslint-plugin-functional](https://github.com/eslint-functional/eslint-plugin-functional):
  selectively useful for read-only APIs. Blanket no-mutation/no-loop/no-class presets
  impose a stricter methodology than the source; do not enable them by default.
- [SonarJS cognitive complexity](https://github.com/SonarSource/eslint-plugin-sonarjs/blob/master/docs/rules/cognitive-complexity.md):
  flags difficult control flow. A straight-line function can still mix several levels.
- [Effect](https://effect.website/docs/): models success, expected errors, and required
  services in types. Use it only when its programming model fits the task. It does
  not stop arbitrary JavaScript in a callback from reading global state, nor does its
  expected-error channel cover every possible defect. Do not migrate to it merely
  to improve a few function signatures.

For a custom rule, target a repeatable, demonstrable mistake: ambient API use in a
known core, service-locator access, or a specific handwritten algorithm with a safe
library equivalent. Respect shadowed names and aliases as far as the rule's analysis
permits. Test violating and legitimate cases and document gaps. A speculative
"mixed abstraction" score must not become a hard gate without evidence.

## C#

[Microsoft.CodeAnalysis.BannedApiAnalyzers](https://github.com/dotnet/roslyn-analyzers/blob/main/src/Microsoft.CodeAnalysis.BannedApiAnalyzers/BannedApiAnalyzers.Help.md)
accepts symbol IDs in `BannedSymbols.txt`, included as an MSBuild `AdditionalFiles`
item. In a core project, candidate entries are:

```text
P:System.DateTime.Now;Pass time explicitly.
P:System.DateTime.UtcNow;Pass time explicitly.
P:System.Random.Shared;Inject a random generator.
```

This is an illustrative subset, not a complete ambient-state policy. Other time
APIs, environment access, I/O, and application singletons need deliberate coverage.
Keep effects available in the adapter projects that actually perform them.

[ArchUnitNET](https://github.com/TNG/ArchUnitNET) can assert type/member dependencies
and prohibited calls from compiled code. Use it for concrete layer policies, not
as a claim that every method in a permitted layer is deterministic.

[SonarAnalyzer.CSharp](https://github.com/SonarSource/sonar-dotnet) supplies cognitive
complexity and other maintainability checks. Custom Roslyn analyzers can inspect
symbols and operations for project-specific policies such as mutable static access.
Interprocedural honesty analysis needs explicit assumptions about external code,
virtual dispatch, delegates, getters, aliasing, and unknown calls; start with a
bounded policy instead of claiming comprehensive effect inference.

[`System.Diagnostics.Contracts.PureAttribute`](https://learn.microsoft.com/en-us/dotnet/api/system.diagnostics.contracts.pureattribute)
is an annotation, not a compiler proof that a body is pure. A tool consuming the
attribute may trust it; do not confuse that trust with verified implementation.

## Check the actual enforcement

When adding tooling, demonstrate that a representative forbidden case fails in the
normal local/CI command and that a legitimate adapter or explicit dependency passes.
For types, verify that invalid construction/calls are rejected and the factory's
runtime invariant holds. Keep semantic review for naming, input breadth, abstraction
level, and whether a new function or type earns its cost.
