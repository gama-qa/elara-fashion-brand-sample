"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Photo } from "@/components/media/Photo";
import { Label } from "@/components/ui/Label";
import { type Product, type Size, sizes } from "@/data/products";
import { addToBag } from "@/lib/bag-store";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { EASE_QUIET } from "@/lib/motion/easing";
import { tilt } from "./useScrollTilt";

/** Entrance of a card when it scrolls into view. */
const reveal = {
  /** Pixels the card rises. */
  rise: 28,
  /** Seconds the rise takes. */
  duration: 1,
  /** Seconds between neighbouring cards in a row. */
  stagger: 0.09,
};

type CatalogCardProps = {
  product: Product;
  /** Position in its row, 0-based: sets the entrance delay. */
  column: number;
  /** Set for cards visible without scrolling. */
  eager?: boolean;
};

/**
 * One product in the catalog grid.
 *
 * - The photograph and the name are links to the product page.
 * - Hover (or keyboard focus inside the card) fades to the second photograph
 *   and brings up the size row; choosing a size adds that piece to the bag.
 *   The size row is a sibling of the link, not inside it, so the buttons are
 *   valid and separately focusable.
 * - The card leans a fraction of a degree with scroll speed (`--scroll-v`,
 *   set on the grid by useScrollTilt) and comes back to rest when scrolling
 *   stops.
 */
export function CatalogCard({ product, column, eager = false }: CatalogCardProps) {
  const [primary, secondary] = product.images;
  const href = `/collection/${product.slug}`;

  return (
    <div
      className="will-change-transform"
      style={{
        transform: `perspective(1200px) rotateX(calc(var(--scroll-v, 0) * ${tilt.rotate}deg)) skewY(calc(var(--scroll-v, 0) * ${tilt.skew}deg))`,
      }}
    >
      <motion.article
        data-reveal
        initial={{ opacity: 0, y: reveal.rise }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.15 }}
        transition={{ duration: reveal.duration, delay: column * reveal.stagger, ease: EASE_QUIET }}
      >
        <div className="group relative">
          <Link href={href} data-cursor="view" className="relative block aspect-[3/4] overflow-hidden bg-sand">
            <Photo
              id={primary}
              eager={eager}
              sizes="(min-width: 768px) 25vw, 50vw"
              className="h-full w-full object-cover"
            />
            <Photo
              id={secondary}
              decorative
              sizes="(min-width: 768px) 25vw, 50vw"
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-quiet group-focus-within:opacity-100 group-hover:opacity-100"
            />
          </Link>
          <QuickAdd product={product} />
        </div>

        <div className="flex items-baseline justify-between gap-3 px-3 pb-1 pt-3 md:px-4">
          {/* Block with the label's own size, so a wrapped name keeps tight lines. */}
          <Link href={href} className="block text-label">
            <Label tone="strong">{product.name}</Label>
          </Link>
          <Label className="shrink-0">{formatPrice(product.price)}</Label>
        </div>
      </motion.article>
    </div>
  );
}

/**
 * Size row over the foot of the photograph. Hidden until the card is hovered
 * or holds keyboard focus; never shown on touch screens, where a tap goes to
 * the product page.
 */
function QuickAdd({ product }: { product: Product }) {
  const [added, setAdded] = useState<Size | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const add = (size: Size) => {
    addToBag(product.slug, size);
    setAdded(size);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setAdded(null), 1800);
  };

  return (
    <div
      className={cn(
        "absolute inset-x-0 bottom-0 flex h-11 items-center justify-between gap-2 border-t border-sand bg-cream px-3 md:px-4",
        "pointer-events-none translate-y-2 opacity-0 transition duration-500 ease-quiet",
        "group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100",
        "group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      <Label aria-live="polite" tone={added ? "strong" : "muted"}>
        {added ? `Added, size ${added}` : "Add"}
      </Label>
      <ul className="flex" aria-label={`Add ${product.name} to the bag, choose a size`}>
        {sizes.map((size) => {
          const soldOut = product.soldOut.includes(size);
          return (
            <li key={size}>
              <button
                type="button"
                disabled={soldOut}
                onClick={() => add(size)}
                aria-label={soldOut ? `Size ${size}, sold out` : `Add size ${size}`}
                className={cn(
                  "h-11 min-w-8 px-1.5 font-sans text-label font-medium uppercase tracking-label",
                  soldOut ? "text-taupe line-through" : "text-espresso",
                )}
              >
                {size}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
