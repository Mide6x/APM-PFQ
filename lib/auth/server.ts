import "server-only";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { AUTH_COOKIE_NAME, authCookieOptions, isSessionCookie, isOwnedAuthCookie } from "./cookies";
import { COOKIE_CHOICE_NAME, parseCookieChoice } from "@/lib/cookie-preferences";

export const createAuthClient = cache(async () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  const store = await cookies();
  if (parseCookieChoice(store.get(COOKIE_CHOICE_NAME)?.value) === "block") return null;
  return createServerClient(url, key, {
    cookieOptions: { name: AUTH_COOKIE_NAME, ...authCookieOptions(AUTH_COOKIE_NAME, "session") },
    cookies: {
      getAll: () => store.getAll(),
      setAll(values) {
        try {
          values.forEach(({ name, value, options }) => store.set(name, value, { ...options, ...authCookieOptions(name, value) }));
        } catch {
          // Server Components cannot write cookies; middleware refreshes them before rendering.
        }
      },
    },
  });
});

export async function endDeviceSession() {
  const client = await createAuthClient();
  if (client) {
    try { await client.auth.signOut({ scope: "local" }); } catch { /* Clear this device even if the provider cannot be reached. */ }
  }
  const store = await cookies();
  store.getAll().forEach(({ name }) => {
    if (isOwnedAuthCookie(name)) store.set(name, "", authCookieOptions(name, ""));
  });
}

export const getViewer = cache(async () => {
  const store = await cookies();
  if (!store.getAll().some(({ name }) => isSessionCookie(name))) return null;
  const client = await createAuthClient();
  if (!client) return null;
  try {
    const { data, error } = await client.auth.getUser();
    return !error && data.user?.email && data.user.email_confirmed_at && !data.user.is_anonymous ? data.user : null;
  } catch {
    return null;
  }
});
