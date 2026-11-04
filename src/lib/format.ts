import "server-only";
import { env } from "@/lib/env";

/** Date and time in the learner's own time zone (APP_TIMEZONE). */
export function formatDateTime(d: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: env().APP_TIMEZONE,
  }).format(d);
}
