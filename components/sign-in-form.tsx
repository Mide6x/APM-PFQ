"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { sendMagicLink } from "@/app/sign-in/actions";
import { INITIAL_AUTH_STATE } from "@/lib/auth/validation";
import { Turnstile } from "@/components/turnstile";
import styles from "@/app/sign-in/auth.module.css";

export function SignInForm({ next, siteKey }: { next: string; siteKey?: string }) {
  const [state, action, pending] = useActionState(sendMagicLink, INITIAL_AUTH_STATE);
  const [editingEmail, setEditingEmail] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaVersion, setCaptchaVersion] = useState(0);
  const [now, setNow] = useState(Date.now);

  useEffect(() => {
    if (!state.retryAt) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.retryAt]);

  const remaining = Math.max(0, Math.min(60, Math.ceil(((state.retryAt ?? 0) - now) / 1000)));
  const sent = state.status === "sent" && Boolean(state.email) && !editingEmail && !pending;

  function requestLink(formData: FormData) {
    setEditingEmail(false);
    setCaptchaToken("");
    setCaptchaVersion((version) => version + 1);
    action(formData);
  }

  return (
    <div className={styles.signIn}>
      <p className={state.status === "error" ? styles.error : styles.feedback} role={state.status === "error" ? "alert" : "status"}>{pending ? "Requesting a sign-in link…" : state.message}</p>
      {sent ? (
        <>
          <div className={styles.emailSummary}>
            <p>Link requested for <strong>{state.email}</strong>.</p>
            <button type="button" className={styles.textButton} onClick={() => { setEditingEmail(true); setCaptchaToken(""); setCaptchaVersion((version) => version + 1); }}>Use a different email</button>
          </div>
          <p className={styles.hint}>Open your email and follow the sign-in link in this same browser to continue.</p>
          <form action={requestLink} className={styles.resendForm}>
            <input type="hidden" name="email" value={state.email} />
            <input type="hidden" name="next" value={next} />
            <input type="hidden" name="captchaToken" value={captchaToken} />
            {siteKey && remaining === 0 && <Turnstile key={captchaVersion} siteKey={siteKey} onToken={setCaptchaToken} />}
            <button className={styles.secondary} type="submit" disabled={pending || remaining > 0 || Boolean(siteKey && !captchaToken)}>{remaining > 0 ? `Resend available in ${remaining}s` : "Send a new link"}</button>
            <p className={styles.hint}>Check your spam folder. Open the latest link in this browser. Links expire and can only be used once.</p>
          </form>
        </>
      ) : (
        <form action={requestLink} className={styles.form}>
          <input type="hidden" name="next" value={next} />
          <input type="hidden" name="captchaToken" value={captchaToken} />
          <label htmlFor="sign-in-email">Email address</label>
          <input id="sign-in-email" type="email" name="email" autoComplete="email" maxLength={254} defaultValue={state.email ?? ""} required disabled={pending} aria-describedby="email-help" />
          <p id="email-help" className={styles.hint}>We’ll use this email to sign you in and sync your study progress.</p>
          {siteKey && <Turnstile key={captchaVersion} siteKey={siteKey} onToken={setCaptchaToken} />}
          <button className={styles.primary} type="submit" disabled={pending || Boolean(siteKey && !captchaToken)}>{pending ? "Requesting link…" : "Send a sign-in link"}</button>
        </form>
      )}
      <p className={styles.privacyNote}>Your email is private. Read how we handle sign-in and your information in <Link href="/privacy">Privacy and your data</Link>.</p>
    </div>
  );
}
