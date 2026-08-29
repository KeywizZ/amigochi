#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────
# teardown.sh — Destroy all infrastructure
# Usage: ./teardown.sh
# ──────────────────────────────────────────────────────────────────────

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
INFRA_DIR="$(dirname "$SCRIPT_DIR")/infra"

echo "WARNING: This will destroy ALL infrastructure (droplet, firewall, IP)."
echo "This action is irreversible."
read -p "Type 'destroy' to confirm: " CONFIRM

if [ "$CONFIRM" != "destroy" ]; then
  echo "Aborted."
  exit 1
fi

cd "$INFRA_DIR"
pulumi destroy --yes

echo "==> Infrastructure destroyed."
