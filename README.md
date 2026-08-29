# Amigochi POC

Astro SSR frontend + PocketBase backend, deployed with Docker on Vultr.

## Tech Stack

- **Frontend:** Astro 7 (SSR, Node.js adapter)
- **Backend:** PocketBase (latest stable, SQLite)
- **Infrastructure:** Pulumi (TypeScript) on Vultr
- **Containers:** Docker + Docker Compose
- **CI/CD:** GitHub Actions + local deploy scripts

## Documentation

- **Astro:** [Official Docs](https://docs.astro.build/) · [SSR Guide](https://docs.astro.build/en/guides/server-side-rendering/) · [Node Adapter](https://docs.astro.build/en/guides/integrations-guide/node/)
- **PocketBase:** [Official Docs](https://pocketbase.io/docs/) · [JS Hooks](https://pocketbase.io/docs/js-overview/) · [REST API](https://pocketbase.io/docs/rest-api/) · [Go Overview](https://pocketbase.io/docs/go-overview/)
- **Pulumi:** [Vultr Provider](https://www.pulumi.com/registry/packages/vultr/) · [Docker Provider](https://www.pulumi.com/registry/packages/docker/)

## Prerequisites

- Node.js >= 22
- Docker Desktop (for local dev)
- Pulumi CLI (`brew install pulumi`)
- Vultr account + API key (for prod)
- SSH key pair (for prod)

## Quickstart

### Local Development (Docker)

```bash
cd infra
npm install
pulumi stack select dev
pulumi config set mode docker
pulumi up
# → Astro: http://localhost
# → PocketBase: http://localhost:8090/_/
```

### Production (Vultr)

```bash
# 1. Provision infrastructure
cd infra
pulumi stack select prod
# Edit Pulumi.prod.yaml with your Vultr API key and SSH key path
pulumi up

# 2. Server setup (one-time)
cd ../scripts
./provision.sh <INSTANCE_IP>

# 3. Deploy
./deploy.sh <INSTANCE_IP>
```

## Project Structure

```
poc-1/
├── astro-app/           # Astro SSR project + Dockerfile
├── pocketbase/          # PocketBase Dockerfile
├── nginx/               # Nginx reverse proxy config
├── pocketbase-hooks/    # PocketBase JS hooks
├── docker-compose.yml   # Docker Compose (prod reference)
├── infra/               # Pulumi infrastructure (see infra/README.md)
├── scripts/             # Provision + deploy + teardown scripts
└── .github/workflows/   # GitHub Actions CI/CD
```

## URLs

| Service | Local (dev) | Production |
|---------|-------------|------------|
| Astro app | `http://localhost` | `http://<INSTANCE_IP>` |
| PocketBase API | `http://localhost:8090` | `http://<INSTANCE_IP>:8090` |
| PocketBase Admin | `http://localhost:8090/_/` | `http://<INSTANCE_IP>/pb/_/` |

## PocketBase JS Hooks

JS hooks live in `pocketbase-hooks/pb_hooks/` and are mounted into the PocketBase container. They run in PocketBase's built-in JS VM.

See [PocketBase JS docs](https://pocketbase.io/docs/js-overview/) for available APIs.

## Teardown

```bash
# Local dev
cd infra && pulumi destroy

# Production
cd infra && pulumi stack select prod && pulumi destroy
```
