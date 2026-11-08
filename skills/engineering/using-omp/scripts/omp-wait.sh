#!/usr/bin/env bash
# Block until every given omp round has ended, and print one line per round as it ends,
# followed by the round's stats.
#
#   omp-wait.sh ROUND_DIR...
#
# Exits 0 when every round exited 0, and 1 otherwise.
set -euo pipefail

[ $# -gt 0 ] || { echo "omp-wait: give at least one round folder" >&2; exit 2; }
for round in "$@"; do
  [ -f "$round/status" ] || { echo "omp-wait: no status file in $round" >&2; exit 2; }
done

pending=("$@")
failed=0
while [ ${#pending[@]} -gt 0 ]; do
  still=()
  for round in "${pending[@]}"; do
    status="$(cat "$round/status")"
    if [ "$status" = running ]; then
      still+=("$round")
      continue
    fi
    echo "$status $round"
    [ ! -f "$round/stats" ] || sed 's/^/  /' "$round/stats"
    [ "$status" = "exit 0" ] || failed=1
  done
  pending=("${still[@]+"${still[@]}"}")
  [ ${#pending[@]} -eq 0 ] || sleep 15
done
exit "$failed"
