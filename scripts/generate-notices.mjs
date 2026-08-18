#!/usr/bin/env node
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const inputPath = path.join(root, "THIRD_PARTY_NOTICES.json");
const outputPath = path.join(root, "THIRD_PARTY_NOTICES.md");

const packages = JSON.parse(readFileSync(inputPath, "utf8"));
const lines = [
  "# Third-Party Notices",
  "",
  "MD Reader includes the following third-party open-source components.",
  "",
];

const entries = Object.entries(packages).sort(([a], [b]) => a.localeCompare(b));

for (const [name, info] of entries) {
  lines.push(`## ${name}`);
  lines.push("");
  lines.push(`- License: ${info.licenses}`);
  if (info.repository) {
    lines.push(`- Repository: ${info.repository}`);
  }
  lines.push("");
}

writeFileSync(outputPath, `${lines.join("\n")}\n`, "utf8");
console.log(`Wrote ${outputPath}`);
