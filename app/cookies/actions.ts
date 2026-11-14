"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { endDeviceSession } from "@/lib/auth/server";
import { COOKIE_CHOICE_NAME, COOKIE_CHOICE_MAX_AGE, type CookieChoiceState } from "@/lib/cookie-preferences";

export async function saveCookieChoice(_previous: CookieChoiceState, form: FormData): Promise<CookieChoiceState> {
  const choice = form.get("choice");
  if (choice !== "allow" && choice !== "block") return { status: "error", message: "Choose whether to allow sign-in cookies." };
  if (choice === "block") await endDeviceSession();
  (await cookies()).set(COOKIE_CHOICE_NAME, `v1-${choice}`, {
    path: "/", maxAge: COOKIE_CHOICE_MAX_AGE, sameSite: "lax", secure: process.env.NODE_ENV === "production",
  });
  revalidatePath("/", "layout");
  return { status: "saved", message: "Cookie choice saved. Updating this page…" };
}
