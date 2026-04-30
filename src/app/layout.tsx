import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "dsrender — Design System Markdown Viewer",
  description:
    "Paste your design system markdown and see it rendered as visual tokens: color swatches, type specimens, spacing scales, shadow cards, and more.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body
        className={`${inter.variable} m-0 h-full font-[var(--font-inter),system-ui,sans-serif] overflow-hidden`}
      >
        {children}
      </body>
    </html>
  );
}
