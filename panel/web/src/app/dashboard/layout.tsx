"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const navLinks = [
  { href: "/dashboard", label: "Activity" },
  { href: "/dashboard/players", label: "Players" },
  { href: "/dashboard/settings", label: "Settings" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined" && !localStorage.getItem("traceback_token")) {
      router.push("/login");
    }
  }, [router]);

  function signOut() {
    localStorage.removeItem("traceback_token");
    router.push("/login");
  }

  return (
    <div className="flex h-screen">
      <aside className="flex w-48 shrink-0 flex-col border-r border-zinc-800 bg-zinc-950">
        <div className="px-4 py-5">
          <span className="text-base font-bold text-emerald-400">Traceback</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-2">
          {navLinks.map(({ href, label }) => {
            const active = href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
            return (
              <a
                key={href}
                href={href}
                className={`block rounded px-3 py-2 text-sm transition-colors ${
                  active
                    ? "bg-zinc-800 text-zinc-100"
                    : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
                }`}
              >
                {label}
              </a>
            );
          })}
        </nav>
        <div className="p-2">
          <button
            onClick={signOut}
            className="w-full rounded px-3 py-2 text-left text-sm text-zinc-500 hover:bg-zinc-800/50 hover:text-zinc-300"
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
