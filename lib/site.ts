export const siteUrl = "https://apmprep.netlify.app";
export const siteName = "APM PFQ Study Hub";
export const siteDescription = "An independent APM PFQ study companion with a guide-ordered roadmap, original lessons, topic quizzes and a lesson-unlocked question bank.";

export function publicPageMetadata(title: string, description: string, path: string) {
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { type: "website" as const, siteName, locale: "en_GB", images: [{ url: `${siteUrl}/opengraph-image`, width: 1200, height: 630, alt: siteName }], title: `${title} | ${siteName}`, description, url: path },
    twitter: { card: "summary_large_image" as const, images: [`${siteUrl}/twitter-image`], title: `${title} | ${siteName}`, description },
  };
}
