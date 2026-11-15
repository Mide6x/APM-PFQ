import type { Metadata } from "next";
import { siteName, siteUrl, siteDescription } from "@/lib/site";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { CookieNotice } from "@/components/cookie-choices";

const montserrat = Montserrat({
  subsets: ["latin"],
  variable: "--font-montserrat",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  applicationName: siteName,
  openGraph: { type: "website", locale: "en_GB", siteName, title: siteName, description: siteDescription },
  twitter: { card: "summary_large_image", title: siteName, description: siteDescription },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-GB" className={montserrat.variable}>
      <body>
        <CookieNotice />
        {children}
      </body>
    </html>
  );
}
