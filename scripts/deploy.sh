#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────
# deploy.sh — Build images locally (linux/amd64), stream them to the
# server over SSH, sync config files, and start the stack.
# No remote registry required.
#
# Usage: ./deploy.sh <SERVER_IP>
# ──────────────────────────────────────────────────────────────────────

if [ $# -lt 1 ]; then
  echo "Usage: $0 <SERVER_IP>"
  exit 1
fi

SERVER_IP="$1"
DEPLOY_USER="deploy"
REMOTE_DIR="/home/$DEPLOY_USER/app"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
SSH_TARGET="$DEPLOY_USER@$SERVER_IP"

echo "==> Building images for linux/amd64..."
docker buildx build --platform linux/amd64 --load \
  -t amigochi-astro:prod "$PROJECT_DIR/astro-app"

docker buildx build --platform linux/amd64 --load \
  -t amigochi-pocketbase:prod "$PROJECT_DIR/pocketbase"

echo "==> Streaming images to $SERVER_IP..."
echo "    astro (this can take a few minutes)..."
docker save amigochi-astro:prod | gzip | ssh "$SSH_TARGET" "gunzip | docker load"

echo "    pocketbase..."
docker save amigochi-pocketbase:prod | gzip | ssh "$SSH_TARGET" "gunzip | docker load"

echo "==> Syncing project files..."
rsync -avz --delete \
  --exclude node_modules \
  --exclude .git \
  --exclude .pulumi \
  --exclude dist \
  --exclude pocketbase-data \
  "$PROJECT_DIR/" "$SSH_TARGET:$REMOTE_DIR/"

echo "==> Starting containers on server..."
ssh "$SSH_TARGET" "
  cd $REMOTE_DIR && \
  mkdir -p pocketbase-data && \
  sudo docker compose up -d
"

sleep 3
echo "==> Deployment complete!"
echo "    Site:       http://$SERVER_IP"
echo "    PocketBase: ssh -L 8090:127.0.0.1:8090 $SSH_TARGET  →  http://localhost:8090/_/"
