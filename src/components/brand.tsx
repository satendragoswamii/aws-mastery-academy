import { Cloud } from "lucide-react";

/** App logo: a cloud in a warm orange tile. */
export function BrandMark({ size = "md" }: { size?: "md" | "lg" }) {
  const box = size === "lg" ? "h-12 w-12 rounded-2xl" : "h-9 w-9 rounded-xl";
  const icon = size === "lg" ? "h-7 w-7" : "h-5 w-5";
  return (
    <span className={`grid place-items-center bg-gradient-to-br from-brand-400 to-brand-600 text-white shadow-md shadow-brand-600/30 ${box}`}>
      <Cloud aria-hidden className={icon} strokeWidth={2.4} />
    </span>
  );
}
