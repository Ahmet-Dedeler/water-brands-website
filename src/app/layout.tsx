import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Water Brands Leaderboard",
    template: `%s | Water Brands Leaderboard`
  },
  description: "The healthiest bottled waters based on the latest science.",
  openGraph: {
    title: "Water Brands Leaderboard",
    description: "The healthiest bottled waters based on the latest science.",
    type: "website",
    locale: "en_US",
    url: "https://your-website-url.com", // Replace with your actual domain
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-[#FCFCF9]`}>{children}</body>
    </html>
  );
}
