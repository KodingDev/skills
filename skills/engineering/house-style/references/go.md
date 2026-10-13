# Go

Read this file with `SKILL.md` before you write or review Go.

## Tooling

- The Go version is pinned in `mise.toml`, and `go.mod` declares the same `go` line.
- gofmt and goimports format every file. Formatting is never a review note.
- golangci-lint lints, with its config committed and `errcheck` and `gocritic` on. A deliberately ignored error is discarded with `_ =`. A suppression is `//nolint:<linter> // <reason>`, and the reason is required.
- `go vet` and `go test -race ./...` run in CI.

## Code

- Follow Effective Go and the Go Code Review Comments wiki. Where they speak, they win over habits from other languages.
- A package is named for what it provides, as one short lowercase word. Names do not repeat it: `retry.Policy`, not `retry.RetryPolicy`.
- Exported names are exactly the package's public interface. Everything else is unexported.
- Accept interfaces, return concrete types. An interface is declared by its consumer, with the fewest methods it needs.
- A function that can block or do I/O takes `ctx context.Context` as its first parameter and passes it down to every call.
- A goroutine has an owner that waits for it: an `errgroup.Group` or a `sync.WaitGroup`. A goroutine with no owner does not exist.
- A resource is released with `defer` right after it is acquired.
- A file orders its declarations as the Go standard library does: types and constructors first, then methods grouped by receiver, then helpers.
- Zero values are useful. A constructor exists only when the zero value cannot be.

## Errors

- An error is a returned value, checked at the call. `panic` is for a broken invariant only.
- Wrap an error with context as it goes up: `fmt.Errorf("load config: %w", err)`. The message is lowercase, with no trailing period.
- A caller that branches on an error uses `errors.Is` or `errors.As` against a sentinel or a typed error. It never matches the message string.

## Doc comments

- Every exported name has a doc comment that starts with the name: `// Policy decides when a failed call retries.`
- A package has one package comment, in `doc.go` when it runs long.

## Tests

- A test file sits beside its code as `<name>_test.go`. A black-box test uses the `<pkg>_test` package.
- A table of cases is a slice of structs with a `name` field, run through `t.Run(tc.name, ...)`.
- Assertions use the standard library. A failure message states got and want: `t.Errorf("Parse(%q) = %v, want %v", in, got, want)`.
- A helper calls `t.Helper()`, and cleanup goes through `t.Cleanup`.
