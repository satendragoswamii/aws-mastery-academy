"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, BookOpen, LayoutDashboard, NotebookPen } from "lucide-react";

const LINKS = [
  { href: "/", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/learn", label: "Curriculum", Icon: BookOpen },
  { href: "/notes", label: "Notes & bookmarks", Icon: NotebookPen },
  { href: "/system", label: "System", Icon: Activity },
];

export function NavLinks() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto text-sm" aria-label="Main">
      {LINKS.map(({ href, label, Icon }) => {
        const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            title={label}
            className={`flex shrink-0 items-center gap-2 whitespace-nowrap rounded-md px-2.5 py-1.5 font-medium transition-colors ${
              active ? "bg-slate-100 text-ink-900" : "text-slate-500 hover:bg-slate-50 hover:text-ink-900"
            }`}
          >
            <Icon aria-hidden className="h-4 w-4 md:hidden" />
            {/* Phones show icons only so the account menu stays visible; the label stays the link's accessible name. */}
            <span className="sr-only md:not-sr-only">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
