# Python

Read this file with `SKILL.md` before you write or review Python.

## Tooling

- Python is 3.12 or later: `requires-python = ">=3.12"`, with the version pinned in `mise.toml`. Generics and aliases use the PEP 695 syntax: `def first[T](items: Sequence[T]) -> T | None`, `type Pair[T] = tuple[T, T]`.
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

- A project uses the `src/` layout (`src/<package>/`, with `tests/` beside `src/`), so tests import the installed package.
- Paths are `pathlib.Path`.
- A module-level constant is SCREAMING_SNAKE.
- Names are `snake_case` for functions, variables, and modules, and `PascalCase` for classes.
- An interface is a `Protocol`, matched by structure.
- Branching on a union uses `match`.
- A resource (a file, a lock, a client, a session) lives in a `with` or `async with` block.
- A comprehension builds a collection. `itertools` and `functools` cover the rest.
- A command-line entry point uses Typer. The function signature declares the arguments, and the docstring is the help text.
- HTTP uses httpx, sync or async, through one client per session with an explicit timeout.
- Exports are explicit: a module lists its public names in `__all__`.
- An expected failure that the caller must handle is a returned union. A bug or a broken invariant raises a custom exception. A translated exception keeps its cause: `raise ConfigError(...) from err`.
- Concurrent async work runs in an `asyncio.TaskGroup`, so a failure or a cancellation reaches every task. A bare `create_task` with no owner does not exist.
- Async work that a user can abandon is cancellable, as `SKILL.md` requires: cancellation reaches every await, and cleanup runs in `finally`.
- Logs go through `logging` with structured fields (`extra=`), never through `print`.

## Docstrings

- Docstrings are Google style, checked by ruff with `[tool.ruff.lint.pydocstyle] convention = "google"`. Ignore `D417`, because `Args:` lists only constrained parameters.
- They follow the doc-comment rules in `SKILL.md`: a summary on every public function, `Args:` only for a constraint that the type cannot express, and no `Returns:` section.

  ```python
  def zip_files(files: Sequence[DownloadFile]) -> ZipResult:
      """Fetch every file into one zip archive.

      Args:
          files: Must hold unique entry names.
      """
  ```

## Tests

- Tests run on pytest. A test is a plain function with plain `assert`.
- A table of cases uses `pytest.mark.parametrize` with an `ids` list that names each row.
- Shared setup is a fixture.
