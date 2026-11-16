import manifest from "@/data/image-manifest.json";

/**
 * Every image the site uses is a local file listed in
 * src/data/image-manifest.json. Components refer to images by id.
 */
export type ManifestImage = {
  id: string;
  /** Path under /public. */
  file: string;
  group: "products" | "lookbook" | "editorial" | "set";
  width: number;
  height: number;
  source: "unsplash" | "pexels" | "generated";
  sourcePage?: string;
  photographer?: string;
  photographerUrl?: string;
  license: string;
  alt: string;
  /** Id of the image this one was cropped from. */
  derivedFrom?: string;
  note?: string;
  checkedAt: string;
  usedBy: string[];
};

const images = manifest.images as ManifestImage[];

export function getImage(id: string): ManifestImage {
  const image = images.find((entry) => entry.id === id);
  if (!image) throw new Error(`Image "${id}" is not in src/data/image-manifest.json`);
  return image;
}
