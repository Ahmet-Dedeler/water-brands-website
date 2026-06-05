import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { siteUrl, waterCards } from "@/lib/data";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap" });

/** Tab icon — literal emoji rendered by the browser, not a custom SVG asset. */
const SITE_EMOJI = "🚰";
const emojiIcon = `data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">${SITE_EMOJI}</text></svg>`
)}`;

const siteDescription = `Compare ${waterCards.length.toLocaleString()} bottled, sparkling and gallon waters ranked by lab-tested purity, source quality, packaging and contaminants.`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Water Brands Leaderboard",
    template: `%s | Water Brands Leaderboard`,
  },
  description: siteDescription,
  icons: {
    icon: emojiIcon,
    apple: emojiIcon,
  },
  openGraph: {
    title: "Water Brands Leaderboard",
    description: siteDescription,
    type: "website",
    locale: "en_US",
    siteName: "Water Brands Leaderboard",
  },
  twitter: {
    card: "summary_large_image",
    title: "Water Brands Leaderboard",
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
