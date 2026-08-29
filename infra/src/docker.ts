import * as docker from "@pulumi/docker";
import * as path from "path";

const projectRoot = path.resolve(__dirname, "..");

const composeLabels = (service: string) => [
  { label: "com.docker.compose.config-hash", value: "amigochi-dev" },
  { label: "com.docker.compose.container-number", value: "1" },
  { label: "com.docker.compose.oneoff", value: "False" },
  { label: "com.docker.compose.project", value: "amigochi" },
  { label: "com.docker.compose.project.working_dir", value: projectRoot },
  { label: "com.docker.compose.project.config_files", value: `${projectRoot}/docker-compose.yml` },
  { label: "com.docker.compose.service", value: service },
  { label: "com.docker.compose.version", value: "v2.30.3" },
];

const network = new docker.Network("amigochi-network", {
  name: "amigochi-network",
});

const pocketbaseData = new docker.Volume("pocketbase-data", {
  name: "amigochi-pocketbase-data",
});

const astroNodeModules = new docker.Volume("astro-node-modules", {
  name: "amigochi-astro-node-modules",
});

const pocketbaseImage = new docker.Image("pocketbase-image", {
  imageName: "docker.io/library/amigochi-pocketbase:latest",
  skipPush: true,
  build: {
    context: path.resolve(projectRoot, "../pocketbase"),
  },
});

const pocketbase = new docker.Container("pocketbase", {
  image: pocketbaseImage.imageName,
  name: "pocketbase",
  labels: composeLabels("pocketbase"),
  command: ["pocketbase", "serve", "--http=0.0.0.0:8090", "--dir=/pb/pb_data", "--hooksWatch"],
  ports: [
    {
      internal: 8090,
      external: 8090,
    },
  ],
  volumes: [
    {
      hostPath: path.resolve(projectRoot, "../pocketbase-hooks/pb_hooks"),
      containerPath: "/pb/pb_hooks",
    },
    {
      volumeName: pocketbaseData.name,
      containerPath: "/pb/pb_data",
    },
  ],
  networksAdvanced: [
    {
      name: network.name,
    },
  ],
  restart: "unless-stopped",
});

const astro = new docker.Container("astro", {
  image: "node:22-alpine",
  name: "astro",
  labels: composeLabels("astro"),
  command: ["sh", "-c", "if [ ! -d node_modules/astro ]; then npm ci; fi; exec npm run dev -- --host 0.0.0.0"],
  workingDir: "/app",
  ports: [
    {
      internal: 4321,
      external: 4321,
    },
  ],
  envs: [
    "HOST=0.0.0.0",
    "PORT=4321",
    "NODE_ENV=development",
    "POCKETBASE_URL=http://pocketbase:8090",
  ],
  volumes: [
    {
      hostPath: path.resolve(projectRoot, "../astro-app"),
      containerPath: "/app",
    },
    {
      volumeName: astroNodeModules.name,
      containerPath: "/app/node_modules",
    },
  ],
  networksAdvanced: [
    {
      name: network.name,
    },
  ],
  restart: "unless-stopped",
});

const nginx = new docker.Container("nginx", {
  image: "nginx:alpine",
  name: "nginx",
  labels: composeLabels("nginx"),
  ports: [
    {
      internal: 80,
      external: 80,
    },
  ],
  volumes: [
    {
      hostPath: path.resolve(projectRoot, "../nginx/default.conf"),
      containerPath: "/etc/nginx/conf.d/default.conf",
    },
  ],
  networksAdvanced: [
    {
      name: network.name,
    },
  ],
  restart: "unless-stopped",
});
