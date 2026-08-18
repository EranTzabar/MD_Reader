#!/usr/bin/env node
/**
 * Fail the build if any npm dependency uses a non-permissive license.
 * Allowed: MIT, Apache-2.0, BSD-*, ISC, Zlib, Unlicense, CC0-1.0, 0BSD
 */

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const ALLOWED = new Set([
  "MIT",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "ISC",
  "Zlib",
  "Unlicense",
  "CC0-1.0",
  "CC-BY-3.0",
  "CC-BY-4.0",
  "0BSD",
  "BlueOak-1.0.0",
]);

const FORBIDDEN_PATTERNS = [
  /\bGPL/i,
  /\bLGPL/i,
  /\bAGPL/i,
  /\bSSPL/i,
  /\bCommons Clause/i,
  /Non-Commercial/i,
  /\bNC\b/i,
];

function normalizeLicense(value) {
  if (!value || value === "UNKNOWN") {
    return "UNKNOWN";
  }
  return value.replace(/[()]/g, "").trim();
}

function isAllowed(license) {
  if (ALLOWED.has(license)) {
    return true;
  }

  if (license.includes(" AND ") || license.includes(" OR ")) {
    const parts = license.split(/\s+(?:AND|OR)\s+/);
    return parts.every((part) => ALLOWED.has(part.trim()));
  }

  return false;
}

function isForbidden(license) {
  return FORBIDDEN_PATTERNS.some((pattern) => pattern.test(license));
}

const raw = execSync("npx license-checker --production --json --excludePrivatePackages", {
  cwd: root,
  encoding: "utf8",
});

const packages = JSON.parse(raw);
const violations = [];

for (const [name, info] of Object.entries(packages)) {
  const licenses = String(info.licenses ?? "UNKNOWN")
    .split(/\s*(?:\/|,|\|)\s*/)
    .map(normalizeLicense);

  for (const license of licenses) {
    if (license === "UNKNOWN" || isForbidden(license) || !isAllowed(license)) {
      violations.push({ name, license: info.licenses });
      break;
    }
  }
}

if (violations.length > 0) {
  console.error("License check failed. Non-permissive or unknown licenses found:\n");
  for (const item of violations) {
    console.error(`  - ${item.name}: ${item.license}`);
  }
  process.exit(1);
}

console.log(`License check passed (${Object.keys(packages).length} packages).`);
