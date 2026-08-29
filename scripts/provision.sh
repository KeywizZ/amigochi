#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────────────────────────────
# provision.sh — One-time server setup (Docker-based)
# Usage: ./provision.sh <DROPLET_IP>
# ──────────────────────────────────────────────────────────────────────

if [ $# -lt 1 ]; then
  echo "Usage: $0 <DROPLET_IP>"
  exit 1
fi

DROPLET_IP="$1"
SSH_USER="root"
DEPLOY_USER="deploy"

echo "==> Provisioning $DROPLET_IP"

run_remote() {
  ssh -o StrictHostKeyChecking=no "$SSH_USER@$DROPLET_IP" "$@"
}

# ── Step 1: Create deploy user ──
echo "==> Creating deploy user..."
run_remote "
  if ! id $DEPLOY_USER &>/dev/null; then
    useradd -m -s /bin/bash $DEPLOY_USER
    echo '$DEPLOY_USER ALL=(ALL) NOPASSWD:ALL' > /etc/sudoers.d/$DEPLOY_USER
    chmod 0440 /etc/sudoers.d/$DEPLOY_USER
    usermod -aG docker $DEPLOY_USER
    mkdir -p /home/$DEPLOY_USER/.ssh
    cp /root/.ssh/authorized_keys /home/$DEPLOY_USER/.ssh/
    chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/.ssh
    chmod 700 /home/$DEPLOY_USER/.ssh
    chmod 600 /home/$DEPLOY_USER/.ssh/authorized_keys
  fi
"

# ── Step 2: Create app directory ──
echo "==> Creating app directory..."
run_remote "mkdir -p /home/$DEPLOY_USER/app"
run_remote "chown -R $DEPLOY_USER:$DEPLOY_USER /home/$DEPLOY_USER/app"

echo "==> Provisioning complete!"
echo "    Deploy user: $DEPLOY_USER"
echo ""
echo "Next step: Run ./deploy.sh $DROPLET_IP to deploy the app"
