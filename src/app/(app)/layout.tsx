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
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:gap-6 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <BrandMark />
            <span className="hidden text-[15px] font-semibold tracking-tight text-ink-900 sm:block">
              AWS Mastery Academy
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
      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">{children}</main>
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
        className="grid h-8 w-8 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600"
        title={user.displayName}
        aria-label={`Signed in as ${user.displayName}`}
      >
        {initials}
      </span>
      <form action={logout}>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-ink-900"
        >
          <LogOut aria-hidden className="h-4 w-4" />
          <span className="hidden md:inline">Sign out</span>
          <span className="sr-only md:hidden">Sign out</span>
        </button>
      </form>
    </div>
  );
}
