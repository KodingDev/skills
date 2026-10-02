# TypeScript

Read this file with `SKILL.md` before you write or review TypeScript or JavaScript.

## Tooling

- pnpm is the package manager, with workspaces.
- Every dependency version is `catalog:` or `workspace:*`, with no exceptions.
- Workspace config (catalogs, overrides, patches) lives in `pnpm-workspace.yaml`.
- A script name is a task, then an optional variant after a colon: `build`, `build:debug`, `test:e2e`.
- Linting is oxlint and formatting is oxfmt. Their config is the source of truth for anything mechanical.
- A lint disable is `oxlint-disable-next-line <rule> -- <reason>`, and the reason is required. A file over `max-lines` gets split.
- App code reads env through one typed, validated env module, and uses the env library's presets.
- External links come from an env var or a named constant.
- Dead config goes: unused env passthroughs, unused framework config keys, unused packages.

## Types

- `type` for every type alias and object shape.
- Types fit without `as`. A cast that gets past the compiler hides a real type error.
- Name every object type in a signature or a return type.
- Return types are inferred. A component or a simple function carries no return annotation.
- Derive types: `keyof typeof`, `z.infer`, `(typeof X)[number]`, and the library's infer helpers (`ResultOf`, `$types`). Callers use the infer helpers, so a hand-written alias of an inferred type stays unexported.
- Narrow a type to the real domain union.
- A closed set of values is a plain string union. When the values must be iterated, an `as const` array holds them and the union derives from it. Options and labels derive from the union.

  ```ts
  export type Status = (typeof STATUSES)[number];
  export const STATUSES = ["draft", "published"] as const;
  ```

- A schema and its type share one name, type first:

  ```ts
  export type User = z.infer<typeof User>;
  export const User = z.object({});
  ```

- A constant table uses `as const satisfies T`, so literal types survive. Parameters and `let` take annotations.
- A value stands alone when nothing else rides with it: `Array<Item>`.

## Values

- A function that can find nothing returns `T | null`. `undefined` means "not provided": optional parameters and optional props (`?:`).
- A value that cannot be missing is used directly, without `|| undefined`, `?? ""`, or a polyfill for a platform API.
- A guard runs once, in the function that owns it.
- Data crosses a boundary through a Zod schema: a registry, a config, a param shape.
- A module-level `const` that is not a function, a component, or a schema is SCREAMING_SNAKE: tunables, tables, value arrays.
- A regex literal lives at module level.

## Functions

- Declare a function as an arrow: `export const name = () => {}`.
- Return an expression directly: `=> Object.values(x)`.
- Declare a generator as `function*` at module level. Arguments carry its state in, and yields carry results out.
- `async`/`await` is the only promise style. Independent awaits run together in `Promise.all`.
- Collection work uses one remeda chain (`pipe`, `filter`, `map`, `groupBy`, `sortBy`). A fixed list is an array literal.

## Doc comments

- Doc comments are TSDoc, always in the multiline form:

  ```ts
  /**
   * Content.
   */
  ```

- `@param` follows the parameter-tag rule in `SKILL.md`. `@returns` is padding.
- An `@example` is a fenced `ts` block:

  ````ts
  /**
   * Fetch every file into one zip archive.
   *
   * @example
   * ```ts
   * const result = await zipFiles(files, { onProgress, signal });
   *
   * if (result.status === "done") {
   *   saveArchive(result.archive);
   * }
   * ```
   */
  ````

## Modules

- File names are kebab-case, components included: `user-avatar.tsx` exports `UserAvatar`.
- File suffixes: `.test.ts(x)` for tests, `.gen.ts` for generated code, `use-*.ts` for hooks.
- A file with JSX is `.tsx`. A file without JSX is `.ts`.
- A constant or type that belongs to one module stays in that module.
- Import from the file that owns the symbol, through the package alias, without a `.js` extension. The one re-export file is the `index.ts` entry point at a package boundary. Inside a package, barrel files do not exist.
- Type imports use the inline modifier: `import { a, type B } from "x"`.
- Import named members: `import { filter, pipe } from "remeda"`.
- Exports are named. A framework file that requires `export default` declares the component as a named `const` first.

## Tests

- Tests run on vitest. Every assertion sits inside an `it()` or `test()` block.
- Async tests use `async`/`await`.
- Committed tests run in full, without `.only` or `.skip`.
