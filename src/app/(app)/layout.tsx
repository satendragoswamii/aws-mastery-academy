import { Suspense } from "react";
import Link from "next/link";
import { NavLinks } from "@/components/nav-links";
import { getCurrentUser } from "@/lib/auth/dal";
import { logout } from "@/app/actions/auth";

export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/" className="font-semibold">
              AWS Mastery Academy
            </Link>
            <NavLinks />
          </div>
          <Suspense fallback={<span className="h-8" />}>
            <UserMenu />
          </Suspense>
        </div>
      </header>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 py-6">{children}</div>
    </div>
  );
}

async function UserMenu() {
  const user = await getCurrentUser();
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-zinc-500">{user.displayName}</span>
      <form action={logout}>
        <button
          type="submit"
          className="rounded-md border border-zinc-300 px-3 py-1.5 dark:border-zinc-700"
        >
          Sign out
        </button>
      </form>
    </div>
  );
}
