/**
 * Creates .env from .env.example with a freshly generated database password.
 * Refuses to overwrite an existing .env so your settings are never clobbered.
 *
 *   npm run setup:env
 */
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const target = path.join(root, ".env");

if (existsSync(target)) {
  console.log(".env already exists. Leaving it untouched.");
  process.exit(0);
}

const password = randomBytes(24).toString("base64url");
const template = readFileSync(path.join(root, ".env.example"), "utf8");
const content = template.replaceAll("change-me", password);

writeFileSync(target, content, { mode: 0o600 });
console.log("Created .env with a random Postgres password (file mode 600).");
