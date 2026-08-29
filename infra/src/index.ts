import * as pulumi from "@pulumi/pulumi";

const config = new pulumi.Config();
const mode = config.get("mode") || "docker";

if (mode === "docker") {
  require("./docker");
} else if (mode === "vultr") {
  require("./vultr");
} else {
  throw new Error(`Unknown mode: ${mode}. Use "docker" or "vultr".`);
}
