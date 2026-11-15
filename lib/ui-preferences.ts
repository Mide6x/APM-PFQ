export const CHECKPOINT_PANEL_COOKIE = "apm-checkpoint-panel";
export const CHECKPOINT_PANEL_MAX_AGE = 90 * 24 * 60 * 60;
export function checkpointPanelOpen(value: unknown) { return value === "open"; }
