import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./styles/globals.css";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "Modular — Build exactly what you need",
    template: "%s | Modular",
  },
  description:
    "Premium modular products for creators — configurable desks, PCs, camera rigs and shelving.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Modular — Build exactly what you need",
    description:
      "Premium modular products for creators — configurable desks, PCs, camera rigs and shelving.",
    url: siteUrl,
    siteName: "Modular",
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "Modular — configurable products",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Modular — Build exactly what you need",
    description:
      "Premium modular products for creators — configurable desks, PCs, camera rigs and shelving.",
    creator: "@modular",
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
    shortcut: "/favicon-32x32.png",
  },
  // viewport should be exported using the viewport API where needed
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <main>{children}</main>
      </body>
    </html>
  );
}
