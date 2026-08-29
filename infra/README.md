# Infrastructure (Pulumi)

## What is Pulumi?

Pulumi is an Infrastructure-as-Code (IaC) tool that lets you define cloud infrastructure using real programming languages (TypeScript, Python, Go, etc.) instead of DSLs like Terraform's HCL.

### Core Concepts

- **Project:** A directory with a `Pulumi.yaml` file. Our project is `amigochi-infra`.
- **Stack:** An instance of a project (like an environment). We have two stacks:
  - `dev` — Runs Docker containers locally
  - `prod` — Provisions a Vultr cloud instance
- **State:** Pulumi tracks what resources exist. By default, it stores state locally in `~/.pulumi/`.
- **Resources:** Cloud or local objects you define (instances, containers, networks, etc.).

### Our Two Stacks

```
infra/
├── Pulumi.yaml          # Project metadata
├── Pulumi.dev.yaml       # Dev stack: mode = "docker"
├── Pulumi.prod.yaml      # Prod stack: mode = "vultr"
└── src/
    ├── index.ts          # Reads mode from config, delegates
    ├── docker.ts         # Dev: builds images, runs containers locally
    └── vultr.ts          # Prod: creates Vultr instance + firewall
```

**`index.ts`** reads the `mode` config value and loads the appropriate module:
- `mode: "docker"` → Uses `@pulumi/docker` to manage local containers
- `mode: "vultr"` → Uses `@ediri/vultr` to create a remote Vultr instance

### Dev Stack (Local Docker)

Uses `@pulumi/docker` to:
1. Build Astro and PocketBase Docker images
2. Create a Docker network
3. Start 3 containers: nginx (port 80), astro (port 4321), pocketbase (port 8090)
4. Mount nginx config, PocketBase hooks, and data volume

### Prod Stack (Vultr)

Uses `@ediri/vultr` to:
1. Create a Vultr Cloud Compute instance (vc2-1c-2gb, Amsterdam, ~$6/mo)
2. Install Docker via cloud-init
3. Set up firewall group with rules for ports 22, 80, 443
4. Attach SSH key

Application deployment is handled separately by `scripts/deploy.sh` using Docker Compose.

### Commands

```bash
# Install dependencies
npm install

# Switch between stacks
pulumi stack select dev
pulumi stack select prod

# Preview changes
pulumi preview

# Apply changes
pulumi up

# See current state
pulumi stack

# Tear down
pulumi destroy
```

### First Time Setup

**Dev (local):**
```bash
cd infra
npm install
pulumi stack select dev
pulumi config set mode docker
pulumi up
```

**Prod (Vultr):**
1. Get a Vultr API key from https://console.vultr.com/account/api
2. Edit `Pulumi.prod.yaml`:
   ```yaml
   config:
     mode: vultr
     vultr:apiKey:
       secure: YOUR_VULTR_API_KEY_HERE
     sshPublicKeyPath:
       secure: /Users/you/.ssh/id_ed25519.pub
   ```
3. Run `pulumi stack select prod && pulumi up`
