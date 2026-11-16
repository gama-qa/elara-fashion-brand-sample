import type { Metadata } from "next";
import { Catalog } from "@/components/collection/Catalog";
import { PageSetup } from "@/components/scene/PageSetup";
import { products } from "@/data/products";

export const metadata: Metadata = {
  title: "Collection",
  description: "Knitwear, shirts, dresses and robes in cashmere, wool and silk.",
};

// Catalog: no 3D (PageSetup without a scene), solid header, plain cream page.
export default function CollectionPage() {
  return (
    <>
      <PageSetup header="solid" />
      <div className="pt-header">
        <Catalog products={products} />
      </div>
    </>
  );
}
