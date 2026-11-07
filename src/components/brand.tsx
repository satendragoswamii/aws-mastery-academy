import { Cloud } from "lucide-react";

/** App logo: a simple cloud on a dark tile. */
export function BrandMark({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-11 w-11 rounded-xl" : "h-8 w-8 rounded-lg";
  const icon = size === "lg" ? "h-6 w-6" : "h-[18px] w-[18px]";
  return (
    <span className={`grid place-items-center bg-ink-900 text-white ${box}`}>
      <Cloud aria-hidden className={icon} strokeWidth={2.2} />
    </span>
  );
}
