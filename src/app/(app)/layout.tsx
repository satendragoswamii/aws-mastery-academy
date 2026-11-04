import { Suspense } from "react";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { NavLinks } from "@/components/nav-links";
import { BrandMark } from "@/components/brand";
import { getCurrentUser } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 bg-ink-900 text-white shadow-lg shadow-ink-900/10">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3 sm:gap-4">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <BrandMark />
            <span className="hidden text-[15px] font-extrabold tracking-tight sm:block">
              AWS Mastery <span className="text-brand-400">Academy</span>
            </span>
          </Link>
          <div className="min-w-0 flex-1">
            <NavLinks />
          </div>
          <Suspense fallback={<span className="h-9 w-24" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-8">{children}</main>
    </div>
  );
}

async function UserMenu() {
  const user = await getCurrentUser();
  const initials = user.displayName
    .split(/\s+/)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
  return (
    <div className="flex shrink-0 items-center gap-2">
      <span
        className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-sm font-bold text-brand-300"
        title={user.displayName}
        aria-label={`Signed in as ${user.displayName}`}
      >
        {initials}
      </span>
      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-white/8 hover:text-white"
        >
          <LogOut aria-hidden className="h-4 w-4" />
          <span className="hidden md:inline">Sign out</span>
          <span className="sr-only md:hidden">Sign out</span>
        </button>
      </form>
    </div>
  );
}
