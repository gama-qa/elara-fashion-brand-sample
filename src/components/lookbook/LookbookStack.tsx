"use client";

import type Lenis from "lenis";
import { useLenis } from "lenis/react";
import { motion } from "motion/react";
import { useEffect } from "react";
import { Photo } from "@/components/media/Photo";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Label } from "@/components/ui/Label";
import { type Look, lookNumber } from "@/data/lookbook";
import { formatPrice } from "@/lib/format";
import { EASE_QUIET } from "@/lib/motion/easing";

/** Lenis reads this option on every wheel event, so it can be switched while running. */
function setWheelSmoothing(instance: Lenis, smooth: boolean): void {
  instance.options.smoothWheel = smooth;
}

/**
 * The lookbook without WebGL (phones, weak devices, reduced motion, and the
 * server render): the looks as a stack of full-screen photographs. Each
 * screen snaps into place and its photograph fades in as it arrives.
 */
export function LookbookStack({ looks }: { looks: Look[] }) {
  const lenis = useLenis();

  // Snap on the page scroller, only while this stack is on screen.
  useEffect(() => {
    const root = document.documentElement;
    const previous = root.style.scrollSnapType;
    root.style.scrollSnapType = "y proximity";
    return () => {
      root.style.scrollSnapType = previous;
    };
  }, []);

  // Smoothed wheel scrolling and CSS snap fight each other, so the wheel is
  // left native here. Touch scrolling is native already.
  useEffect(() => {
    if (!lenis) return;
    const previous = lenis.options.smoothWheel;
    setWheelSmoothing(lenis, false);
    return () => setWheelSmoothing(lenis, previous ?? true);
  }, [lenis]);

  return (
    <div>
      {looks.map((look, index) => (
        <section
          key={look.number}
          aria-label={`Look ${lookNumber(look.number)}`}
          className="relative z-10 flex h-svh snap-start flex-col bg-cream"
        >
          <motion.div
            data-reveal
            className="relative min-h-0 flex-1"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ amount: 0.35 }}
            transition={{ duration: 1.1, ease: EASE_QUIET }}
          >
            <Photo
              id={look.image}
              eager={index < 2}
              sizes="(min-width: 768px) 80vh, 100vw"
              className="h-full w-full object-cover md:object-contain"
            />
          </motion.div>
          <div className="flex min-h-14 items-center justify-between gap-4 border-t border-sand px-page">
            <Label tone="strong" className="tabular-nums">
              Look {lookNumber(look.number)} / {lookNumber(looks.length)}
            </Label>
            <span className="flex items-center gap-4">
              <AnimatedLink href={`/collection/${look.product.slug}`}>{look.product.name}</AnimatedLink>
              <Label className="hidden sm:inline">{formatPrice(look.product.price)}</Label>
            </span>
          </div>
        </section>
      ))}
    </div>
  );
}
