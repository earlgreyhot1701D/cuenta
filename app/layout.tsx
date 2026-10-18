// Job: root HTML shell, fonts and global styles.
import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, EB_Garamond, Space_Grotesk } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import "@/styles/print.css";

const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

const DESCRIPTION = "Count, deliver, invoice, ledger for a wholesale bakery.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.APP_URL || "http://localhost:3000"),
  title: "Cuenta · La Condesa Baking Company",
  description: DESCRIPTION,
  robots: { index: false, follow: false },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
      { url: "/icon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Cuenta",
    description: DESCRIPTION,
    images: [{ url: "/og-image.png" }],
    type: "website",
  },
  twitter: { card: "summary_large_image", title: "Cuenta", description: DESCRIPTION, images: ["/og-image.png"] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#EFE6E1" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${garamond.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
