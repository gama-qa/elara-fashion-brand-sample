import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/cn";

const styles = {
  /** Thin outline; the fill rises on hover. The default. */
  outline: {
    dark: {
      frame: "border-espresso text-espresso hover:text-cream focus-visible:text-cream",
      fill: "bg-espresso",
    },
    /** For use on photographs. */
    light: {
      frame: "border-white text-white hover:text-espresso focus-visible:text-espresso",
      fill: "bg-white",
    },
  },
  /** Filled from the start, for the one main action on a page (Add to bag). Hover empties it. */
  solid: {
    dark: {
      frame: "border-espresso bg-espresso text-cream hover:text-espresso focus-visible:text-espresso",
      fill: "bg-cream",
    },
    light: {
      frame: "border-white bg-white text-espresso hover:text-white focus-visible:text-white",
      fill: "bg-espresso",
    },
  },
} as const;

type Shared = {
  children: ReactNode;
  variant?: keyof typeof styles;
  tone?: "dark" | "light";
  className?: string;
};

type LinkOnlyProps = Omit<ComponentPropsWithoutRef<typeof Link>, keyof Shared> & {
  href: string;
};

type NativeOnlyProps = Omit<ComponentPropsWithoutRef<"button">, keyof Shared> & {
  href?: never;
};

export type ButtonProps = Shared & (LinkOnlyProps | NativeOnlyProps);

/**
 * 1px frame, square corners. On hover or keyboard focus a fill rises slowly
 * from the bottom edge: it confirms the target without a jump in layout or
 * colour. Pass `href` to render a link.
 */
export function Button({
  children,
  variant = "outline",
  tone = "dark",
  className,
  ...rest
}: ButtonProps) {
  const style = styles[variant][tone];

  const classes = cn(
    "group relative inline-flex h-12 min-w-44 items-center justify-center overflow-hidden border px-8",
    "font-sans text-label font-medium uppercase tracking-label",
    "transition-colors duration-700 ease-quiet",
    "disabled:pointer-events-none disabled:opacity-40",
    style.frame,
    className,
  );

  const content = (
    <>
      <span
        aria-hidden
        className={cn(
          "absolute inset-0 origin-bottom scale-y-0 transition-transform duration-700 ease-quiet",
          "group-hover:scale-y-100 group-focus-visible:scale-y-100",
          style.fill,
        )}
      />
      <span className="relative">{children}</span>
    </>
  );

  if (typeof rest.href === "string") {
    return (
      <Link className={classes} {...(rest as LinkOnlyProps)}>
        {content}
      </Link>
    );
  }

  const { type = "button", ...buttonProps } = rest as NativeOnlyProps;
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
