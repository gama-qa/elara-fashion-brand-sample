import { useSyncExternalStore } from "react";

/**
 * One query-string value as React state, with the URL as the source of truth.
 *
 * Why not `useSearchParams`: with Cache Components it suspends during
 * prerendering, which would drop everything that depends on it (here the whole
 * product grid) out of the static HTML. Reading `location` on the client keeps
 * the page fully prerendered; a deep link applies its filter right after
 * hydration.
 */
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener("popstate", listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("popstate", listener);
  };
}

function read(name: string): string {
  return new URLSearchParams(window.location.search).get(name) ?? "";
}

/** Returns the current value ("" when absent) and a setter that rewrites the URL in place. */
export function useUrlParam(name: string): [string, (value: string) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => read(name),
    () => "",
  );

  const setValue = (next: string) => {
    const url = new URL(window.location.href);
    if (next) url.searchParams.set(name, next);
    else url.searchParams.delete(name);
    // replaceState: a filter change is not a new page in the history.
    window.history.replaceState(window.history.state, "", url);
    for (const listener of listeners) listener();
  };

  return [value, setValue];
}
