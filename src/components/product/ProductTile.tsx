import Link from "next/link";
import { Parallax } from "@/components/media/Parallax";
import { Photo } from "@/components/media/Photo";
import { Label } from "@/components/ui/Label";
import type { Product } from "@/data/products";
import { formatPrice } from "@/lib/format";

type ProductTileProps = {
  product: Product;
  /** Rendered width per breakpoint for the photographs. */
  sizes: string;
  /**
   * How far the photograph slides inside its frame as the tile scrolls past,
   * as a fraction of the frame height. 0 keeps it still (dense catalog grids).
   */
  parallax?: number;
  /** Set for tiles visible without scrolling. */
  eager?: boolean;
};

/**
 * One product: photograph, name and price, all a single link to its page.
 * On hover or keyboard focus the second photograph (a closer view of the same
 * garment) fades in over the first.
 */
export function ProductTile({ product, sizes, parallax = 0, eager = false }: ProductTileProps) {
  const [primary, secondary] = product.images;

  const photographs = (
    <>
      <Photo id={primary} sizes={sizes} eager={eager} className="h-full w-full object-cover" />
      <Photo
        id={secondary}
        sizes={sizes}
        decorative
        className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-700 ease-quiet group-hover:opacity-100 group-focus-visible:opacity-100"
      />
    </>
  );

  return (
    <Link href={`/collection/${product.slug}`} data-cursor="view" className="group block">
      {parallax > 0 ? (
        <Parallax inside amount={parallax} className="aspect-[4/5] bg-sand">
          {photographs}
        </Parallax>
      ) : (
        <div className="relative aspect-[4/5] overflow-hidden bg-sand">{photographs}</div>
      )}
      <div className="mt-4 flex items-baseline justify-between gap-6">
        <Label tone="strong">{product.name}</Label>
        <Label>{formatPrice(product.price)}</Label>
      </div>
    </Link>
  );
}
