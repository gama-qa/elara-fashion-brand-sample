"use client";

import { AnimatePresence, motion } from "motion/react";
import { useRef } from "react";
import { Label } from "@/components/ui/Label";
import { categories, type Category, type Product } from "@/data/products";
import { cn } from "@/lib/cn";
import { EASE_QUIET } from "@/lib/motion/easing";
import { useUrlParam } from "@/lib/url-param";
import { CatalogCard } from "./CatalogCard";
import { useScrollTilt } from "./useScrollTilt";

/** Columns on desktop; cards in a row enter one after another. */
const COLUMNS = 4;
/** Seconds for cards to slide to their new places when the filter changes. */
const REFLOW = 0.8;

function toCategory(param: string): Category | null {
  return categories.find((category) => category.toLowerCase() === param.toLowerCase()) ?? null;
}

/**
 * The catalog: a compact bar (title, count, category filter) that stays under
 * the header, then a dense, edge-to-edge grid. The filter lives in the URL
 * (`?category=knitwear`), so a filtered view can be linked.
 */
export function Catalog({ products }: { products: Product[] }) {
  const [param, setParam] = useUrlParam("category");
  const active = toCategory(param);
  const visible = active ? products.filter((product) => product.category === active) : products;
  const present = categories.filter((category) => products.some((product) => product.category === category));

  const grid = useRef<HTMLUListElement>(null);
  useScrollTilt(grid);

  return (
    <>
      <div className="sticky top-header z-30 border-b border-sand bg-cream">
        <div className="flex flex-col gap-x-10 gap-y-1 px-page py-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-baseline gap-4">
            <h1 className="font-sans text-xl font-normal tracking-tight">Collection</h1>
            <Label aria-live="polite">
              {visible.length} {visible.length === 1 ? "piece" : "pieces"}
            </Label>
          </div>

          <ul aria-label="Filter by category" className="-mx-1 flex gap-x-5 overflow-x-auto px-1 md:gap-x-7">
            <FilterButton label="All" active={active === null} onSelect={() => setParam("")} />
            {present.map((category) => (
              <FilterButton
                key={category}
                label={category}
                active={active === category}
                onSelect={() => setParam(category.toLowerCase())}
              />
            ))}
          </ul>
        </div>
      </div>

      <ul ref={grid} className="relative grid grid-cols-2 gap-x-px gap-y-7 pb-section md:grid-cols-4">
        {/* popLayout takes a leaving card out of the flow at once, so the
            others can start sliding to their new places while it fades. */}
        <AnimatePresence mode="popLayout" initial={false}>
          {visible.map((product, index) => (
            <motion.li
              key={product.slug}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{
                layout: { duration: REFLOW, ease: EASE_QUIET },
                opacity: { duration: 0.4, ease: EASE_QUIET },
              }}
            >
              <CatalogCard product={product} column={index % COLUMNS} eager={index < COLUMNS} />
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}

function FilterButton({
  label,
  active,
  onSelect,
}: {
  label: string;
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-pressed={active}
        onClick={onSelect}
        className={cn(
          "relative flex h-11 items-center whitespace-nowrap font-sans text-label font-medium uppercase tracking-label transition-colors duration-500 ease-quiet",
          active ? "text-espresso" : "text-taupe-ink hover:text-espresso",
        )}
      >
        {label}
        {active && (
          // One shared element: the rule slides from the old filter to the new.
          <motion.span
            layoutId="catalog-filter-rule"
            className="absolute inset-x-0 bottom-2.5 h-px bg-espresso"
            transition={{ duration: 0.6, ease: EASE_QUIET }}
          />
        )}
      </button>
    </li>
  );
}
