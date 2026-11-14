import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  AUTH_COOKIE_NAME,
  authCookieOptions,
  isSessionCookie,
} from "@/lib/auth/cookies";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (
    url &&
    key &&
    request.cookies.getAll().some(({ name }) => isSessionCookie(name))
  ) {
    const client = createServerClient(url, key, {
      cookieOptions: {
        name: AUTH_COOKIE_NAME,
        ...authCookieOptions(AUTH_COOKIE_NAME, "session"),
      },
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll(values, headers) {
          values.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          values.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, {
              ...options,
              ...authCookieOptions(name, value),
            }),
          );
          Object.entries(headers).forEach(([name, value]) =>
            response.headers.set(name, value),
          );
        },
      },
    });
    try {
      await client.auth.getUser();
    } catch {
      // Protected pages and actions independently verify identity and fail closed.
    }
  }
  response.headers.set("Cache-Control", "private, no-store, max-age=0");
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");
  return response;
}

export const config = {
  matcher: ["/", "/modules/:path*", "/sign-in", "/auth/:path*", "/account/:path*"],
};
