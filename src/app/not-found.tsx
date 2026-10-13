import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">404</h1>
        <p className="mt-2 text-muted-foreground">Page not found.</p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </main>
  );
}