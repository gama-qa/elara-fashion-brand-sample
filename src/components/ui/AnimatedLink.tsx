import Link from "next/link";
import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/cn";

type AnimatedLinkProps = Omit<ComponentPropsWithoutRef<typeof Link>, "className"> & {
  /** `label`: small uppercase UI link. `inline`: inherits the surrounding type. */
  variant?: "label" | "inline";
  /** Marks the current page and keeps the rule visible. */
  current?: boolean;
  className?: string;
};

/**
 * Text link with a 1px rule. On hover the rule draws in from the left and
 * leaves to the right, showing the link is live and which way it reads.
 */
export function AnimatedLink({
  variant = "label",
  current = false,
  className,
  children,
  ...rest
}: AnimatedLinkProps) {
  return (
    <Link
      aria-current={current ? "page" : undefined}
      className={cn(
        "group inline-flex items-center",
        variant === "label" && "min-h-11 font-sans text-label font-medium uppercase tracking-label",
        className,
      )}
      {...rest}
    >
      <span className="relative pb-1">
        {children}
        <span
          aria-hidden
          className={cn(
            "absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-700 ease-quiet",
            current
              ? "scale-x-100"
              : "origin-right scale-x-0 group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100",
          )}
        />
      </span>
    </Link>
  );
}
