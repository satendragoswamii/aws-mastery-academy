import { z } from "zod";
import { assertLocalEndpoint } from "@/lib/floci/endpoint";

/**
 * Server-side configuration, validated once at first use.
 * Nothing in here is exposed to the browser.
 */
const schema = z.object({
  DATABASE_URL: z
    .string()
    .regex(/^postgres(ql)?:\/\//, "DATABASE_URL must be a postgres:// URL"),
  FLOCI_ENDPOINT: z.string().default("http://localhost:4566"),
  FLOCI_REGION: z
    .string()
    .regex(/^[a-z]{2}(-[a-z]+)+-\d$/, "FLOCI_REGION must look like us-east-1")
    .default("us-east-1"),
  SESSION_TTL_DAYS: z.coerce.number().int().min(1).max(90).default(14),
  /** Your local time zone; learning streaks follow your midnight. */
  APP_TIMEZONE: z
    .string()
    .default("Asia/Kolkata")
    .refine((tz) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
        return true;
      } catch {
        return false;
      }
    }, "APP_TIMEZONE must be an IANA time zone such as Asia/Kolkata"),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export type ServerEnv = Omit<z.infer<typeof schema>, "FLOCI_ENDPOINT"> & {
  FLOCI_ENDPOINT: string;
};

export function parseEnv(source: Record<string, string | undefined>): ServerEnv {
  const result = schema.safeParse(source);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Invalid server configuration:\n${issues}\nSee .env.example.`);
  }
  return {
    ...result.data,
    FLOCI_ENDPOINT: assertLocalEndpoint(result.data.FLOCI_ENDPOINT),
  };
}

let cached: ServerEnv | undefined;

export function env(): ServerEnv {
  cached ??= parseEnv(process.env);
  return cached;
}
