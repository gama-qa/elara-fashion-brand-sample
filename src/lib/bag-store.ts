import { useSyncExternalStore } from "react";

/**
 * The shopping bag. Client-side only: a small external store kept in
 * localStorage so it survives a reload. There is no checkout in this sample;
 * the bag exists so quick-add has somewhere real to put things.
 */
export type BagLine = {
  slug: string;
  size: string;
  quantity: number;
};

const STORAGE_KEY = "elara-bag";
const EMPTY: BagLine[] = [];

let lines: BagLine[] = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load(): void {
  if (loaded) return;
  loaded = true;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = stored ? JSON.parse(stored) : [];
    if (Array.isArray(parsed)) {
      lines = parsed.filter(
        (line): line is BagLine =>
          typeof line?.slug === "string" && typeof line?.size === "string" && typeof line?.quantity === "number",
      );
    }
  } catch {
    // Private mode or corrupt data: start with an empty bag.
  }
}

function commit(next: BagLine[]): void {
  lines = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage unavailable: the bag still works for this visit.
  }
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void): () => void {
  // Read storage only once something on the client is listening, so the
  // server render and the first client render agree (both empty).
  const first = !loaded;
  load();
  listeners.add(listener);
  if (first && lines.length > 0) listener();
  return () => {
    listeners.delete(listener);
  };
}

export function addToBag(slug: string, size: string): void {
  load();
  const existing = lines.find((line) => line.slug === slug && line.size === size);
  commit(
    existing
      ? lines.map((line) => (line === existing ? { ...line, quantity: line.quantity + 1 } : line))
      : [...lines, { slug, size, quantity: 1 }],
  );
}

export function removeFromBag(slug: string, size: string): void {
  load();
  commit(lines.filter((line) => !(line.slug === slug && line.size === size)));
}

export function useBagLines(): BagLine[] {
  return useSyncExternalStore(subscribe, () => lines, () => EMPTY);
}

export function useBagCount(): number {
  return useBagLines().reduce((total, line) => total + line.quantity, 0);
}
