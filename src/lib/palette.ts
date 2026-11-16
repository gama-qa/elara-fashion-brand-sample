/**
 * Palette for code that can't read CSS variables (WebGL).
 * Mirrors the tokens in src/app/globals.css; change both together.
 */
export const palette = {
  cream: "#f4efe8",
  sand: "#e6ddd0",
  taupe: "#8a7b6a",
  taupeInk: "#6b5e50",
  espresso: "#2b2622",
  white: "#ffffff",
} as const;

/**
 * Surface colours for the 3D set, derived from the palette. Slightly darker
 * than cream so light and shadow can read on them.
 */
export const setPalette = {
  plaster: "#ece5db",
  plasterLight: "#efe9e1",
  travertine: "#e3d7c5",
  stone: "#d3c4af",
  /** Sky colour of the fill light: warm white. */
  fill: "#fffbf5",
} as const;
