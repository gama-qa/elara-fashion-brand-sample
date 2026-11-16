import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const tones = {
  /** Secondary information. taupe-ink keeps AA contrast at this size. */
  muted: "text-taupe-ink",
  strong: "text-espresso",
  /** On photographs. */
  light: "text-white",
} as const;

type LabelProps = HTMLAttributes<HTMLElement> & {
  as?: "span" | "p" | "div";
  tone?: keyof typeof tones;
};

/** Small uppercase label with wide letter-spacing. */
export function Label({ as: Tag = "span", tone = "muted", className, ...rest }: LabelProps) {
  return (
    <Tag
      className={cn(
        "font-sans text-label font-medium uppercase tracking-label",
        tones[tone],
        className,
      )}
      {...rest}
    />
  );
}
