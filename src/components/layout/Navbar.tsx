"use client";

import { useLenis } from "lenis/react";
import { AnimatePresence, motion } from "motion/react";
import Form from "next/form";
import Link from "next/link";
import { type ReactNode, useEffect, useId, useRef, useState } from "react";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { getProduct } from "@/data/products";
import { removeFromBag, useBagCount, useBagLines } from "@/lib/bag-store";
import { cn } from "@/lib/cn";
import { formatPrice } from "@/lib/format";
import { useSceneState } from "@/lib/scene-store";
import { site } from "@/lib/site";

type Panel = "search" | "bag" | "menu";

/**
 * Text wordmark centred; Collection, Lookbook, About on the left; Search and
 * Bag on the right. Transparent over a page's opening section, solid cream
 * once the page scrolls or a panel opens, so text never sits on moving content.
 */
export function Navbar() {
  const [panel, setPanel] = useState<Panel | null>(null);
  const scrolled = useSceneState((s) => s.scrolled);
  const tone = useSceneState((s) => s.headerTone);
  const lenis = useLenis();
  const bagCount = useBagCount();
  const ids = { search: useId(), bag: useId(), menu: useId() };

  const solid = tone === "solid" || scrolled || panel !== null;
  const toggle = (next: Panel) => setPanel((current) => (current === next ? null : next));
  const close = () => setPanel(null);

  useEffect(() => {
    if (!panel) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setPanel(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panel]);

  // The full-screen menu owns scrolling while it is open.
  useEffect(() => {
    if (panel !== "menu") return;
    const root = document.documentElement;
    const previous = root.style.overflow;
    lenis?.stop();
    root.style.overflow = "hidden";
    return () => {
      lenis?.start();
      root.style.overflow = previous;
    };
  }, [panel, lenis]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 border-b transition-colors duration-700 ease-quiet",
        solid ? "border-espresso/10 bg-page" : "border-transparent bg-transparent",
      )}
    >
      <div className="grid h-header grid-cols-[1fr_auto_1fr] items-center px-page">
        <div>
          <nav aria-label="Primary" className="hidden md:block">
            <ul className="flex gap-8">
              {site.nav.map((item) => (
                <li key={item.href}>
                  <AnimatedLink href={item.href} onClick={close}>
                    {item.label}
                  </AnimatedLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="md:hidden">
            <HeaderButton expanded={panel === "menu"} controls={ids.menu} onClick={() => toggle("menu")}>
              {panel === "menu" ? "Close" : "Menu"}
            </HeaderButton>
          </div>
        </div>

        <Link
          href="/"
          onClick={close}
          aria-label={`${site.name}, home`}
          className="font-serif text-[1.75rem] leading-none tracking-wordmark"
        >
          {site.name}
        </Link>

        <div className="flex justify-end gap-8">
          {/* Search lives in the menu on small screens. */}
          <div className="hidden md:block">
            <HeaderButton expanded={panel === "search"} controls={ids.search} onClick={() => toggle("search")}>
              Search
            </HeaderButton>
          </div>
          <HeaderButton
            expanded={panel === "bag"}
            controls={ids.bag}
            onClick={() => toggle("bag")}
          >
            Bag <span className="ml-1 tabular-nums">({bagCount})</span>
          </HeaderButton>
        </div>
      </div>

      <AnimatePresence initial={false}>
        {panel === "search" && (
          <HeaderPanel key="search" id={ids.search}>
            <SearchForm onSubmit={close} />
          </HeaderPanel>
        )}
        {panel === "bag" && (
          <HeaderPanel key="bag" id={ids.bag}>
            <BagContents onNavigate={close} />
          </HeaderPanel>
        )}
        {panel === "menu" && <MobileMenu key="menu" id={ids.menu} onNavigate={close} />}
      </AnimatePresence>
    </header>
  );
}

/** What is in the bag: one row per piece and size, with a total. No checkout in this sample. */
function BagContents({ onNavigate }: { onNavigate: () => void }) {
  const lines = useBagLines();
  const rows = lines.flatMap((line) => {
    const product = getProduct(line.slug);
    return product ? [{ ...line, product }] : [];
  });

  if (rows.length === 0) {
    return (
      <div className="mx-auto flex max-w-[44rem] flex-col items-start gap-8 md:flex-row md:items-center md:justify-between">
        <p className="font-serif text-section font-light">Your bag is empty.</p>
        <Button href="/collection" onClick={onNavigate}>
          View the collection
        </Button>
      </div>
    );
  }

  const total = rows.reduce((sum, row) => sum + row.product.price * row.quantity, 0);

  return (
    <div className="mx-auto max-w-[44rem]">
      <ul className="border-t border-sand">
        {rows.map((row) => (
          <li
            key={`${row.slug}-${row.size}`}
            className="grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 border-b border-sand py-4"
          >
            <Link href={`/collection/${row.slug}`} onClick={onNavigate} className="font-serif text-2xl font-light">
              {row.product.name}
            </Link>
            <span className="tabular-nums">{formatPrice(row.product.price * row.quantity)}</span>
            <Label>
              Size {row.size}
              {row.quantity > 1 ? `, ${row.quantity} pieces` : ""}
            </Label>
            <button
              type="button"
              onClick={() => removeFromBag(row.slug, row.size)}
              aria-label={`Remove ${row.product.name}, size ${row.size}`}
              className="justify-self-end font-sans text-label font-medium uppercase tracking-label text-taupe-ink hover:text-espresso"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex items-baseline justify-between">
        <Label tone="strong">Total</Label>
        <span className="text-lede tabular-nums">{formatPrice(total)}</span>
      </div>
    </div>
  );
}

/** Responsive visibility belongs on a wrapper, so it never fights `inline-flex`. */
function HeaderButton({
  children,
  expanded,
  controls,
  onClick,
}: {
  children: ReactNode;
  expanded: boolean;
  controls: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-controls={controls}
      onClick={onClick}
      className="inline-flex min-h-11 items-center font-sans text-label font-medium uppercase tracking-label"
    >
      {children}
    </button>
  );
}

/** Unfolds below the bar it belongs to, so the user keeps their place. */
function HeaderPanel({ id, children }: { id: string; children: ReactNode }) {
  return (
    <motion.div
      id={id}
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      className="overflow-hidden border-t border-espresso/10 bg-page"
    >
      <div className="px-page py-12 md:py-16">{children}</div>
    </motion.div>
  );
}

function SearchForm({ onSubmit }: { onSubmit: () => void }) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return (
    <Form action="/collection" onSubmit={onSubmit} role="search" className="mx-auto max-w-[44rem]">
      <label htmlFor={inputId} className="font-sans text-label font-medium uppercase tracking-label text-taupe-ink">
        Search the collection
      </label>
      <div className="mt-4 flex items-end gap-6 border-b border-taupe transition-colors duration-500 ease-quiet focus-within:border-espresso">
        <input
          ref={inputRef}
          id={inputId}
          name="q"
          type="search"
          autoComplete="off"
          placeholder="Cashmere, wrap coat, silk"
          className="w-full bg-transparent py-3 font-serif text-section font-light leading-tight outline-none placeholder:text-taupe"
        />
        <button
          type="submit"
          className="min-h-11 shrink-0 pb-3 font-sans text-label font-medium uppercase tracking-label"
        >
          Search
        </button>
      </div>
    </Form>
  );
}

function MobileMenu({ id, onNavigate }: { id: string; onNavigate: () => void }) {
  return (
    <motion.div
      id={id}
      data-lenis-prevent
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-x-0 bottom-0 top-header overflow-y-auto border-t border-espresso/10 bg-page px-page pb-12 md:hidden"
    >
      <nav aria-label="Menu">
        <ul className="flex flex-col gap-5 pt-12">
          {site.nav.map((item) => (
            <li key={item.href}>
              <Link href={item.href} onClick={onNavigate} className="font-serif text-title font-light">
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-16">
        <SearchForm onSubmit={onNavigate} />
      </div>
    </motion.div>
  );
}
