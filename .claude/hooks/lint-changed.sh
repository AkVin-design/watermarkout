#!/usr/bin/env bash
# PostToolUse quality gate (matcher Write|Edit). Lints ONLY the file just
# edited, fast and per-file. exit 2 surfaces the lint output back to the model
# so a failure becomes its next task; the edit itself already happened (this is
# PostToolUse), so we never destroy work. Fail-OPEN on anything unexpected or
# when the linter isn't installed (no-ops cleanly in repos without that stack).
set -u
RAW="$(cat 2>/dev/null)"

# Extract the edited path (no jq). Prefer tool_response.filePath, then
# tool_input.file_path. [^"]* stops at the first quote; paths have no quotes.
extract(){ printf '%s' "$RAW" | grep -oE "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -1 \
  | sed -E "s/.*:[[:space:]]*\"([^\"]*)\"/\1/"; }
FP="$(extract filePath)"; [ -n "$FP" ] || FP="$(extract file_path)"
[ -n "$FP" ] || exit 0
# JSON unescape (\\ -> \, \/ -> /), then normalize C:\x -> /c/x for shell tools.
FP="$(printf '%s' "$FP" | sed -E 's/\\\\/\\/g; s/\\\//\//g')"
SP="$FP"
case "$SP" in
  [A-Za-z]:\\*|[A-Za-z]:/*) d="$(printf '%s' "$SP"|cut -c1|tr 'A-Z' 'a-z')"; r="$(printf '%s' "$SP"|cut -c3-|tr '\\' '/')"; SP="/$d$r";;
esac
[ -f "$SP" ] || exit 0

case "$SP" in
  *.py)
    RUFF=""
    command -v ruff >/dev/null 2>&1 && RUFF="ruff"
    [ -z "$RUFF" ] && python -m ruff --version >/dev/null 2>&1 && RUFF="python -m ruff"
    [ -z "$RUFF" ] && exit 0
    if ! out="$($RUFF check "$SP" 2>&1)"; then
      printf 'ruff check found issues in %s:\n%s\n\nFix with: %s check --fix "%s"\n' "$SP" "$out" "$RUFF" "$SP" >&2
      exit 2
    fi
    if ! out="$($RUFF format --check "$SP" 2>&1)"; then
      printf 'ruff format would reformat %s. Run: %s format "%s"\n' "$SP" "$RUFF" "$SP" >&2
      exit 2
    fi
    ;;
esac
exit 0
