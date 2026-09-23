# Applying the three principles

## Explicit input beats an injected service when a value is enough

This TypeScript function hides a clock dependency:

```ts
type Expiring = { readonly expiresAt: number };

function isExpired(item: Expiring) {
  return item.expiresAt <= Date.now();
}
```

Expose the input, and let the adapter read the clock:

```ts
function isExpired(item: Expiring, now: number) {
  return item.expiresAt <= now;
}
```

The caller can test equality at the expiry boundary without replacing global time.
For a batch that should share one instant, capture time once outside the iteration.
If an operation really needs repeated clock reads, inject a clock instead and make
that temporal behavior explicit. Do not force a snapshot where it changes semantics.

## An honest function can mutate

```ts
type RandomSource = { next: () => number };
type Particle = { x: number; y: number };

function scatter(particles: Particle[], random: RandomSource) {
  for (const particle of particles) {
    particle.x = random.next();
    particle.y = random.next();
  }
}
```

The particles and random source are explicit. Reproducibility still requires a
specified seeded implementation, initial state, and exclusive control over that
state. The interface alone does not prove any of those properties. A callback
that secretly reads a global RNG defeats the guarantee, even with this signature.

The C# equivalent can accept an owned seeded generator. Do not promise identical
sequences across runtime versions unless the chosen algorithm guarantees them.

## Encode an invariant without leaving a construction escape hatch

A function that reflects a vector needs a unit normal, not an arbitrary vector.
Design the API around `NormalizedVec3` and a fallible normalization factory.
The factory handles zero and non-finite inputs and numerical scaling/tolerance
appropriate to the application; consumers use the established guarantee.

- **TypeScript:** a private brand or encapsulated class distinguishes the type.
  Keep unchecked assertions inside the trusted factory. Prevent mutation through
  returned references or aliases; shallow `Readonly` alone does not freeze data.
- **C#:** a private-constructor immutable class can limit creation to a factory.
  A `readonly struct` still admits `default(T)`, which may violate the invariant.
  Design for that default explicitly or choose a representation that avoids it.
  Records and `init`/`with` paths also need to preserve the guarantee.
- **Both:** deserialization and foreign inputs need validation. Static guarantees
  depend on the trusted construction path being correct.

Correction to the source video near 35:45: the cross product of two unit vectors
is not generally a unit vector. Its length is `|sin(theta)|`; parallel vectors
produce zero. Do not return `NormalizedVec3` solely because both operands have
that type. Normalize with failure handling, or require an additional valid
orthogonality guarantee. A type annotation cannot establish a false theorem.

## State transitions must prove the right thing

An API such as `parse(raw) -> ParsedConfig` followed by
`start(config: ParsedConfig)` expresses a useful precondition. The value must
carry the validated data so callers cannot validate one object and use another.

A `LockHeld` token is harder: it must refer to the correct lock and remain valid
only while that lock is held. Ordinary TypeScript and C# tokens are not linear
ownership proofs. Prefer scoped APIs plus appropriate runtime checks for resource
lifetimes; do not claim an unforgeable-looking type alone prevents stale use.

## The abstraction boundary is semantic

Before: `hasAssetType` lowercases characters manually, implements binary search,
exits on a missing asset, and finally compares the asset's type.

After, using a collection that owns the lookup invariant:

```csharp
sealed class AssetIndex
{
    private readonly Dictionary<string, Asset> assets =
        new(StringComparer.OrdinalIgnoreCase);

    public void Add(string name, Asset asset) => assets.Add(name, asset);

    public bool HasType(string name, AssetType type) =>
        assets.TryGetValue(name, out var asset) && asset.Type == type;
}
```

`Asset` and `AssetType` stand for existing domain types. The dictionary owns the
same comparison policy for insertion and lookup. Verify that ordinal case-insensitive
comparison matches the real identifier rules before adopting it; it is not a
universal replacement for Unicode normalization or locale-specific behavior.
If missing and wrong-type must differ, use a richer result rather than this bool.

A TypeScript index can similarly own canonicalization and a `Map`. Avoid ad hoc
`.toLowerCase()` calls scattered across writers and readers. Use the same policy
at every entry point and preserve existing collision behavior deliberately.

Extraction alone is not the goal. Replacing each statement with `stepOne()` and
`stepTwo()` leaves the original design problem hidden behind uninformative names.
