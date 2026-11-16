import type { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

const widths = {
  /** Edge to edge, page margin only. */
  full: "",
  /** Default content width. */
  wide: "max-w-[105rem]",
  /** Reading width for running text. */
  text: "max-w-[44rem]",
} as const;

type ContainerProps = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "header" | "footer" | "article" | "nav";
  width?: keyof typeof widths;
};

export function Container({
  as: Tag = "div",
  width = "wide",
  className,
  ...rest
}: ContainerProps) {
  return <Tag className={cn("mx-auto w-full px-page", widths[width], className)} {...rest} />;
}
