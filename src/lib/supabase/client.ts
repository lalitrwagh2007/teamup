import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates a Supabase client for use in browser (Client Components).
 *
 * The browser client handles cookie persistence automatically via
 * document.cookie — no custom cookie methods needed.
 *
 * This is a singleton by default in @supabase/ssr, so calling it
 * multiple times returns the same instance.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
