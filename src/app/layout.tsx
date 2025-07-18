import { TempoInit } from "@/components/tempo-init";
import IPGuard from "@/components/IPGuard";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CMANS Case File Generator",
  description:
    "Cherokee Multi-Agency Narcotics Squad - Professional Case File PDF Generator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <IPGuard>
      <html lang="en" suppressHydrationWarning>
        <Script src="https://api.tempolabs.ai/proxy-asset?url=https://storage.googleapis.com/tempo-public-assets/error-handling.js" />
        <body className={`${inter.className} bg-black text-white`}>
          {children}
          <TempoInit />
        </body>
      </html>
    </IPGuard>
  );
}
