import * as pulumi from "@pulumi/pulumi";
import * as vultr from "@ediri/vultr";
import { readFileSync } from "fs";

const config = new pulumi.Config();
const sshPublicKeyPath = config.require("sshPublicKeyPath");

const sshKey = new vultr.SSHKey("amigochi-ssh-key", {
  name: "amigochi-ssh-key",
  sshKey: readFileSync(sshPublicKeyPath, "utf-8").trim(),
});

const firewallGroup = new vultr.FirewallGroup("amigochi-firewall", {
  description: "Amigochi POC firewall",
});

new vultr.FirewallRule("allow-ssh", {
  firewallGroupId: firewallGroup.id,
  protocol: "tcp",
  ipType: "v4",
  subnet: "0.0.0.0",
  subnetSize: 0,
  source: "",
  port: "22",
});

new vultr.FirewallRule("allow-http", {
  firewallGroupId: firewallGroup.id,
  protocol: "tcp",
  ipType: "v4",
  subnet: "0.0.0.0",
  subnetSize: 0,
  source: "",
  port: "80",
});

new vultr.FirewallRule("allow-https", {
  firewallGroupId: firewallGroup.id,
  protocol: "tcp",
  ipType: "v4",
  subnet: "0.0.0.0",
  subnetSize: 0,
  source: "",
  port: "443",
});

const ubuntu = vultr.getOsOutput({
  filters: [{ name: "name", values: ["Ubuntu 24.04 LTS x64"] }],
});

const instance = new vultr.Instance("amigochi-poc", {
  plan: "vc2-1c-1gb",
  region: "ams",
  osId: ubuntu.apply((os) => Number(os.id)),
  label: "amigochi-poc",
  backups: "disabled",
  sshKeyIds: [sshKey.id],
  firewallGroupId: firewallGroup.id,
  activationEmail: false,
  userData: `#!/bin/bash
apt-get update && apt-get upgrade -y
apt-get install -y curl wget unzip ufw
curl -fsSL https://get.docker.com | sh
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable
`,
  tags: ["amigochi", "poc"],
});

export const instanceIp = instance.mainIp;
export const instanceId = instance.id;
