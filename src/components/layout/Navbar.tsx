"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, Users, Home, Briefcase, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { logoutAction } from "@/app/actions/auth";
import type { User as SupabaseUser } from "@supabase/supabase-js";

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

function getUserInitials(user: SupabaseUser): string {
  const fullName =
    user.user_metadata?.full_name ?? user.email ?? "";
  if (!fullName) return "U";
  const parts = fullName.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return fullName.slice(0, 2).toUpperCase();
}

function getUserDisplayName(user: SupabaseUser): string {
  return user.user_metadata?.full_name ?? user.email ?? "User";
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
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const supabase = createClient();

    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth state changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = () => {
    startTransition(async () => {
      const result = await logoutAction();
      if (result.success) {
        // Clear client-side session as well
        const supabase = createClient();
        await supabase.auth.signOut();
        setUser(null);
        router.push("/login");
        router.refresh();
      }
    });
  };

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

          {/* Desktop auth area */}
          <div className="hidden items-center gap-2 md:flex">
            {isLoading ? (
              /* Skeleton placeholder while checking auth */
              <div className="size-8 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              /* Logged-in: user dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      variant="ghost"
                      size="icon"
                      className="relative size-9 rounded-full"
                      aria-label="User menu"
                    />
                  }
                >
                  <span className="flex size-8 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                    {getUserInitials(user)}
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="truncate text-sm font-medium">
                      {getUserDisplayName(user)}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    render={<Link href="/dashboard" className="cursor-pointer" />}
                  >
                    <Home className="mr-2 size-4" />
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    render={<Link href="/profile" className="cursor-pointer" />}
                  >
                    <User className="mr-2 size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isPending}
                    variant="destructive"
                    className="cursor-pointer"
                  >
                    <LogOut className="mr-2 size-4" />
                    {isPending ? "Logging out…" : "Log out"}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              /* Logged-out: sign-in / sign-up buttons */
              <>
                <Button variant="ghost" size="sm">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                >
                  <Link href="/signup">Sign up</Link>
                </Button>
              </>
            )}
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

              {/* Drawer auth area pinned to bottom */}
              <div className="mt-auto flex flex-col gap-2 border-t p-4">
                {isLoading ? (
                  <div className="h-8 animate-pulse rounded-lg bg-muted" />
                ) : user ? (
                  <>
                    {/* User info */}
                    <div className="mb-1 flex items-center gap-3 px-1">
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {getUserInitials(user)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {getUserDisplayName(user)}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <SheetClose
                      render={
                        <Link
                          href="/dashboard"
                          className={cn(
                            "inline-flex h-8 w-full items-center justify-center rounded-lg border border-border",
                            "bg-background text-sm font-medium text-foreground",
                            "transition-colors hover:bg-muted"
                          )}
                        />
                      }
                    >
                      Dashboard
                    </SheetClose>

                    <button
                      type="button"
                      onClick={handleLogout}
                      disabled={isPending}
                      className={cn(
                        "inline-flex h-8 w-full items-center justify-center gap-2 rounded-lg",
                        "bg-red-50 text-sm font-medium text-red-600",
                        "transition-colors hover:bg-red-100",
                        "disabled:opacity-50"
                      )}
                    >
                      <LogOut className="size-4" />
                      {isPending ? "Logging out…" : "Log out"}
                    </button>
                  </>
                ) : (
                  <>
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
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
