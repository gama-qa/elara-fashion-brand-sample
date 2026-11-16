"use client";

import { useRef } from "react";
import { ProductTile } from "@/components/product/ProductTile";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import type { Product } from "@/data/products";
import { gsap, useGSAP } from "@/lib/motion/gsap";

/** Tuning for the pinned row. */
const row = {
  /** Seconds of smoothing between scroll and the row's movement. */
  scrub: 0.6,
  /** Extra vertical scroll per pixel of horizontal travel. 1 = the row moves as fast as the page would. */
  pace: 1,
};

/**
 * Other pieces to wear with this one, as a single row.
 *
 * On desktop the section pins under the header and vertical scroll moves the
 * row sideways until its last piece is in view, then the page carries on
 * (GSAP ScrollTrigger pin + scrub). This is the one place the site turns
 * vertical scroll into horizontal travel, on request; keep it to a short row.
 *
 * On phones, touch screens and under reduced motion nothing is pinned: the
 * row is an ordinary sideways-scrolling strip with snap points.
 */
export function CompleteTheLook({ products }: { products: Product[] }) {
  const section = useRef<HTMLElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useGSAP(() => {
    const sectionEl = section.current;
    const viewportEl = viewport.current;
    const trackEl = track.current;
    if (!sectionEl || !viewportEl || !trackEl) return;

    const media = gsap.matchMedia();
    media.add("(min-width: 768px) and (hover: hover) and (prefers-reduced-motion: no-preference)", () => {
      const distance = () => Math.max(0, trackEl.scrollWidth - viewportEl.clientWidth);
      const header = () => parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--spacing-header")) * 16 || 72;

      // Pinned mode owns the sideways movement, so the strip must not scroll by itself.
      gsap.set(viewportEl, { overflowX: "hidden" });
      gsap.to(trackEl, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: sectionEl,
          start: () => `top top+=${header()}`,
          end: () => `+=${distance() * row.pace}`,
          pin: true,
          scrub: row.scrub,
          invalidateOnRefresh: true,
          anticipatePin: 1,
        },
      });
    });
    return () => media.revert();
  });

  if (products.length === 0) return null;

  return (
    <section
      ref={section}
      aria-labelledby="complete-the-look"
      className="relative z-10 flex flex-col justify-center border-t border-sand bg-cream py-12 md:h-[calc(100svh-var(--spacing-header))] md:py-0"
    >
      <div className="flex items-end justify-between gap-6 px-page">
        <Heading id="complete-the-look" level={2} size="section">
          Complete the look
        </Heading>
        <Label className="hidden pb-2 md:block">{products.length} pieces</Label>
      </div>

      {/* scroll-px keeps the page margin when a tile snaps to the edge. */}
      <div ref={viewport} className="mt-8 snap-x scroll-px-page overflow-x-auto md:mt-10">
        <ul ref={track} className="flex w-max gap-4 px-page will-change-transform md:gap-6">
          {products.map((product) => (
            <li key={product.slug} className="w-[68vw] shrink-0 snap-start md:w-[44svh]">
              <ProductTile product={product} sizes="(min-width: 768px) 44vh, 68vw" />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
