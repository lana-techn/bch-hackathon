import type { Metadata, Viewport } from "next";
import { Chakra_Petch, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { WalletProvider } from "@/components/wallet";

// Optimize fonts with display: swap
const chakraPetch = Chakra_Petch({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  preload: true,
  adjustFontFallback: true,
});

// Metadata
export const metadata: Metadata = {
  title: "IgniteBCH - Fair Launch Protocol on Bitcoin Cash",
  description:
    "Launch CashTokens instantly with bonding curve pricing. No presale, no team allocation, 100% safe liquidity. Fair launch on Bitcoin Cash.",
  keywords: ["Bitcoin Cash", "CashTokens", "bonding curve", "fair launch", "DEX", "DeFi"],
  authors: [{ name: "IgniteBCH" }],
  creator: "IgniteBCH",
  publisher: "IgniteBCH",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ignitebch.com",
    siteName: "IgniteBCH",
    title: "IgniteBCH - Fair Launch Protocol",
    description: "Launch CashTokens instantly with bonding curve pricing",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "IgniteBCH",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "IgniteBCH - Fair Launch Protocol",
    description: "Launch CashTokens instantly with bonding curve pricing",
    images: ["/og-image.png"],
  },
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://ignitebch.com",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#00FFA3",
  colorScheme: "dark",
};

// Loading component for Suspense
function MainLoading() {
  return (
    <div className="min-h-screen bg-void flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html 
      lang="en" 
      className="dark"
      suppressHydrationWarning
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <meta name="theme-color" content="#00FFA3" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="IgniteBCH" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body
        className={`${chakraPetch.variable} ${jetbrainsMono.variable} ${inter.variable} antialiased bg-void text-text min-h-screen`}
      >
        <WalletProvider>
          <Navbar />
          <Suspense fallback={<MainLoading />}>
            <main className="pt-16">{children}</main>
          </Suspense>
        </WalletProvider>
      </body>
    </html>
  );
}
