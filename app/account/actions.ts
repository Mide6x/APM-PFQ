"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAuthClient, getViewer } from "@/lib/auth/server";
import { authCookieOptions, isOwnedAuthCookie } from "@/lib/auth/cookies";
import { hasRecentSignIn, validEmail, type AuthFormState } from "@/lib/auth/validation";

export async function changeEmail(_previous: AuthFormState, form: FormData): Promise<AuthFormState> {
  const user = await getViewer();
  if (!user) redirect("/sign-in?next=/account");
  const email = form.get("email");
  if (!validEmail(email)) return { status: "error", message: "Enter a valid email address." };
  const client = await createAuthClient();
  if (!client) return { status: "error", message: "Account changes are temporarily unavailable." };
  const verified = await client.auth.getClaims().catch(() => null);
  if (!verified || verified.error || verified.data?.claims.sub !== user.id || !hasRecentSignIn(verified.data.claims.amr)) redirect("/sign-in?reauth=1&next=/account");
  try {
    const { error } = await client.auth.updateUser({ email });
    if (error) return { status: "error", message: "We could not request that change. Check the address and try again later." };
  } catch {
    return { status: "error", message: "We could not request that change. Please try again later." };
  }
  return { status: "success", message: "Check your email for the confirmation steps. Your sign-in address changes only after Supabase confirms it." };
}

export async function signOut() {
  const client = await createAuthClient();
  if (client) {
    try { await client.auth.signOut({ scope: "local" }); } catch { /* Clear this device even if the provider cannot be reached. */ }
  }
  const store = await cookies();
  store.getAll().forEach(({ name }) => {
    if (isOwnedAuthCookie(name)) store.set(name, "", authCookieOptions(name, ""));
  });
  redirect("/");
}
