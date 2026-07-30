"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Menu,
  Moon,
  Sparkles,
  Target,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

type NavigationItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  section: "foundation" | "planning";
};

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    section: "foundation",
  },
  {
    label: "Brainstorm",
    href: "/brainstorm",
    icon: Brain,
    section: "foundation",
  },
  {
    label: "Categories",
    href: "/categorize",
    icon: FolderKanban,
    section: "foundation",
  },
  {
    label: "Priorities",
    href: "/priorities",
    icon: ListChecks,
    section: "foundation",
  },
  {
    label: "Vision Board",
    href: "/vision",
    icon: Sparkles,
    section: "planning",
  },
  {
    label: "Yearly Plan",
    href: "/year",
    icon: Target,
    section: "planning",
  },
  {
    label: "Monthly Plan",
    href: "/month",
    icon: CalendarDays,
    section: "planning",
  },
];

function isCurrentRoute(
  pathname: string,
  href: string,
) {
  if (href === "/dashboard") {
    return pathname === href;
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function AppSidebar() {
  const pathname = usePathname();

  const [collapsed, setCollapsed] =
    useState(false);

  const [mobileOpen, setMobileOpen] =
    useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const foundationItems = navigationItems.filter(
    (item) => item.section === "foundation",
  );

  const planningItems = navigationItems.filter(
    (item) => item.section === "planning",
  );

  function renderNavigationItem(
    item: NavigationItem,
  ) {
    const Icon = item.icon;

    const active = isCurrentRoute(
      pathname,
      item.href,
    );

    return (
      <Link
        key={item.href}
        href={item.href}
        title={collapsed ? item.label : undefined}
        className={`
          group flex min-h-11 items-center rounded-xl
          border px-3 text-sm font-medium transition
          ${
            active
              ? "border-zinc-700 bg-zinc-800 text-white"
              : "border-transparent text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100"
          }
          ${collapsed ? "justify-center" : "gap-3"}
        `}
      >
        <Icon className="h-5 w-5 shrink-0" />

        {!collapsed ? (
          <span className="truncate">
            {item.label}
          </span>
        ) : null}
      </Link>
    );
  }

  const sidebarContent = (
    <>
      <header
        className={`
          flex h-20 items-center border-b
          border-zinc-800 px-4
          ${
            collapsed
              ? "justify-center"
              : "justify-between"
          }
        `}
      >
        {!collapsed ? (
          <Link
            href="/vision"
            className="flex min-w-0 items-center gap-3"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950">
              <Sparkles className="h-5 w-5" />
            </div>

            <div className="min-w-0">
              <p className="truncate font-semibold text-zinc-100">
                Kaizen
              </p>

              <p className="truncate text-xs text-zinc-500">
                Personal growth system
              </p>
            </div>
          </Link>
        ) : (
          <Link
            href="/vision"
            title="Kaizen"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 text-zinc-950"
          >
            <Sparkles className="h-5 w-5" />
          </Link>
        )}

        {!collapsed ? (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200 lg:hidden"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" />
          </button>
        ) : null}
      </header>

      <nav className="flex-1 overflow-y-auto p-3">
        {!collapsed ? (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
            Foundation
          </p>
        ) : null}

        <div className="space-y-1">
          {foundationItems.map(
            renderNavigationItem,
          )}
        </div>

        <div className="my-5 border-t border-zinc-800" />

        {!collapsed ? (
          <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-zinc-600">
            Planning
          </p>
        ) : null}

        <div className="space-y-1">
          {planningItems.map(
            renderNavigationItem,
          )}
        </div>
      </nav>

      <footer className="border-t border-zinc-800 p-3">
        <button
          type="button"
          onClick={() =>
            setCollapsed((current) => !current)
          }
          className={`
            hidden min-h-11 w-full items-center rounded-xl
            px-3 text-sm text-zinc-500 transition
            hover:bg-zinc-900 hover:text-zinc-200 lg:flex
            ${
              collapsed
                ? "justify-center"
                : "gap-3"
            }
          `}
          aria-label={
            collapsed
              ? "Expand navigation"
              : "Collapse navigation"
          }
        >
          {collapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <>
              <ChevronLeft className="h-5 w-5" />
              <span>Collapse</span>
            </>
          )}
        </button>

        {!collapsed ? (
          <div className="mt-2 flex items-center gap-3 rounded-xl px-3 py-2 text-xs text-zinc-600">
            <Moon className="h-4 w-4" />
            <span>Keep improving</span>
          </div>
        ) : null}
      </footer>
    </>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="fixed left-4 top-4 z-40 flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-950 text-zinc-200 shadow-xl lg:hidden"
        aria-label="Open navigation"
      >
        <Menu className="h-5 w-5" />
      </button>

      {mobileOpen ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex
          flex-col border-r border-zinc-800 bg-zinc-950
          transition-[width,transform] duration-200

          ${
            collapsed
              ? "w-20"
              : "w-72"
          }

          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          lg:translate-x-0
        `}
      >
        {sidebarContent}
      </aside>

      <div
        className={`
          hidden transition-[width] duration-200 lg:block
          ${collapsed ? "w-20" : "w-72"}
        `}
      />
    </>
  );
}