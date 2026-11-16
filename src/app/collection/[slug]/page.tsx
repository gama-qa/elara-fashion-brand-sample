import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CompleteTheLook } from "@/components/product/CompleteTheLook";
import { ProductGallery } from "@/components/product/ProductGallery";
import { PurchasePanel } from "@/components/product/PurchasePanel";
import { StickyPanel } from "@/components/product/StickyPanel";
import { PageSetup } from "@/components/scene/PageSetup";
import { Accordion } from "@/components/ui/Accordion";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { completeTheLook, getProduct, products } from "@/data/products";
import { formatPrice } from "@/lib/format";

type Params = PageProps<"/collection/[slug]">["params"];

// One page per product in src/data/products.ts, all prerendered. An unknown slug is a 404.
export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return {};
  return { title: product.name, description: product.summary };
}

/** The same for every piece in this sample. */
const shipping = [
  "Sent from Milan within two working days, folded in tissue in a recycled card box.",
  "Delivery within the EU takes two to four working days and is free on orders over €300.",
  "Returns are accepted for 14 days, unworn and with the label attached.",
];

/*
  This route waits for its params before rendering anything, so an unknown
  slug is a real 404 (status and all). Reading them behind <Suspense> instead
  would start the response first and could only show a "not found" page with
  status 200. Opting out of the instant-navigation check is what allows the
  top-level await; nothing is lost, because every product page is prerendered.
*/
export const instant = false;

// A quiet page: no 3D (PageSetup without a scene), solid header.
export default async function ProductPage({ params }: { params: Params }) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) notFound();

  const sections = [
    {
      id: "description",
      title: "Description",
      content: (
        <>
          <p>{product.summary}</p>
          <ul className="mt-4">
            {product.details.map((detail) => (
              <li key={detail} className="border-t border-sand py-2.5 first:border-t-0">
                {detail}
              </li>
            ))}
          </ul>
        </>
      ),
    },
    {
      id: "materials",
      title: "Materials & care",
      content: (
        <dl className="grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-3">
          <dt>
            <Label>Composition</Label>
          </dt>
          <dd>{product.composition}</dd>
          <dt>
            <Label>Origin</Label>
          </dt>
          <dd>{product.origin}</dd>
          <dt>
            <Label>Care</Label>
          </dt>
          <dd>{product.care}</dd>
        </dl>
      ),
    },
    {
      id: "shipping",
      title: "Shipping",
      content: (
        <ul className="flex flex-col gap-3">
          {shipping.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      ),
    },
  ];

  return (
    <>
      <PageSetup header="solid" />
      <article className="grid gap-x-6 pb-section pt-header md:grid-cols-12">
        {/* Left: the photographs, edge to edge, scrolling past the fixed panel. */}
        <div className="md:col-span-7">
          <ProductGallery images={product.images} name={product.name} />
        </div>

        {/* Right: stays in view while the photographs scroll. */}
        <div className="px-page pt-10 md:col-span-4 md:col-start-9 md:px-0 md:pr-page md:pt-0">
          <StickyPanel className="md:pb-6 md:pt-6">
            <Link
              href={`/collection?category=${product.category.toLowerCase()}`}
              className="inline-flex min-h-11 items-center"
            >
              <Label>Collection / {product.category}</Label>
            </Link>
            <Heading level={1} size="section" className="mt-2">
              {product.name}
            </Heading>
            <p className="mt-4 text-lede tabular-nums">{formatPrice(product.price)}</p>

            <div className="mt-10">
              <PurchasePanel
                product={{
                  slug: product.slug,
                  name: product.name,
                  colour: product.colour,
                  swatch: product.swatch,
                  soldOut: product.soldOut,
                }}
              />
            </div>

            <div className="mt-8">
              <Accordion items={sections} defaultOpen="description" headingLevel={2} />
            </div>
          </StickyPanel>
        </div>
      </article>

      <CompleteTheLook products={completeTheLook(product)} />
    </>
  );
}
