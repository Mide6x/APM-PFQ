import "server-only";

import { createClient } from "@supabase/supabase-js";

export type StudyModule = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  duration_minutes: number;
  lesson_count: number;
  sort_order: number;
};

export type ModuleResult =
  | { status: "not-configured"; modules: [] }
  | { status: "error"; modules: []; message: string }
  | { status: "empty"; modules: [] }
  | { status: "ready"; modules: StudyModule[] };

export type ModuleDetailResult =
  | { status: "not-configured" }
  | { status: "error" }
  | { status: "missing" }
  | { status: "ready"; module: StudyModule };

function createSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getStudyModules(): Promise<ModuleResult> {
  const supabase = createSupabase();
  if (!supabase) return { status: "not-configured", modules: [] };

  try {
    const { data, error } = await supabase
      .from("study_modules")
      .select("id, slug, title, category, summary, duration_minutes, lesson_count, sort_order")
      .eq("published", true)
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Could not load study modules:", error.message);
      return {
        status: "error",
        modules: [],
        message: "We couldn’t load the study library just now. Please try again later.",
      };
    }

    if (!data?.length) return { status: "empty", modules: [] };
    return { status: "ready", modules: data as StudyModule[] };
  } catch (error) {
    console.error("Could not connect to Supabase:", error);
    return {
      status: "error",
      modules: [],
      message: "We couldn’t connect to the study library. Check your Supabase configuration.",
    };
  }
}

export async function getStudyModule(slug: string): Promise<ModuleDetailResult> {
  const supabase = createSupabase();
  if (!supabase) return { status: "not-configured" };

  try {
    const { data, error } = await supabase
      .from("study_modules")
      .select("id, slug, title, category, summary, duration_minutes, lesson_count, sort_order")
      .eq("published", true)
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      console.error("Could not load study module:", error.message);
      return { status: "error" };
    }
    return data ? { status: "ready", module: data as StudyModule } : { status: "missing" };
  } catch (error) {
    console.error("Could not connect to Supabase:", error);
    return { status: "error" };
  }
}
