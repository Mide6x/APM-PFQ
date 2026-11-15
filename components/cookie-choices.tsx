"use client";

import { useActionState, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { saveCookieChoice } from "@/app/cookies/actions";
import { COOKIE_CHOICE_NAME, parseCookieChoice, type CookieChoiceState } from "@/lib/cookie-preferences";
import styles from "./cookie-choices.module.css";

const initialState: CookieChoiceState = { status: "idle", message: "" };

export function CookieChoices() {
  const [state, action, pending] = useActionState(saveCookieChoice, initialState);
  useEffect(() => {
    if (state.status === "saved") window.location.reload();
  }, [state.status]);

  return (
    <form action={action}>
      <div className={styles.actions}>
        <button name="choice" value="allow" type="submit" disabled={pending}>Allow sign-in cookies</button>
        <button name="choice" value="block" type="submit" disabled={pending}>Browse without sign-in cookies</button>
      </div>
      <p role={state.status === "error" ? "alert" : "status"}>{pending ? "Saving your choice…" : state.message}</p>
    </form>
  );
}

export function CookieNotice() {
  const pathname = usePathname();
  const [choice, setChoice] = useState<"allow" | "block" | null>();
  useEffect(() => {
    const value = document.cookie.split("; ").find((item) => item.startsWith(`${COOKIE_CHOICE_NAME}=`))?.split("=")[1];
    setChoice(parseCookieChoice(value));
  }, [pathname]);
  if (choice !== null || pathname === "/cookies") return null;

  return (
    <aside className={styles.notice} aria-labelledby="cookie-notice-title">
      <div className={styles.inner}>
        <h2 id="cookie-notice-title">Your cookie choice</h2>
        <p>We use essential cookies for sign-in, security and remembering your choices. Opening or closing the quiz panel also saves that interface preference. We do not use analytics or marketing cookies.</p>
        <p>Browse without sign-in cookies to stay signed out on this device. Public study pages remain available.</p>
        <CookieChoices />
        <Link href="/cookies">Cookie settings and details</Link>
      </div>
    </aside>
  );
}
