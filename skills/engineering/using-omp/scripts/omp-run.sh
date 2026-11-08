#!/usr/bin/env bash
# Run one omp round in a linked git worktree, and record it on disk.
#
#   omp-run.sh --worktree DIR --brief FILE [--resume] [--detach] [--model M] [--thinking L]
#              [--tools LIST] [--max-time T]
#
# --detach starts the round in the background, prints its folder, and exits 0.
# omp-wait.sh then blocks until the round ends.
#
# A round writes to $USING_OMP_HOME/<worktree name>/<UTC stamp>/:
#   brief.md      the brief as sent
#   events.jsonl  the omp event stream (--mode json)
#   last.md       the text of the final assistant message
#   session       the omp session id, read by --resume
#   status        "running", then "exit <code>"; exit 3 means omp moved HEAD
#   stats         wall seconds, turns, tool calls, tool errors, tokens, cost
#   diffstat      the worktree state after the round
set -euo pipefail

die() { echo "omp-run: $*" >&2; exit 2; }

worktree="" brief="" resume=0 detach=0
model="${USING_OMP_MODEL:-opencode-zen/deepseek-v4.1-flash}"
thinking="${USING_OMP_THINKING:-low}"
tools="${USING_OMP_TOOLS:-read,bash,edit,write,grep,glob}"
max_time="${USING_OMP_MAX_TIME:-45m}"
while [ $# -gt 0 ]; do
  case "$1" in
    --worktree) worktree="${2:?}"; shift 2 ;;
    --brief) brief="${2:?}"; shift 2 ;;
    --resume) resume=1; shift ;;
    --detach) detach=1; shift ;;
    --model) model="${2:?}"; shift 2 ;;
    --thinking) thinking="${2:?}"; shift 2 ;;
    --tools) tools="${2:?}"; shift 2 ;;
    --max-time) max_time="${2:?}"; shift 2 ;;
    *) die "unknown argument: $1" ;;
  esac
done
[ -n "$worktree" ] || die "--worktree is required"
[ -f "$brief" ] || die "brief not found: $brief"
command -v omp >/dev/null || die "omp is not on PATH"
command -v jq >/dev/null || die "jq is not on PATH"
# A brief that still holds the template's own guidance was not filled in.
if grep -qE '^(One or two sentences|The reason for the change|Numbered steps, in order|The checkable condition|Add here the user)' "$brief"; then
  die "$brief still holds template text from brief.md; fill in every section"
fi

worktree="$(cd "$worktree" && pwd -P)"
git_dir="$(git -C "$worktree" rev-parse --absolute-git-dir)" || die "not a git checkout: $worktree"
common_dir="$(cd "$worktree" && cd "$(git rev-parse --git-common-dir)" && pwd -P)"
[ "$git_dir" != "$common_dir" ] || die "$worktree is the main checkout; run omp in a linked worktree (git worktree add)"

branch="$(git -C "$worktree" symbolic-ref --quiet --short HEAD)" || die "detached HEAD in $worktree; check out a feature branch"
default="$(git -C "$worktree" symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null || true)"
case "$branch" in
  main|master|"${default#origin/}") die "branch $branch is the default branch; check out a feature branch" ;;
esac

home="${USING_OMP_HOME:-$HOME/.cache/using-omp}/$(basename "$worktree")"
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

# -p runs tools with no approval prompt. The --tools list is the boundary.
cmd=(omp -p --cwd "$worktree" --model "$model" --thinking "$thinking" --tools "$tools"
  --max-time "$max_time" --mode json)
[ "$resume" = 1 ] && cmd+=(--resume "$session")
cmd+=("@$run/brief.md")

head_before="$(git -C "$worktree" rev-parse HEAD)"
echo "omp-run: round $run on $branch ($model)" >&2
started="$(date +%s)"

finish() {
set +e
"${cmd[@]}" > "$run/events.jsonl" 2> "$run/stderr.log" < /dev/null
code=$?
set -e

jq -r 'select(.type=="session") | .id' "$run/events.jsonl" 2>/dev/null | head -1 > "$run/session" || true
[ -s "$run/session" ] || { [ "$resume" = 1 ] && echo "$session" > "$run/session"; } || true
jq -rs '[.[] | select(.type=="message_end" and .message.role=="assistant")] | last
  | [.message.content[]? | select(.type=="text") | .text] | join("\n")' "$run/events.jsonl" > "$run/last.md" 2>/dev/null || true
jq -rs --argjson wall "$(( $(date +%s) - started ))" '
  [.[] | select(.type=="tool_execution_end")] as $t
  | [.[] | select(.type=="message_end" and .message.role=="assistant") | .message.usage] as $u
  | "wall_seconds \($wall)",
    "turns \([.[] | select(.type=="turn_end")] | length)",
    "tool_calls \($t | length) (\($t | group_by(.toolName) | map("\(.[0].toolName)=\(length)") | join(" ")))",
    "tool_errors \([$t[] | select(.isError)] | length)",
    "tokens input=\($u | map(.input) | add // 0) output=\($u | map(.output) | add // 0) cacheRead=\($u | map(.cacheRead) | add // 0)",
    "cost_usd \($u | map(.cost.total) | add // 0)"' "$run/events.jsonl" > "$run/stats" 2>/dev/null \
  || echo "wall_seconds $(( $(date +%s) - started ))" > "$run/stats"
{ git -C "$worktree" status --short; git -C "$worktree" diff --stat; } > "$run/diffstat"
head_after="$(git -C "$worktree" rev-parse HEAD)"
branch_after="$(git -C "$worktree" symbolic-ref --quiet --short HEAD || echo detached)"
if [ "$head_after" != "$head_before" ] || [ "$branch_after" != "$branch" ]; then
  echo "omp-run: omp moved HEAD ($branch@$head_before -> $branch_after@$head_after); the reviewer owns commits." >&2
  echo "omp-run: keep the changes with: git -C $worktree reset $head_before" >&2
  [ "$code" = 0 ] && code=3
fi
echo "exit $code" > "$run/status"

echo "omp-run: exit $code; final message in $run/last.md; stats:" >&2
cat "$run/stats" >&2
echo "omp-run: worktree changes:" >&2
cat "$run/diffstat" >&2
exit "$code"
}

if [ "$detach" = 1 ]; then
  (trap '' HUP; finish) > "$run/runner.log" 2>&1 < /dev/null &
  echo "$run"
  exit 0
fi
finish
