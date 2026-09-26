#!/usr/bin/env bash
set -euo pipefail

# Stop hook: prompts the agent to capture any learnings from this session in the
# right place — .claude/CLAUDE.md (session-wide conventions), .claude/rules/*.md
# (path-scoped conventions) and auto-memory (MEMORY.md + memory files, for user
# preferences and project context).
# Only triggers when there are uncommitted changes (including new untracked files) —
# skips read-only sessions.
#
# Used by:
# - .claude/settings.json (Stop hook)

# The hook input arrives as JSON on stdin. When `stop_hook_active` is true the
# agent is already continuing because of this hook — let it stop, or it loops.
input=$(cat)
if printf '%s' "$input" | grep -Eq '"stop_hook_active"[[:space:]]*:[[:space:]]*true'; then
  exit 0
fi

if ! command -v git >/dev/null 2>&1; then
  exit 0
fi

# Skip if no working-tree changes (read-only session or everything already committed).
# `git status --porcelain` also lists untracked files (respecting .gitignore).
if [ -z "$(git status --porcelain 2>/dev/null)" ]; then
  exit 0
fi

# Stop hooks take `decision` / `reason` at the top level (not in hookSpecificOutput).
cat <<'EOF'
{
  "decision": "block",
  "reason": "Before finishing: capture any learnings from this session in the right place.\n\n1. .claude/CLAUDE.md — team-shared rules that apply in every session (keep it under 200 lines).\n2. .claude/rules/*.md — team-shared conventions, patterns and gotchas for one part of the codebase; put each in the rule whose paths cover it (add a rule, and a row in CLAUDE.md's rules table, if none fits).\n3. Auto-memory (MEMORY.md + memory files) — user preferences, feedback on how to work, and project context not derivable from the code.\n\nFor each: add what's new, fix what's stale, and skip what the repo already records. If all are already up to date, output a brief confirmation and the session can end."
}
EOF

exit 0
