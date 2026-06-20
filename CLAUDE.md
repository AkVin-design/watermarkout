# WatermarkOut — Claude Code instructions

> Minimal CLAUDE.md documenting the shared hook-enforcement layer (replicated
> from the AKH setup). Expand with project-specific guidance as needed.
> Note: this is a TypeScript/React repo, so the Python-specific guards below
> (ruff lint, alembic, Celery) are present but no-op here.

## Mechanical enforcement (hooks)

Git/secret discipline is enforced by hooks, not just convention. Hooks run via
**Git Bash**, so they fire from PowerShell, cmd, bash, and Claude Code alike.
Pure bash + grep, fail-open. Keep their line endings **LF** (`.gitattributes`
pins `*.sh` + `.githooks/*`) or they break on Linux runners.

- **Claude Code hooks** — `.claude/settings.json` → `.claude/hooks/`:
  - `git-guard.sh` (PreToolUse Bash): blocks force-push to master/main + `git
    add`/`commit` of secret files (`.env`, `*.pem`, `id_rsa`, `*.key`, …).
  - `edit-guard.sh` (PreToolUse Edit|Write): blocks editing an existing
    `alembic/versions/*.py` migration + introducing `async_session_factory` in
    `agents/*.py`. *No-ops here (no alembic/Celery).*
  - `lint-changed.sh` (PostToolUse Edit|Write): runs `ruff` on edited `.py`.
    *No-ops here (no Python).*
- **All-actor git hooks** — `.githooks/` via `core.hooksPath` (covers humans +
  any tool, not just Claude):
  - `pre-commit`: blocks secret files + secret **values** (gitleaks if on PATH,
    else a high-signal regex); auto-fixes staged Python with ruff (n/a here).
  - `pre-push`: blocks force/non-ff push + deletion of master/main.
- **Fresh-clone bootstrap (the ONE manual step):**
  `git config core.hooksPath .githooks` — the `.claude/` hooks load
  automatically; only the git-level layer needs this.

Canonical/maintained copy of this layer lives in the AKH repo's `CLAUDE.md`.
