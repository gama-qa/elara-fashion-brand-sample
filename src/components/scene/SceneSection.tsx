"use client";

import { type HTMLAttributes, useLayoutEffect, useState } from "react";
import { registerSceneSection } from "@/lib/scene-sections";

type SceneSectionProps = HTMLAttributes<HTMLElement> & {
  as?: "section" | "div";
  /** Index into the page's camera shots. The shot is exact when this section's top meets the viewport top. */
  chapter?: number;
  /** Set when the section is opaque and can cover the whole viewport, so the canvas can pause. */
  occludes?: boolean;
};

/** A page section that drives the shared scene. Children can be server components. */
export function SceneSection({
  as: Tag = "section",
  chapter,
  occludes = false,
  children,
  ...rest
}: SceneSectionProps) {
  const [element, setElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!element) return;
    return registerSceneSection(element, { chapter: chapter ?? null, occludes });
  }, [element, chapter, occludes]);

  return (
    <Tag ref={setElement} {...rest}>
      {children}
    </Tag>
  );
}
