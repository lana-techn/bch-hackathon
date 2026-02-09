import type { Metadata } from "next";
import { Chakra_Petch, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";

const chakraPetch = Chakra_Petch({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "IgniteBCH - Fair Launch Protocol on Bitcoin Cash",
  description:
    "Launch CashTokens instantly with bonding curve pricing. No presale, no team allocation, 100% safe liquidity. Fair launch on Bitcoin Cash.",
  keywords: ["Bitcoin Cash", "CashTokens", "bonding curve", "fair launch", "DEX", "DeFi"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${chakraPetch.variable} ${jetbrainsMono.variable} ${inter.variable} antialiased bg-void text-text min-h-screen`}
      >
        <Navbar />
        <main className="pt-16">{children}</main>
      </body>
    </html>
  );
}
