"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CHECKPOINT_PANEL_COOKIE, CHECKPOINT_PANEL_MAX_AGE } from "@/lib/ui-preferences";
import styles from "./checkpoint-performance.module.css";

export function CheckpointPanel({ initialOpen, children }: { initialOpen: boolean; children: React.ReactNode }) {
  const [open, setOpen] = useState(initialOpen);
  return <details id="checkpoint-performance" className={styles.panel} open={open} onToggle={event => {
    const next = event.currentTarget.open;
    if (next === open) return;
    setOpen(next);
    document.cookie = `${CHECKPOINT_PANEL_COOKIE}=${next ? "open" : "closed"}; Path=/; Max-Age=${CHECKPOINT_PANEL_MAX_AGE}; SameSite=Lax${location.protocol === "https:" ? "; Secure" : ""}`;
  }}>
    <summary className={styles.toggle}><h3>Quiz performance</h3><ChevronDown size={20} aria-hidden="true" /></summary>
    {children}
  </details>;
}
