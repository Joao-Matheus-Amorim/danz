import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = ["/login"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.includes(pathname) || pathname.startsWith("/b/");
}

const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

function redirectPreservingCookies(url: URL, request: NextRequest, response: NextResponse) {
  const redirect = NextResponse.redirect(url);
  response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
  return redirect;
}

export async function middleware(request: NextRequest) {
  // Modo mock (sem env vars): nao ha sessao real para validar, mantem o
  // prototipo navegavel como hoje.
  if (!isSupabaseConfigured) return NextResponse.next();

  const { response, session } = await updateSession(request);
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    if (session && pathname === "/login") {
      // updateSession() pode ter refrescado o access/refresh token (ex.:
      // usuario com token expirado mas refresh token valido) e colocado os
      // novos Set-Cookie em `response`. Como os refresh tokens da Supabase
      // sao rotativos, descartar esses cookies aqui faria o browser manter
      // o token ja usado e perder a sessao na proxima passada do
      // middleware. Copia os cookies para o response de redirect antes de
      // retornar.
      return redirectPreservingCookies(new URL("/dashboard", request.url), request, response);
    }
    return response;
  }

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return redirectPreservingCookies(loginUrl, request, response);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/).*)"],
};
