"use client";

import { useActionState } from "react";
import { changeEmail } from "@/app/account/actions";
import { INITIAL_AUTH_STATE } from "@/lib/auth/validation";
import styles from "@/app/sign-in/auth.module.css";

export function AccountForm() {
  const [state, action, pending] = useActionState(changeEmail, INITIAL_AUTH_STATE);

  return (
    <form action={action} className={styles.form}>
      <label htmlFor="new-email">New email address</label>
      <input id="new-email" type="email" name="email" autoComplete="email" maxLength={254} required disabled={pending} aria-describedby="email-change-help email-change-feedback" />
      <p id="email-change-help" className={styles.hint}>An email change is not complete until Supabase verifies it. Follow the confirmation instructions sent to the relevant addresses.</p>
      <p id="email-change-feedback" className={state.status === "error" ? styles.error : styles.feedback} role={state.status === "error" ? "alert" : "status"}>{state.message}</p>
      <button className={styles.primary} type="submit" disabled={pending}>{pending ? "Requesting change…" : "Request email change"}</button>
    </form>
  );
}
