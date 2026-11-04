import bcrypt from "bcryptjs";

const COST = 12;
export const MIN_PASSWORD_LENGTH = 10;

export function validatePasswordStrength(password: string): string | null {
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  // bcrypt only uses the first 72 bytes; refuse silently-truncated passwords.
  if (Buffer.byteLength(password, "utf8") > 72) {
    return "Password must be at most 72 bytes.";
  }
  return null;
}

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, COST);
}

export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

let dummyHash: Promise<string> | undefined;

/**
 * A real bcrypt hash (same cost) of a random string, generated once per process.
 * Compared against when the username does not exist, so "unknown user" and
 * "wrong password" take the same time.
 */
export function getDummyHash(): Promise<string> {
  dummyHash ??= bcrypt.hash(crypto.randomUUID(), COST);
  return dummyHash;
}
