import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl, waterCards } from "@/lib/data";
import { CONTENT_YEAR, SITE_NAME } from "@/lib/site";
import Footer from "@/components/Footer";
import { JsonLd, publisherLd } from "@/components/seo";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

// Icons come from the file conventions in this folder (favicon.ico, icon.svg,
// apple-icon.png). Google's result favicon needs a real file, not a data URI.

const homeTitle = `Best Bottled Water Brands (${CONTENT_YEAR}): Healthiest Waters Ranked`;
const siteDescription = `Which bottled water is healthiest? ${waterCards.length.toLocaleString()} bottled, sparkling and gallon waters ranked by lab-tested contaminants, microplastics, PFAS, source and packaging.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: homeTitle,
    template: `%s | ${SITE_NAME}`,
  },
  description: siteDescription,
  applicationName: SITE_NAME,
  openGraph: {
    title: homeTitle,
    description: siteDescription,
    type: "website",
    locale: "en_US",
    siteName: SITE_NAME,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: homeTitle,
    description: siteDescription,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
  verification: {
    // Search Console URL-prefix property (ahmetdedelerr@gmail.com). Not a secret.
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ?? "Yeh-Teb81lQcVqx2IzkAeatFzBpEUpogctbYz_XnPs4",
    other: process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION
      ? { "msvalidate.01": process.env.NEXT_PUBLIC_BING_SITE_VERIFICATION }
      : undefined,
  },
};

export const viewport: Viewport = {
  themeColor: "#0284c7",
};

const siteLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: siteDescription,
    publisher: publisherLd,
  },
  { "@context": "https://schema.org", ...publisherLd },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <JsonLd data={siteLd} />
        {children}
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
