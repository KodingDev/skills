#!/usr/bin/env bash
# Run one Codex round in a linked git worktree, and record it on disk.
#
#   codex-run.sh --worktree DIR --brief FILE [--resume] [--detach] [--model M] [--effort E]
#
# --detach starts the round in the background, prints its folder, and exits 0.
# codex-wait.sh then blocks until the round ends.
#
# A round writes to $USING_CODEX_HOME/<worktree name>/<UTC stamp>/:
#   brief.md    the brief as sent
#   events.jsonl  the Codex event stream
#   last.md     the final Codex message
#   session     the Codex session id, read by --resume
#   status      "running", then "exit <code>"; exit 3 means Codex moved HEAD
#   diffstat    the worktree state after the round
set -euo pipefail

die() { echo "codex-run: $*" >&2; exit 2; }

worktree="" brief="" resume=0 detach=0 model="${USING_CODEX_MODEL:-}" effort=""
while [ $# -gt 0 ]; do
  case "$1" in
    --worktree) worktree="${2:?}"; shift 2 ;;
    --brief) brief="${2:?}"; shift 2 ;;
    --resume) resume=1; shift ;;
    --detach) detach=1; shift ;;
    --model) model="${2:?}"; shift 2 ;;
    --effort) effort="${2:?}"; shift 2 ;;
    *) die "unknown argument: $1" ;;
  esac
done
[ -n "$worktree" ] || die "--worktree is required"
[ -f "$brief" ] || die "brief not found: $brief"
command -v codex >/dev/null || die "codex is not on PATH"
# A brief that still holds the template's own guidance was not filled in.
if grep -qE '^(One or two sentences|The reason for the change|Numbered steps, in order|The checkable condition)' "$brief"; then
  die "$brief still holds template text from brief.md; fill in every section"
fi

worktree="$(cd "$worktree" && pwd -P)"
git_dir="$(git -C "$worktree" rev-parse --absolute-git-dir)" || die "not a git checkout: $worktree"
common_dir="$(cd "$(git -C "$worktree" rev-parse --git-common-dir)" && pwd -P)"
[ "$git_dir" != "$common_dir" ] || die "$worktree is the main checkout; run Codex in a linked worktree (git worktree add)"

branch="$(git -C "$worktree" symbolic-ref --quiet --short HEAD)" || die "detached HEAD in $worktree; check out a feature branch"
default="$(git -C "$worktree" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)"
case "$branch" in
  main|master|"${default#origin/}") die "branch $branch is the default branch; check out a feature branch" ;;
esac

home="${USING_CODEX_HOME:-$HOME/.cache/using-codex}/$(basename "$worktree")"
rounds=("$home"/*/)
previous=""
last="${rounds[${#rounds[@]}-1]}"
[ -d "$last" ] && previous="$last"
session=""
if [ "$resume" = 1 ]; then
  [ -n "$previous" ] && [ -s "${previous}session" ] || die "no earlier round with a session id under $home"
  session="$(cat "${previous}session")"
fi
run="$home/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$run"
cp "$brief" "$run/brief.md"
echo running > "$run/status"

args=(-c sandbox_mode=workspace-write --json -o "$run/last.md")
[ -n "$model" ] && args+=(-m "$model")
[ -n "$effort" ] && args+=(-c "model_reasoning_effort=$effort")

if [ "$resume" = 1 ]; then
  cmd=(codex exec resume "${args[@]}" "$session" -)
else
  cmd=(codex exec -C "$worktree" "${args[@]}" -)
fi

head_before="$(git -C "$worktree" rev-parse HEAD)"
echo "codex-run: round $run on $branch" >&2

finish() {
set +e
(cd "$worktree" && "${cmd[@]}" < "$run/brief.md" > "$run/events.jsonl" 2> "$run/stderr.log")
code=$?
set -e

grep -o '"thread_id":"[^"]*"' "$run/events.jsonl" | head -1 | cut -d'"' -f4 > "$run/session" || true
[ -s "$run/session" ] || { [ "$resume" = 1 ] && echo "$session" > "$run/session"; } || true
{ git -C "$worktree" status --short; git -C "$worktree" diff --stat; } > "$run/diffstat"
head_after="$(git -C "$worktree" rev-parse HEAD)"
branch_after="$(git -C "$worktree" symbolic-ref --quiet --short HEAD || echo detached)"
if [ "$head_after" != "$head_before" ] || [ "$branch_after" != "$branch" ]; then
  echo "codex-run: Codex moved HEAD ($branch@$head_before -> $branch_after@$head_after); the reviewer owns commits" >&2
  [ "$code" = 0 ] && code=3
fi
echo "exit $code" > "$run/status"

echo "codex-run: exit $code; final message in $run/last.md; worktree changes:" >&2
cat "$run/diffstat" >&2
exit "$code"
}

if [ "$detach" = 1 ]; then
  (trap '' HUP; finish) > "$run/runner.log" 2>&1 < /dev/null &
  echo "$run"
  exit 0
fi
finish
