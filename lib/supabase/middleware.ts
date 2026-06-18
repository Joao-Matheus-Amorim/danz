import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Refreshes the Supabase session from the request's cookies and returns the
 * session plus a response carrying any refreshed cookies. In mock mode
 * (no Supabase env vars) session is always null and middleware.ts no-ops.
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  if (!url || !anonKey) {
    return { response, session: null };
  }

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const { data } = await supabase.auth.getSession();

  return { response, session: data.session };
}
