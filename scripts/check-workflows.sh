#!/usr/bin/env bash
# Guarantee G5 (fork-safe CI): fails when a workflow breaks one of these rules.
#   1. never `pull_request_target`
#   2. never a `self-hosted` runner
#   3. a workflow that runs on `pull_request` references no `secrets.*`
#   4. a workflow that captures or uploads (`scry-deployer`, `capture rn`) has no
#      `pull_request` trigger, runs on `push` to the default branch, and guards every job
#      with an `if:` that names the default branch
# Plain grep on comment-stripped files; no YAML parser needed.
# Usage: scripts/check-workflows.sh [workflow-dir]   (default: .github/workflows)
set -u
dir="${1:-.github/workflows}"
fail=0
bad() { echo "FAIL $1: $2"; fail=1; }

shopt -s nullglob
files=("$dir"/*.yml "$dir"/*.yaml)
[ ${#files[@]} -gt 0 ] || { echo "FAIL no workflow files in $dir"; exit 1; }

for f in "${files[@]}"; do
  body="$(sed 's/[[:space:]]*#.*$//' "$f")"
  has() { printf '%s\n' "$body" | grep -Eq "$1"; }

  has 'pull_request_target' && bad "$f" "uses pull_request_target"
  has 'self-hosted' && bad "$f" "uses a self-hosted runner"

  on_pr=0
  has '(^|[^_a-z])pull_request([^_a-z]|$)' && on_pr=1
  if [ "$on_pr" = 1 ] && has 'secrets\.'; then
    bad "$f" "runs on pull_request and references secrets"
  fi

  if has 'scry-deployer|capture rn'; then
    [ "$on_pr" = 1 ] && bad "$f" "captures/uploads but also triggers on pull_request"
    has '(^|[[:space:]])push:' || bad "$f" "captures/uploads but has no push trigger"
    # each job must carry an `if:` naming the default branch
    jobs="$(printf '%s\n' "$body" | awk '/^jobs:/{j=1;next} /^[^ ]/{j=0} j && /^  [A-Za-z0-9_-]+:[[:space:]]*$/{n++} END{print n+0}')"
    guards="$(printf '%s\n' "$body" | grep -Ec 'if:.*default_branch')"
    [ "$guards" -ge 1 ] && [ "$guards" -ge "$jobs" ] || bad "$f" "captures/uploads without an if: default_branch guard on every job ($guards guards, $jobs jobs)"
  fi
done

[ "$fail" = 0 ] && echo "ok: ${#files[@]} workflow file(s) pass G5"
exit "$fail"
