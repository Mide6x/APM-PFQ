import "server-only";

import { cache } from "react";
import { createAuthClient, getViewer } from "@/lib/auth/server";
import type { StudyModule } from "@/lib/supabase";

export const getSavedPlace = cache(async (): Promise<
  | { status: "guest" | "empty" | "error" }
  | { status: "ready"; module: StudyModule }
> => {
  const user = await getViewer();
  if (!user) return { status: "guest" };
  const client = await createAuthClient();
  if (!client) return { status: "error" };
  try {
    const { data, error } = await client.from("learner_progress").select("module_id").eq("user_id", user.id).maybeSingle();
    if (error) return { status: "error" };
    if (!data) return { status: "empty" };
    const result = await client.from("study_modules")
      .select("id,slug,title,category,summary,duration_minutes,lesson_count,sort_order,guide_section,guide_page")
      .eq("id", data.module_id).eq("published", true).maybeSingle();
    if (result.error) return { status: "error" };
    return result.data ? { status: "ready", module: result.data as StudyModule } : { status: "empty" };
  } catch {
    return { status: "error" };
  }
});
