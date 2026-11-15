import type { MetadataRoute } from "next";
import { getStudyModules } from "@/lib/supabase";
import { siteUrl } from "@/lib/site";
export const revalidate = 3600;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const modules = await getStudyModules();
  const paths = [
    "/",
    "/questions",
    "/privacy",
    ...(modules.status === "ready"
      ? modules.modules.map((topic) => `/modules/${topic.slug}`)
      : []),
  ];
  return paths.map((path) => ({ url: `${siteUrl}${path}` }));
}
