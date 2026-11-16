import { sceneConfig } from "@/three/config";
import { gsap } from "./motion/gsap";
import { sceneFrame, setSceneState } from "./scene-store";

/**
 * Registry of DOM sections that drive the scene. Positions are measured on
 * refresh (resize, content height change), not on every scroll frame.
 */

type SectionEntry = {
  el: HTMLElement;
  chapter: number | null;
  occludes: boolean;
  top: number;
  height: number;
};

const entries = new Set<SectionEntry>();

export type SceneSectionOptions = {
  chapter?: number | null;
  occludes?: boolean;
};

export function registerSceneSection(
  el: HTMLElement,
  { chapter = null, occludes = false }: SceneSectionOptions,
): () => void {
  const entry: SectionEntry = { el, chapter, occludes, top: 0, height: 0 };
  entries.add(entry);
  measureSceneSections();
  // A page arriving or leaving is a cut, not a move: no easing.
  syncSceneSections(window.scrollY, true);
  return () => {
    entries.delete(entry);
    syncSceneSections(window.scrollY, true);
  };
}

export function measureSceneSections(): void {
  const scrollY = window.scrollY;
  for (const entry of entries) {
    const rect = entry.el.getBoundingClientRect();
    entry.top = rect.top + scrollY;
    entry.height = rect.height;
  }
}

/**
 * Derives the chapter and occlusion from a scroll position.
 * `immediate` skips the scrub easing (first load, navigation, resize).
 */
export function syncSceneSections(scrollY: number, immediate = false): void {
  const viewport = window.innerHeight;
  let chapter: number | null = null;
  let firstChapter: number | null = null;
  let closestTop = -Infinity;
  let occluded = false;

  for (const entry of entries) {
    if (entry.chapter !== null) {
      if (firstChapter === null || entry.chapter < firstChapter) {
        firstChapter = entry.chapter;
      }
      if (entry.top <= scrollY + 1 && entry.top > closestTop) {
        closestTop = entry.top;
        const local = (scrollY - entry.top) / Math.max(entry.height, 1);
        chapter = entry.chapter + Math.min(Math.max(local, 0), 1);
      }
    }
    if (
      entry.occludes &&
      entry.top - scrollY <= 0 &&
      entry.top + entry.height - scrollY >= viewport
    ) {
      occluded = true;
    }
  }

  moveChapter(chapter ?? firstChapter ?? 0, immediate);
  setSceneState({ occluded });
}

let chapterTo: gsap.QuickToFunc | null = null;

/**
 * The scrub: the chapter the camera reads eases towards the scroll position
 * over `sceneConfig.scroll.scrub` seconds, the same way ScrollTrigger's
 * `scrub: <seconds>` smooths a timeline.
 */
function moveChapter(target: number, immediate: boolean): void {
  sceneFrame.chapterTarget = target;
  const scrub = sceneConfig.scroll.scrub;

  if (immediate || scrub <= 0) {
    gsap.killTweensOf(sceneFrame, "chapter");
    chapterTo = null;
    sceneFrame.chapter = target;
    return;
  }

  chapterTo ??= gsap.quickTo(sceneFrame, "chapter", { duration: scrub, ease: "power3.out" });
  chapterTo(target);
}
