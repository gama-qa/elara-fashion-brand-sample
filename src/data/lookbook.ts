import { getProduct, type Product } from "./products";

/**
 * The lookbook: one look per room of the corridor (`corridor.rooms` in
 * src/three/presets.ts must equal the number of looks). Each look shows one
 * piece; its photograph is that piece's main image.
 */
const order = [
  "collared-knit-polo",
  "silk-slip-dress",
  "ruffle-neck-sweater",
  "gathered-silk-blouse",
  "raglan-pique-sweater",
  "smocked-silk-dress",
  "sleeveless-silk-shirt",
  "silk-wrap-robe",
];

export type Look = {
  /** 1-based, shown as "Look 01". */
  number: number;
  /** Manifest id of the photograph. */
  image: string;
  product: Product;
};

export const looks: Look[] = order.flatMap((slug, index) => {
  const product = getProduct(slug);
  return product ? [{ number: index + 1, image: product.images[0], product }] : [];
});

/** 3 becomes "03". */
export function lookNumber(value: number): string {
  return String(value).padStart(2, "0");
}
