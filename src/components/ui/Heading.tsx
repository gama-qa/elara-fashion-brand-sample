import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const sizes = {
  /** Wordmark-scale serif, once per page at most. */
  display: "font-serif font-light text-display tracking-display",
  /** Page and chapter titles. */
  title: "font-serif font-light text-title tracking-display",
  /** Section headings and short statements. */
  section: "font-serif font-light text-section",
  /** Catalog titles: large, tight sans. */
  catalog: "font-sans font-normal text-catalog tracking-catalog",
} as const;

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  /** Document outline level, independent of visual size. */
  level?: 1 | 2 | 3 | 4;
  size?: keyof typeof sizes;
};

export function Heading({ level = 2, size = "section", className, ...rest }: HeadingProps) {
  const Tag = `h${level}` as const;
  return <Tag className={cn(sizes[size], "text-balance", className)} {...rest} />;
}
