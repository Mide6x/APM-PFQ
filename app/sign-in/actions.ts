"use server";

import { headers, cookies } from "next/headers";
import { createAuthClient } from "@/lib/auth/server";
import { authCookieOptions, RETRY_COOKIE_NAME } from "@/lib/auth/cookies";
import { COOKIE_CHOICE_NAME, parseCookieChoice } from "@/lib/cookie-preferences";
import {
  safeReturnPath,
  validEmail,
  type AuthFormState,
} from "@/lib/auth/validation";

export async function sendMagicLink(
  _previous: AuthFormState,
  form: FormData,
): Promise<AuthFormState> {
  const store = await cookies();
  if (parseCookieChoice(store.get(COOKIE_CHOICE_NAME)?.value) !== "allow") {
    return { status: "error", message: "Allow sign-in cookies in Cookie settings before signing in." };
  }
  const email = form.get("email");
  if (!validEmail(email))
    return { status: "error", message: "Enter a valid email address." };
  const requestHeaders = await headers();
  const origin = requestHeaders.get("origin");
  if (
    !origin ||
    !URL.canParse(origin) ||
    !/^https?:$/.test(new URL(origin).protocol) ||
    new URL(origin).host !==
      (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host"))
  ) {
    return {
      status: "error",
      message: "We could not start sign-in. Reload this page and try again.",
    };
  }
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("next", safeReturnPath(form.get("next")));
  const token = form.get("captchaToken");
  if (
    (process.env.NODE_ENV === "production" &&
      !process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) ||
    (process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY &&
      (typeof token !== "string" || !token || token.length > 2048))
  ) {
    return {
      status: "error",
      message:
        "The security check is unavailable or incomplete. Please try again.",
    };
  }
  const client = await createAuthClient();
  if (!client)
    return {
      status: "error",
      message: "Sign-in is being set up. Please try again later.",
    };
  const now = Date.now();
  const savedRetry = Number(store.get(RETRY_COOKIE_NAME)?.value);
  const retryAt =
    savedRetry > now && savedRetry <= now + 60_000 ? savedRetry : now + 60_000;
  if (!(savedRetry > now && savedRetry <= now + 60_000)) {
    try {
      const { error } = await client.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: callback.toString(),
          ...(typeof token === "string" && token
            ? { captchaToken: token }
            : {}),
        },
      });
      if (error?.code === "captcha_failed")
        return {
          status: "error",
          message:
            "Security verification failed. Complete the check again and retry.",
        };
    } catch {
      // Keep delivery responses neutral, including provider and rate-limit failures.
    }
    store.set(RETRY_COOKIE_NAME, String(retryAt), {
      ...authCookieOptions(RETRY_COOKIE_NAME, "retry"),
      maxAge: 60,
    });
  }
  return {
    status: "sent",
    email,
    retryAt,
    message:
      "If this address can receive a sign-in link, it will arrive shortly. Check your inbox and spam folder.",
  };
}
