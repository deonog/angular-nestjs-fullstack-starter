#!/usr/bin/env bash
# Fail if source files are untracked or nested git repos exist.
# Respects .gitignore — only reports files Git would track.

set -euo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

errors=0

echo "Checking for nested .git directories..."
while IFS= read -r nested; do
  echo -e "${RED}ERROR:${NC} Nested git repo found: ${nested#./}"
  echo "  Remove it so the monorepo tracks those files:"
  echo "  rm -rf \"${nested}\""
  errors=$((errors + 1))
done < <(find . -name .git -type d ! -path './.git' 2>/dev/null)

echo "Checking for untracked files (not in .gitignore)..."
untracked="$(git status --porcelain --untracked-files=normal | awk '/^\?\? / {print substr($0, 4)}' || true)"

if [ -n "$untracked" ]; then
  echo -e "${YELLOW}Untracked files:${NC}"
  echo "$untracked" | while IFS= read -r file; do
    echo "  - $file"
  done
  echo ""
  echo "Stage them with:  git add <path>"
  echo "Or ignore with:   echo '<pattern>' >> .gitignore"
  errors=$((errors + 1))
fi

if [ "$errors" -gt 0 ]; then
  echo -e "${RED}check-repo failed ($errors issue(s)).${NC}"
  exit 1
fi

echo -e "${GREEN}check-repo passed — no nested repos, no untracked files.${NC}"
