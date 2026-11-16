import Image from "next/image";
import { getImage } from "@/lib/images";

type PhotoProps = {
  /** Id in src/data/image-manifest.json. */
  id: string;
  /** Rendered width per breakpoint, so the browser picks the right file. */
  sizes: string;
  /** Set for the one image that is the largest thing above the fold. */
  preload?: boolean;
  /** Set for other images visible without scrolling, so they are not lazy-loaded. */
  eager?: boolean;
  /** Hides the picture from assistive technology (a second view of something already described). */
  decorative?: boolean;
  className?: string;
};

/**
 * A photograph from the manifest: always a local file, always a DOM <img>,
 * never a WebGL texture. Size and alt text come from the manifest.
 */
export function Photo({
  id,
  sizes,
  preload = false,
  eager = false,
  decorative = false,
  className,
}: PhotoProps) {
  const image = getImage(id);
  return (
    <Image
      src={image.file}
      width={image.width}
      height={image.height}
      alt={decorative ? "" : image.alt}
      sizes={sizes}
      preload={preload}
      loading={eager && !preload ? "eager" : undefined}
      className={className}
    />
  );
}
