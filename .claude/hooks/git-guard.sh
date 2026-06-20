#!/usr/bin/env bash
# Claude Code PreToolUse guard for the Bash tool.
# Mechanically enforces two hard rules (prose -> guarantee):
#   1. NEVER force-push to master/main   (hard rule #1)
#   2. NEVER stage/commit .env or secret files (hard rule #2)
#
# Committed to the repo so it loads at session start (no manual /hooks reload)
# and fires everywhere the repo is used -- local sessions, fresh clones, and
# the self-hosted CI runner (which has no ~/.claude/settings.json).
#
# Contract: receives the hook payload JSON on stdin. We scan the RAW text
# (the dangerous tokens -- git push, master, .env -- survive JSON encoding
# intact, so no JSON parser/jq/python is needed). exit 2 = block, and stderr
# is fed back to the model. Fail-OPEN everywhere else: a guard that breaks
# legitimate work is worse than no guard.
set -u

RAW="$(cat 2>/dev/null)"

# Fast bail: only git push / add / commit / stage are interesting.
case "$RAW" in
  *"git push"*|*"git add"*|*"git commit"*|*"git stage"*) ;;
  *) exit 0 ;;
esac

block() { printf 'BLOCKED by .claude/hooks/git-guard.sh: %b\n' "$1" >&2; exit 2; }

# --- Rule 1: force-push to master/main --------------------------------------
if printf '%s' "$RAW" | grep -q "git push"; then
  # A force token: --force / --force-with-lease / a short -f flag / + refspec
  if printf '%s' "$RAW" | grep -Eq -- '--force|(^|[[:space:]])-[A-Za-z]*f[A-Za-z]*([[:space:]]|$)|\+(master|main|refs/heads/(master|main))'; then
    # ...aimed at master or main (as a whole word, or a +refspec)
    if printf '%s' "$RAW" | grep -Eq -- '(^|[^A-Za-z0-9_/])(master|main)([^A-Za-z0-9_-]|$)|\+(master|main|refs/heads/(master|main))'; then
      block "force-push to master/main is forbidden (hard rule #1: shared history, unrecoverable). Force-push an explicitly-named feature branch instead, e.g. 'git push --force-with-lease origin my-feature'."
    fi
  fi
fi

# --- Rule 2: staging / committing secrets -----------------------------------
if printf '%s' "$RAW" | grep -Eq "git (add|commit|stage)"; then
  # Drop allowed template files so they never trip the secret matcher.
  SCRUB="$(printf '%s' "$RAW" | sed -E 's/\.env\.(example|sample|template|dist)//g')"
  # Explicit secret-file references named in the command text.
  if printf '%s' "$SCRUB" | grep -Eq -- '(^|[^A-Za-z0-9_./-])\.env($|[^A-Za-z0-9])|\.env\.[A-Za-z0-9_-]+|(^|[/"'"'"' ])id_(rsa|ed25519|dsa)\b|\.pem\b|\.p12\b|\.pfx\b|\.key\b|\.keystore\b'; then
    block ".env or secret file in a 'git add'/'git commit' (hard rule #2). Keep secrets out of git -- commit a '.env.example' template instead."
  fi
  # Broad stage (-A / --all / bare '.' / commit -a): inspect the worktree too,
  # since the command text wouldn't name the secret. Fail-open on any error.
  if printf '%s' "$RAW" | grep -Eq -- 'git add ([^&|;]*(-A|--all)([^A-Za-z0-9_-]|$)|[^&|;]*[[:space:]]\.([^A-Za-z0-9_/-]|$))|git commit [^&|;]*-a'; then
    SECRETS="$(git status --porcelain 2>/dev/null \
      | sed -E 's/^...//' \
      | grep -Ei '(^|/)\.env($|\.)|\.pem$|\.p12$|\.pfx$|\.key$|\.keystore$|(^|/)id_(rsa|ed25519|dsa)$' \
      | grep -Ev '\.env\.(example|sample|template|dist)$')"
    if [ -n "$SECRETS" ]; then
      block "a broad 'git add' would stage a secret file (hard rule #2):\n${SECRETS}\nAdd files explicitly, or gitignore the secret."
    fi
  fi
fi

exit 0
