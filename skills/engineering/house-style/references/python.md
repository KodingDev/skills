# Python

Read this file with `SKILL.md` before you write or review Python.

## Tooling

- uv manages the environment and the lockfile. `pyproject.toml` declares every dependency, and `uv.lock` is committed. `requirements.txt` does not exist.
- ruff lints and formats. Lint starts with every rule on (`select = ["ALL"]`) and opts out per rule, each with a reason in a comment.
- basedpyright checks types in strict mode.
- A lint suppression is `# noqa: <rule>` on one line, with the reason after it. A type suppression is `# pyright: ignore[<rule>]`, with the reason.
- App code reads env through one validated settings object (`pydantic-settings`).

```toml
[tool.ruff]
line-length = 120

[tool.ruff.lint]
select = ["ALL"]

[tool.basedpyright]
typeCheckingMode = "strict"
```

## Types

- Every function signature is fully annotated.
- Data crosses a boundary through a Pydantic model: a request, a config, a file format.
- A closed set of values is a `Literal` union. When the values must be iterated, `get_args` reads them from the union.

  ```python
  Status = Literal["draft", "published"]
  ```

- Every id is a `NewType`, so one id cannot pass for another: `UserId = NewType("UserId", str)`. The boundary model produces it.
- An internal record is a `@dataclass(frozen=True, slots=True)`.
- Types fit without `cast`. A `cast` that gets past the checker hides a real type error.

## Code

- Paths are `pathlib.Path`.
- A module-level constant is SCREAMING_SNAKE.
- Names are `snake_case` for functions, variables, and modules, and `PascalCase` for classes.
- Exports are explicit: a module lists its public names in `__all__`.
- An expected failure that the caller must handle is a returned union. A bug or a broken invariant raises a custom exception.
- Concurrent async work runs in an `asyncio.TaskGroup`, so a failure or a cancellation reaches every task. A bare `create_task` with no owner does not exist.
- Async work that a user can abandon is cancellable, as `SKILL.md` requires: cancellation reaches every await, and cleanup runs in `finally`.
- Logs go through `logging` with structured fields (`extra=`), never through `print`.

## Tests

- Tests run on pytest. A test is a plain function with plain `assert`.
- A table of cases uses `pytest.mark.parametrize` with an `ids` list that names each row.
- Shared setup is a fixture.
