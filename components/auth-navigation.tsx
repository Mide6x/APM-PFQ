import Link from "next/link";
import { getViewer } from "@/lib/auth/server";
import { safeReturnPath } from "@/lib/auth/validation";

export async function AuthNavigation({ next = "/" }: { next?: string }) {
  const user = await getViewer();
  return user
    ? <Link className="nav-link" href="/account">Your account</Link>
    : <Link className="nav-link" href={`/sign-in?next=${encodeURIComponent(safeReturnPath(next))}`}>Sign in</Link>;
}
