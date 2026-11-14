export const COOKIE_CHOICE_NAME = "apm-cookie-choice";
export const COOKIE_CHOICE_MAX_AGE = 90 * 24 * 60 * 60;

export function parseCookieChoice(value: unknown): "allow" | "block" | null {
  if (value === "v1-allow") return "allow";
  if (value === "v1-block") return "block";
  return null;
}

export type CookieChoiceState = { status: "idle" | "saved" | "error"; message: string };
