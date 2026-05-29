#!/usr/bin/env bash
# Install git hooks from scripts/git-hooks/ into .git/hooks/

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel)"
HOOKS_SRC="$ROOT/scripts/git-hooks"
HOOKS_DST="$ROOT/.git/hooks"

if [ ! -d "$ROOT/.git" ]; then
  echo "Not a git repository. Run from the repo root."
  exit 1
fi

mkdir -p "$HOOKS_DST"

for hook in "$HOOKS_SRC"/*; do
  name="$(basename "$hook")"
  cp "$hook" "$HOOKS_DST/$name"
  chmod +x "$HOOKS_DST/$name"
  echo "Installed hook: $name"
done

echo "Done. Hooks will run automatically on git commit/push."
