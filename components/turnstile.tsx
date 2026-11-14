"use client";

import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import styles from "@/app/sign-in/auth.module.css";

type TurnstileApi = {
  render: (element: HTMLElement, options: {
    sitekey: string;
    callback: (token: string) => void;
    "expired-callback": () => void;
    "error-callback": () => void;
    size: "flexible" | "compact";
  }) => string;
  remove: (id: string) => void;
};

export function Turnstile({ siteKey, onToken }: { siteKey: string; onToken: (token: string) => void }) {
  const container = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [message, setMessage] = useState("Loading security verification…");

  useEffect(() => {
    const api = (window as Window & { turnstile?: TurnstileApi }).turnstile;
    if (!ready || !api || !container.current) return;
    let id: string;
    try {
      id = api.render(container.current, {
        sitekey: siteKey,
        size: container.current.clientWidth < 300 ? "compact" : "flexible",
        callback: (token) => { onToken(token); setMessage("Security verification complete."); },
        "expired-callback": () => { onToken(""); setMessage("Security verification expired. Complete it again to continue."); },
        "error-callback": () => { onToken(""); setMessage("Security verification could not complete. Refresh the page and try again."); },
      });
    } catch {
      onToken("");
      setMessage("Security verification is unavailable. Refresh the page and try again.");
      return;
    }
    return () => api.remove(id);
  }, [ready, siteKey, onToken]);

  return (
    <div className={styles.captcha}>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onReady={() => setReady(true)} onError={() => { onToken(""); setMessage("Security verification could not load. Refresh the page and try again."); }} />
      <div ref={container} aria-label="Security verification" />
      <p className={styles.hint} role="status">{message}</p>
    </div>
  );
}
