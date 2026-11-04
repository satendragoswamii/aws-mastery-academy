/** "Good morning/afternoon/evening" by the learner's local clock. */
export function greetingFor(at: Date, timeZone: string): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", { hour: "2-digit", hourCycle: "h23", timeZone }).format(at),
  );
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
}

const ENCOURAGEMENT = [
  "Every expert was once a beginner. Let's learn something today.",
  "Small steps every day build real cloud skills.",
  "Understanding beats memorising. Take your time.",
  "Today's lesson is tomorrow's interview answer.",
  "Curiosity is your best tool. Ask why, then try it in the lab.",
];

/** Stable per day, so the message doesn't flicker on every refresh. */
export function encouragementFor(day: string): string {
  let h = 0;
  for (const ch of day) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return ENCOURAGEMENT[h % ENCOURAGEMENT.length];
}
