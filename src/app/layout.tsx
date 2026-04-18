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
    <html lang="en" style={{ height: "100%" }} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined' && !window.matchMedia) {
                window.matchMedia = function() {
                  return { matches: false, media: '', addListener: function(){}, removeListener: function(){}, addEventListener: function(){}, removeEventListener: function(){}, dispatchEvent: function(){ return false; } };
                };
              }
              if (typeof window !== 'undefined' && window.matchMedia) {
                var mql = window.matchMedia('(max-width:0px)');
                if (mql && !mql.addListener) {
                  MediaQueryList.prototype.addListener = function(cb) { this.addEventListener('change', cb); };
                  MediaQueryList.prototype.removeListener = function(cb) { this.removeEventListener('change', cb); };
                }
              }
            `,
          }}
        />
      </head>
      <body
        className={inter.variable}
        style={{
          margin: 0,
          height: "100%",
          fontFamily: 'var(--font-inter), system-ui, sans-serif',
          overflow: "hidden",
        }}
      >
        {children}
      </body>
    </html>
  );
}
