// Job: root HTML shell, fonts and global styles.
import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, EB_Garamond, Space_Grotesk } from "next/font/google";
import "@/styles/tokens.css";
import "@/styles/globals.css";
import "@/styles/print.css";

const bodoni = Bodoni_Moda({ subsets: ["latin"], variable: "--font-bodoni", display: "swap" });
const garamond = EB_Garamond({ subsets: ["latin"], variable: "--font-garamond", display: "swap" });
const grotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "Cuenta · La Condesa Baking Company",
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, themeColor: "#ffffff" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${bodoni.variable} ${garamond.variable} ${grotesk.variable}`}>
      <body>{children}</body>
    </html>
  );
}
