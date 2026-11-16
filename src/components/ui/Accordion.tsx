"use client";

import { motion } from "motion/react";
import { type ReactNode, useId, useState } from "react";
import { cn } from "@/lib/cn";
import { EASE_QUIET } from "@/lib/motion/easing";

export type AccordionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

type AccordionProps = {
  items: AccordionItem[];
  /** Id of the item open at first. Omit to start with all closed. */
  defaultOpen?: string;
  /** Heading level of the item titles, to fit the page outline. */
  headingLevel?: 2 | 3 | 4;
};

/**
 * Single-open accordion in the usual composition (item, trigger, panel), but
 * built here on motion instead of a headless library: 1px rules, a plus that
 * turns into a minus, and a panel that opens to its own height.
 *
 * Every panel stays in the document, so its text is in the static HTML. A
 * closed panel is `inert` (out of the tab order and hidden from assistive
 * technology). Without JavaScript all panels are shown open (see the
 * <noscript> rule in the root layout).
 */
export function Accordion({ items, defaultOpen, headingLevel = 3 }: AccordionProps) {
  const [open, setOpen] = useState<string | null>(defaultOpen ?? null);
  const base = useId();
  const Heading = `h${headingLevel}` as const;

  return (
    <div className="border-t border-sand">
      {items.map((item) => {
        const isOpen = open === item.id;
        const triggerId = `${base}-${item.id}-trigger`;
        const panelId = `${base}-${item.id}-panel`;

        return (
          <div key={item.id} className="border-b border-sand">
            <Heading>
              <button
                type="button"
                id={triggerId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : item.id)}
                className="flex min-h-13 w-full items-center justify-between gap-6 text-left font-sans text-label font-medium uppercase tracking-label"
              >
                {item.title}
                {/* Plus / minus drawn with two 1px lines; the upright one lies down when open. */}
                <span aria-hidden className="relative block h-2.5 w-2.5 shrink-0">
                  <span className="absolute left-0 top-1/2 h-px w-full bg-current" />
                  <span
                    className={cn(
                      "absolute left-0 top-1/2 h-px w-full bg-current transition-transform duration-500 ease-quiet",
                      isOpen ? "rotate-0" : "rotate-90",
                    )}
                  />
                </span>
              </button>
            </Heading>
            <motion.div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              data-accordion-panel
              inert={!isOpen}
              initial={false}
              animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
              transition={{ duration: 0.7, ease: EASE_QUIET }}
              className="overflow-hidden"
            >
              <div className="pb-7 pr-8">{item.content}</div>
            </motion.div>
          </div>
        );
      })}
    </div>
  );
}
