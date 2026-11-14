export type AuthFormState = {
  status: "idle" | "sent" | "error" | "success";
  message: string;
  email?: string;
  retryAt?: number;
};

export const INITIAL_AUTH_STATE: AuthFormState = { status: "idle", message: "" };

export function safeReturnPath(value: unknown) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f]/.test(value)) return "/";
  const url = new URL(value, "https://apm.invalid");
  if (url.origin !== "https://apm.invalid" || url.pathname.startsWith("//") || (url.pathname.startsWith("/sign-in") || url.pathname.startsWith("/auth/"))) return "/";
  return `${url.pathname}${url.search}${url.hash}`;
}

export function validEmail(value: unknown): value is string {
  return typeof value === "string" && value.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function hasRecentSignIn(methods: unknown, now = Date.now()) {
  if (!Array.isArray(methods)) return false;
  return methods.some((entry) => entry && (entry.method === "otp" || entry.method === "email/signup") &&
    typeof entry.timestamp === "number" && entry.timestamp <= now / 1000 && now / 1000 - entry.timestamp < 15 * 60);
}
