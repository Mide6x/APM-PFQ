"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAuthClient, getViewer } from "@/lib/auth/server";
import { getStudyModule } from "@/lib/supabase";

export async function savePlace(form: FormData) {
  const slug = form.get("slug");
  if (typeof slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || slug.length > 200) return;
  const user = await getViewer();
  const destination = `/modules/${slug}`;
  if (!user) redirect(`/sign-in?next=${encodeURIComponent(destination)}`);
  const result = await getStudyModule(slug);
  if (result.status !== "ready") redirect(`${destination}?place=error`);
  const client = await createAuthClient();
  if (!client) redirect(`${destination}?place=error`);
  let failed = false;
  try {
    const { error } = await client.from("learner_progress").upsert({
      user_id: user.id, module_id: result.module.id, updated_at: new Date().toISOString(),
    }, { onConflict: "user_id" });
    failed = Boolean(error);
  } catch { failed = true; }
  if (failed) redirect(`${destination}?place=error`);
  revalidatePath("/");
  redirect(`${destination}?place=saved`);
}
