"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export function StudyStreak({ streak, serverNow, expiresAt }: { streak: number; serverNow: string; expiresAt: string | null }) {
  const [expired, setExpired] = useState(false);
  const router = useRouter();
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === "visible") router.refresh(); };
    document.addEventListener("visibilitychange", refresh);
    return () => document.removeEventListener("visibilitychange", refresh);
  }, [router]);
  useEffect(() => {
    setExpired(false);
    if (!expiresAt || !streak) return;
    // Measure from server time so changing a device clock cannot prolong this display.
    const remaining = Date.parse(expiresAt) - Date.parse(serverNow);
    const timer = window.setTimeout(() => setExpired(true), Math.max(0, remaining));
    return () => window.clearTimeout(timer);
  }, [expiresAt, serverNow, streak]);
  return <>
    <p><strong>{streak > 0 && !expired ? `${streak}-day study streak` : "No active streak"}</strong></p>
    <p>Complete a new lesson on each consecutive day to grow your streak. If you miss a day, your next completion starts a new streak at 1.</p>
    <p>Days follow UK time (Europe/London), including daylight saving changes. Each lesson counts only on its first completion; extra lessons on the same day don’t add streak days. Signing in and quiz attempts don’t count.</p>
  </>;
}
