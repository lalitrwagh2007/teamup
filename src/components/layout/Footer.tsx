import Link from "next/link";

// ─── Link groups ──────────────────────────────────────────────────────────────

const QUICK_LINKS = [
  { label: "Explore Teams", href: "/teams" },
  { label: "Opportunities", href: "/opportunities" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

const PLATFORM_LINKS = [
  { label: "How it works", href: "/#how-it-works" },
  { label: "Create a Team", href: "/teams/create" },
  { label: "Find a Team", href: "/teams" },
  { label: "Leaderboard", href: "/leaderboard" },
];

const LEGAL_LINKS = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  { label: "Cookie Policy", href: "/cookies" },
];

const SOCIAL_LINKS = [
  { label: "X / Twitter", href: "https://twitter.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "GitHub", href: "https://github.com" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function FooterLinkGroup({
  heading,
  links,
}: {
  heading: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-xs font-semibold uppercase tracking-widest text-foreground">
        {heading}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {links.map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* ── Main grid ── */}
        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-4 lg:py-16">
          {/* Brand column */}
          <div className="flex flex-col gap-5 sm:col-span-2 lg:col-span-1">
            {/* Logo */}
            <Link
              href="/"
              className="flex w-fit items-center gap-2 text-xl font-bold tracking-tight"
              aria-label="TeamUp home"
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white">
                T
              </span>
              Team<span className="text-indigo-600">Up</span>
            </Link>

            {/* Description */}
            <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
              TeamUp is the team-finder platform for hackathons, competitions,
              volunteering, community projects, and student initiatives.
            </p>

            {/* Social links */}
            <div className="flex flex-wrap items-center gap-2">
              {SOCIAL_LINKS.map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600"
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <FooterLinkGroup heading="Quick links" links={QUICK_LINKS} />

          {/* Platform */}
          <FooterLinkGroup heading="Platform" links={PLATFORM_LINKS} />

          {/* Legal */}
          <FooterLinkGroup heading="Legal" links={LEGAL_LINKS} />
        </div>

        {/* ── Bottom bar ── */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border py-6 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            © {year} TeamUp. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with ❤️ for builders, makers &amp; changemakers.
          </p>
        </div>
      </div>
    </footer>
  );
}
