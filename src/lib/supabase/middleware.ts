import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

/**
 * Refreshes the Supabase auth session on every request by reading
 * cookies from the request and writing updated tokens to the response.
 *
 * This is the single most critical piece of the SSR auth setup —
 * without it, sessions expire silently after the access token's TTL.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet, headers) {
          // 1. Forward cookies to the request so downstream Server
          //    Components see the refreshed tokens immediately.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );

          // 2. Recreate the response so the request mutations above
          //    propagate to Server Components that read cookies().
          supabaseResponse = NextResponse.next({
            request,
          });

          // 3. Write cookies on the outgoing response so the browser
          //    stores the refreshed session.
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );

          // 4. Set cache-control headers from the Supabase SDK to
          //    prevent CDNs from caching responses with Set-Cookie.
          Object.entries(headers).forEach(([key, value]) =>
            supabaseResponse.headers.set(key, value)
          );
        },
      },
    }
  );

  // IMPORTANT: Do NOT call supabase.auth.getSession() here.
  // getUser() sends a request to the Supabase Auth server every time
  // to revalidate the token, which is exactly what we want in middleware.
  // getSession() only reads the JWT without validation.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // ── Protected routes ──────────────────────────────────────────────
  // Only these route prefixes require an authenticated session.
  // Everything else (/, /login, /signup, /forgot-password, /explore,
  // /teams, /teams/[id], /auth/callback, /onboarding, etc.) is public.
  const protectedPrefixes = [
    "/dashboard",
    "/profile",
    "/create-team",
    "/applications",
    "/notifications",
  ];

  const { pathname } = request.nextUrl;

  const isProtected =
    protectedPrefixes.some((prefix) => pathname.startsWith(prefix)) ||
    // /teams/[id]/workspace (but NOT /teams or /teams/[id])
    /^\/teams\/[^/]+\/workspace/.test(pathname);

  if (!user && isProtected) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}

