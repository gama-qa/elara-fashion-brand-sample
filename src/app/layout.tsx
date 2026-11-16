import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import "lenis/dist/lenis.css";
import "./globals.css";
import { Suspense } from "react";
import { Cursor } from "@/components/layout/Cursor";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { MotionProvider } from "@/lib/motion/MotionProvider";
import { ScrollSync } from "@/lib/motion/ScrollSync";
import { SmoothScroll } from "@/lib/motion/SmoothScroll";
import { palette } from "@/lib/palette";
import { site } from "@/lib/site";
import { SceneLayer } from "@/three/SceneLayer";

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${site.name}: ${site.tagline}`,
    template: `%s · ${site.name}`,
  },
  description: site.description,
};

export const viewport: Viewport = {
  themeColor: palette.cream,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${serif.variable} ${sans.variable}`}>
      <body>
        {/* Entrance animations start from a hidden state set inline by motion,
            and accordion panels start closed. Without JavaScript nothing would
            ever reveal or open, so undo both here. */}
        <noscript>
          <style>{`[data-reveal]{transform:none!important;clip-path:none!important;opacity:1!important}[data-accordion-panel]{height:auto!important;opacity:1!important}`}</style>
        </noscript>
        <a
          href="#main"
          className="fixed left-page top-3 z-50 -translate-y-24 bg-espresso px-4 py-3 font-sans text-label font-medium uppercase tracking-label text-cream focus:translate-y-0"
        >
          Skip to content
        </a>
        <MotionProvider>
          <SmoothScroll />
          <ScrollSync />
          <SceneLayer />
          <Navbar />
          <main id="main" className="relative z-10">
            {children}
          </main>
          <Footer />
          {/* Reads the pathname, which can suspend while a route's params are
              unknown, so it has its own boundary. It renders nothing at rest. */}
          <Suspense fallback={null}>
            <PageTransition />
          </Suspense>
          <Cursor />
        </MotionProvider>
      </body>
    </html>
  );
}
