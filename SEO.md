# Search and sharing

The canonical production origin is `https://apmprep.netlify.app` in `lib/site.ts`. Update it before changing domains, along with the visible share-image URL and Supabase/Turnstile host configuration.

- Public roadmap, Questions listing and lessons have descriptive titles, descriptions, canonical links and social metadata. SVG favicon, Apple PNG icon and 1200×630 Open Graph/Twitter PNGs are generated from local code, with no external browser image service.
- `/sitemap.xml` lists the roadmap, Questions listing, privacy notice and only published canonical lesson URLs. It does not invent last-modified dates or list account/gated question routes.
- `/robots.txt` permits public crawling and discourages account/auth/sign-in crawling. Private account/sign-in and question-detail responses also carry noindex; robots files are not access controls. Auth, publication, prerequisites and RLS still enforce access.
- WebSite and LearningResource JSON-LD describe visible public content and identify APM Study as an independent publisher. Catalogue strings are escaped against script breakout. No email, progress, streak, score or locked question content is included.
- “GEO” is treated as discovery in AI-powered search: readable server-rendered public lessons, clear headings, accurate terminology, official source links and machine-readable metadata. There is no ranking/inclusion guarantee, fabricated accreditation/review score, or special crawler-only content.

Operator steps: verify the production property in Google Search Console (and Bing Webmaster Tools if used), submit `/sitemap.xml`, inspect representative URLs, and check indexing/share previews after deployment. No verification token is fabricated or installed. Confirm changes if a custom domain is introduced. Public metadata tests do not replace those external account checks.

References: [Google AI features](https://developers.google.com/search/docs/appearance/ai-features), [Google structured data](https://developers.google.com/search/docs/appearance/structured-data/intro-structured-data), [Next metadata conventions](https://nextjs.org/docs/app/api-reference/file-conventions/metadata).
