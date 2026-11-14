export const AUTH_COOKIE_NAME = "apm-auth";
export const RETRY_COOKIE_NAME = "apm-sign-in-retry-at";

export function authCookieOptions(name: string, value: string) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: value ? (name.endsWith("-code-verifier") ? 600 : 7 * 24 * 60 * 60) : 0,
  };
}

export function isSessionCookie(name: string) {
  return name === AUTH_COOKIE_NAME || name.startsWith(`${AUTH_COOKIE_NAME}.`);
}

export function isOwnedAuthCookie(name: string) {
  return isSessionCookie(name) || name.startsWith(`${AUTH_COOKIE_NAME}-`) || name === RETRY_COOKIE_NAME;
}
