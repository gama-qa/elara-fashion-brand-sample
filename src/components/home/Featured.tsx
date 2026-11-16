import { ProductTile } from "@/components/product/ProductTile";
import { SceneSection } from "@/components/scene/SceneSection";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";
import { featuredProducts } from "@/data/products";
import { cn } from "@/lib/cn";
import { site } from "@/lib/site";

/**
 * Where each of the three tiles sits: column span, start column and a
 * different drop from the top of its row, so no two share a baseline. Phones
 * stack them, alternating which edge they hang from.
 */
const placements = [
  "w-full md:col-span-5 md:col-start-1",
  "ml-auto w-10/12 md:ml-0 md:w-full md:col-span-4 md:col-start-8 md:mt-56",
  "w-11/12 md:w-full md:col-span-5 md:col-start-3 md:mt-28",
];

/** How far each photograph slides inside its frame; slightly different so they don't move as one. */
const parallax = [0.07, 0.1, 0.06];

/**
 * Third section of the home page: three pieces, set large and off-grid. By
 * the time it enters the screen the footage has washed out to plain sand (the
 * home reel in presets.ts), which is what turns the page from cream to sand:
 * this section has no background of its own.
 */
export function Featured() {
  return (
    <SceneSection chapter={2} aria-labelledby="featured-title" className="pb-section pt-[14svh]">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-6">
          <div>
            <Label>{site.season}</Label>
            <Heading id="featured-title" level={2} size="title" className="mt-5">
              Three pieces to begin with
            </Heading>
          </div>
          <AnimatedLink href="/collection">View the collection</AnimatedLink>
        </div>

        <ul className="mt-16 grid grid-cols-1 gap-y-16 md:mt-24 md:grid-cols-12 md:gap-x-6 md:gap-y-0">
          {featuredProducts.slice(0, 3).map((product, index) => (
            <li key={product.slug} className={cn(placements[index])}>
              <ProductTile
                product={product}
                parallax={parallax[index]}
                sizes="(min-width: 768px) 42vw, 92vw"
              />
            </li>
          ))}
        </ul>
      </Container>
    </SceneSection>
  );
}
