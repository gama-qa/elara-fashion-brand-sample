/**
 * Product data. Fibre, weight, origin and price are invented for this sample
 * brand; they describe ÉLARA's fictional garments, not the clothes that were
 * actually photographed (see public/images/CREDITS.md).
 */
/** In display order for the catalog filter. */
export const categories = ["Knitwear", "Shirts", "Dresses", "Robes"] as const;
export type Category = (typeof categories)[number];

export const sizes = ["XS", "S", "M", "L", "XL"] as const;
export type Size = (typeof sizes)[number];

export type Product = {
  /** URL segment under /collection. Never change one once published. */
  slug: string;
  name: string;
  category: Category;
  /** Whole euros. */
  price: number;
  colour: string;
  /** Colour of the swatch square next to the colour name. */
  swatch: string;
  composition: string;
  origin: string;
  /** Two or three sentences on cut, fabric and make. */
  summary: string;
  details: string[];
  care: string;
  /** Manifest ids. First is the main image, second shows on hover, the rest are further views. All of one garment. */
  images: [string, string, ...string[]];
  /** Sizes that are sold out. Every piece is cut in XS to XL. */
  soldOut: Size[];
  /** Shown on the home page. */
  featured: boolean;
};

export const products: Product[] = [
  {
    slug: "collared-knit-polo",
    name: "Collared Knit Polo",
    category: "Knitwear",
    price: 480,
    colour: "Oat",
    swatch: "#d9c8a9",
    composition: "70% merino wool, 30% cashmere",
    origin: "Knitted and linked in Italy",
    summary:
      "A polo knitted to shape from collar to hem, so there is no cut edge anywhere on it. The placket is left open, without buttons, and the side seams end in short vents.",
    details: ["12-gauge jersey, 310 g", "Open placket, no buttons", "6 cm side vents", "Ribbed cuffs and hem"],
    care: "Hand wash cold with wool detergent. Dry flat, away from heat.",
    images: ["collared-knit-polo-01", "collared-knit-polo-02", "collared-knit-polo-03"],
    soldOut: ["XL"],
    featured: true,
  },
  {
    slug: "ruffle-neck-sweater",
    name: "Ruffle-Neck Sweater",
    category: "Knitwear",
    price: 540,
    colour: "Ivory",
    swatch: "#f2ede1",
    composition: "100% cashmere",
    origin: "Knitted and linked in Italy",
    summary:
      "Two-ply cashmere, brushed once after washing so the surface lifts without pilling. The raglan shoulder is linked by hand and the neck is gathered into a short ruffle that stands on its own.",
    details: ["Two-ply yarn, 7-gauge", "Raglan sleeve, dropped cuff", "Hand-gathered standing neck", "Brushed finish"],
    care: "Hand wash cold with wool detergent. Dry flat, then steam lightly.",
    images: ["ruffle-neck-sweater-01", "ruffle-neck-sweater-02", "ruffle-neck-sweater-03"],
    soldOut: [],
    featured: true,
  },
  {
    slug: "sleeveless-silk-shirt",
    name: "Sleeveless Silk Shirt",
    category: "Shirts",
    price: 360,
    colour: "Chalk",
    swatch: "#f4f2ed",
    composition: "100% silk crêpe de Chine",
    origin: "Cut and sewn in Italy",
    summary:
      "Cut from sand-washed crêpe de Chine at 19 momme, so the silk is matte and falls close to the body. The armhole is bound, not faced, and every seam is a French seam.",
    details: ["19 momme silk, sand-washed", "Mother-of-pearl buttons", "French seams, bound armhole", "Curved hem, 4 cm longer at the back"],
    care: "Dry clean, or hand wash cold and press on the reverse while damp.",
    images: ["sleeveless-silk-shirt-01", "sleeveless-silk-shirt-02", "sleeveless-silk-shirt-03"],
    soldOut: ["XS"],
    featured: true,
  },
  {
    slug: "silk-slip-dress",
    name: "Silk Slip Dress",
    category: "Dresses",
    price: 480,
    colour: "Black",
    swatch: "#1d1b1a",
    composition: "100% silk crêpe-back satin",
    origin: "Cut and sewn in Italy",
    summary:
      "Cut on the bias from a single length of crêpe-back satin, so it follows the body without a dart or a zip. The neckline falls into a shallow cowl and the straps adjust at the back.",
    details: ["Bias cut, no darts", "Cowl neckline", "Adjustable straps", "Mid-calf length, hand-rolled hem"],
    care: "Dry clean. Hang to store, never fold.",
    images: ["silk-slip-dress-01", "silk-slip-dress-02"],
    soldOut: [],
    featured: false,
  },
  {
    slug: "raglan-pique-sweater",
    name: "Raglan Piqué Sweater",
    category: "Knitwear",
    price: 420,
    colour: "Oat",
    swatch: "#d9c8a9",
    composition: "60% cotton, 40% silk",
    origin: "Knitted and linked in Italy",
    summary:
      "A crew neck in a piqué stitch, which gives the surface a fine, dry grain. The raglan seams are fully fashioned: shaped on the needle and linked, not cut and sewn.",
    details: ["12-gauge piqué, 280 g", "Fully fashioned raglan", "Ribbed neck, cuffs and hem", "Matching trouser sold separately"],
    care: "Hand wash cold. Dry flat, away from heat.",
    images: ["hero-knit-set", "raglan-pique-sweater-02", "raglan-pique-sweater-03"],
    soldOut: ["XS", "S"],
    featured: false,
  },
  {
    slug: "gathered-silk-blouse",
    name: "Gathered Silk Blouse",
    category: "Shirts",
    price: 440,
    colour: "Rose taupe",
    swatch: "#cdb8b1",
    composition: "100% silk satin",
    origin: "Cut and sewn in Italy",
    summary:
      "Heavy silk satin at 22 momme, gathered into a narrow frilled neckband and again at the wrist. The hem is elasticated, so the blouse sits at the hip without tucking.",
    details: ["22 momme satin", "Shirred neckband and cuffs", "Raglan sleeve", "Elasticated hem"],
    care: "Dry clean, or hand wash cold and press on the reverse while damp.",
    images: ["gathered-silk-blouse-01", "gathered-silk-blouse-02", "gathered-silk-blouse-03"],
    soldOut: [],
    featured: false,
  },
  {
    slug: "smocked-silk-dress",
    name: "Smocked Silk Dress",
    category: "Dresses",
    price: 620,
    colour: "White",
    swatch: "#ffffff",
    composition: "100% silk habotai, cotton lace",
    origin: "Cut and sewn in Italy",
    summary:
      "A long, loose dress in washed habotai. The yoke is pintucked by hand and set with a band of cotton lace, and three mother-of-pearl buttons close the front.",
    details: ["16 momme habotai, washed", "Pintucked yoke with lace insert", "Mother-of-pearl buttons", "Full sleeve, gathered cuff"],
    care: "Hand wash cold. Press on the reverse while damp.",
    images: ["smocked-silk-dress-01", "smocked-silk-dress-02", "smocked-silk-dress-03"],
    soldOut: ["L", "XL"],
    featured: false,
  },
  {
    slug: "silk-wrap-robe",
    name: "Silk Wrap Robe",
    category: "Robes",
    price: 520,
    colour: "Shell",
    swatch: "#f0dccb",
    composition: "100% silk satin, corded lace",
    origin: "Cut and sewn in Italy",
    summary:
      "A knee-length wrap in 19 momme satin. The front edge and the split are finished with corded lace, sewn on flat so it lies against the skin without a ridge.",
    details: ["19 momme satin", "Corded lace edging", "Inner tie and outer belt", "Knee length"],
    care: "Dry clean, or hand wash cold. Do not wring.",
    images: ["silk-wrap-robe-01", "silk-wrap-robe-02"],
    soldOut: ["M"],
    featured: false,
  },
];

export const featuredProducts = products.filter((product) => product.featured);

/**
 * Other pieces to show under a product: those from other categories first
 * (something to wear with it), then the rest of its own category.
 */
export function completeTheLook(product: Product, limit = 6): Product[] {
  const others = products.filter((other) => other.slug !== product.slug);
  return [
    ...others.filter((other) => other.category !== product.category),
    ...others.filter((other) => other.category === product.category),
  ].slice(0, limit);
}

export function getProduct(slug: string): Product | undefined {
  return products.find((product) => product.slug === slug);
}
