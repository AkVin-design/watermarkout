#!/usr/bin/env bash
# PreToolUse guard for Edit|Write. Mechanically enforces two more hard rules:
#   #5 NEVER modify an alembic migration that already exists on disk (immutable
#      once created/applied -- write a corrective N+1 migration instead).
#   #3 NEVER introduce async_session_factory into Celery code (use get_session()).
# Scans the raw payload; exit 2 = block. Fail-OPEN otherwise. No-ops in repos
# without alembic/Celery, so it is safe to replicate everywhere.
set -u
RAW="$(cat 2>/dev/null)"

extract(){ printf '%s' "$RAW" | grep -oE "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 \
  | sed -E "s/.*:[[:space:]]*\"([^\"]*)\"/\1/"; }
FP="$(extract file_path)"
[ -n "$FP" ] || exit 0
FP="$(printf '%s' "$FP" | sed -E 's/\\\\/\\/g; s/\\\//\//g')"
SP="$FP"
case "$SP" in
  [A-Za-z]:\\*|[A-Za-z]:/*) d="$(printf '%s' "$SP"|cut -c1|tr 'A-Z' 'a-z')"; r="$(printf '%s' "$SP"|cut -c3-|tr '\\' '/')"; SP="/$d$r";;
esac
NP="$(printf '%s' "$SP" | tr '\\' '/')"

block(){ printf 'BLOCKED by .claude/hooks/edit-guard.sh: %b\n' "$1" >&2; exit 2; }

# #5 -- alembic migration that already exists (modifying applied history)
case "$NP" in
  */alembic/versions/*.py)
    if [ -f "$SP" ]; then
      block "modifying an existing alembic migration is forbidden (hard rule #5). Migrations are immutable once created/applied -- create a NEW corrective migration (N+1) instead of editing this one."
    fi ;;
esac

# #3 -- async_session_factory inside Celery code
case "$NP" in
  */agents/tasks.py|*/agents/celery_app.py|*/agents/*.py)
    if printf '%s' "$RAW" | grep -q 'async_session_factory'; then
      block "async_session_factory must not be used in Celery code (hard rule #3). Use get_session() (sync context) in Celery tasks."
    fi ;;
esac

exit 0
