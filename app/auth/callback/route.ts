import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createAuthClient } from "@/lib/auth/server";
import { RETRY_COOKIE_NAME } from "@/lib/auth/cookies";
import { safeReturnPath } from "@/lib/auth/validation";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const next = safeReturnPath(request.nextUrl.searchParams.get("next"));
  const client = await createAuthClient();
  if (code && code.length <= 4096 && client) {
    try {
      const { data, error } = await client.auth.exchangeCodeForSession(code);
      if (!error && data.session) {
        const { data: verified, error: verificationError } = await client.auth.getUser();
        if (!verificationError && verified.user?.email_confirmed_at && !verified.user.is_anonymous) {
          (await cookies()).delete(RETRY_COOKIE_NAME);
          return new NextResponse(null, { status: 303, headers: { Location: next, "Cache-Control": "private, no-store" } });
        }
      }
    } catch {
      // Expired, reused and wrong-browser links all return to a fresh sign-in request.
    }
  }
  return new NextResponse(null, { status: 303, headers: { Location: "/sign-in?error=link", "Cache-Control": "private, no-store" } });
}
