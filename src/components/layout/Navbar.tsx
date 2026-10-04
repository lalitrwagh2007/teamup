"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Users, Home, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

// ─── Nav link definitions ─────────────────────────────────────────────────────

const NAV_LINKS = [
  { label: "Home", href: "/", icon: Home },
  { label: "Explore Teams", href: "/teams", icon: Users },
  { label: "Opportunities", href: "/opportunities", icon: Briefcase },
] as const;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

// ─── Desktop nav link ─────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative pb-0.5 text-sm font-medium transition-colors duration-150",
        "after:absolute after:-bottom-0.5 after:left-0 after:h-px after:w-full",
        "after:origin-left after:scale-x-0 after:rounded-full after:bg-indigo-600",
        "after:transition-transform after:duration-200 hover:after:scale-x-100",
        active
          ? "text-indigo-600 after:scale-x-100"
          : "text-muted-foreground hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}

// ─── Mobile nav link (closes the Sheet automatically via SheetClose) ──────────

function MobileNavLink({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
}) {
  return (
    <SheetClose
      render={
        <Link
          href={href}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            active
              ? "bg-indigo-50 text-indigo-700"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          )}
        />
      }
    >
      <Icon className="size-4 shrink-0" />
      {label}
    </SheetClose>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur supports-backdrop-filter:backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-8">

        {/* ── Logo ────────────────────────────────────────────────────────── */}
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2 text-xl font-bold tracking-tight"
          aria-label="TeamUp home"
        >
          <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
            T
          </span>
          <span className="hidden sm:inline">
            Team<span className="text-indigo-600">Up</span>
          </span>
        </Link>

        {/* ── Desktop nav ──────────────────────────────────────────────────── */}
        <nav aria-label="Primary navigation" className="hidden md:flex">
          <ul className="flex items-center gap-8">
            {NAV_LINKS.map(({ href, label }) => (
              <li key={href}>
                <NavLink
                  href={href}
                  label={label}
                  active={isActive(href, pathname)}
                />
              </li>
            ))}
          </ul>
        </nav>

        {/* ── Right: desktop auth + mobile trigger ─────────────────────────── */}
        <div className="flex items-center gap-2">

          {/* Desktop auth buttons */}
          <div className="hidden items-center gap-2 md:flex">
            <Button variant="ghost" size="sm">
              <Link href="/login">Log in</Link>
            </Button>
            <Button
              size="sm"
              className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
            >
              <Link href="/signup">Sign up</Link>
            </Button>
          </div>

          {/* Mobile hamburger */}
          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Open menu"
                  className="md:hidden"
                />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>

            <SheetContent side="right" className="flex w-72 flex-col p-0">
              {/* Drawer header with logo */}
              <SheetHeader className="border-b px-5 py-4">
                <SheetTitle className="flex items-center gap-2 text-lg font-bold">
                  <span className="flex size-7 items-center justify-center rounded-md bg-indigo-600 text-xs font-bold text-white">
                    T
                  </span>
                  Team<span className="text-indigo-600">Up</span>
                </SheetTitle>
              </SheetHeader>

              {/* Drawer nav links */}
              <nav
                aria-label="Mobile navigation"
                className="flex flex-col gap-1 p-4"
              >
                {NAV_LINKS.map(({ href, label, icon }) => (
                  <MobileNavLink
                    key={href}
                    href={href}
                    label={label}
                    icon={icon}
                    active={isActive(href, pathname)}
                  />
                ))}
              </nav>

              {/* Drawer auth buttons pinned to bottom */}
              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                <SheetClose
                  render={
                    <Link
                      href="/login"
                      className={cn(
                        "inline-flex h-8 w-full items-center justify-center rounded-lg border border-border",
                        "bg-background text-sm font-medium text-foreground",
                        "transition-colors hover:bg-muted"
                      )}
                    />
                  }
                >
                  Log in
                </SheetClose>

                <SheetClose
                  render={
                    <Link
                      href="/signup"
                      className="inline-flex h-8 w-full items-center justify-center rounded-lg bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
                    />
                  }
                >
                  Sign up free
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
