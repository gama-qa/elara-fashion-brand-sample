"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Label } from "@/components/ui/Label";
import { type Product, type Size, sizes } from "@/data/products";
import { addToBag } from "@/lib/bag-store";
import { cn } from "@/lib/cn";

type Notice = { kind: "added"; size: Size } | { kind: "choose" } | null;

/**
 * Colour, size and Add to bag. Sizes are a real radio group (arrow keys move
 * between them); sold-out sizes are shown struck through and can't be chosen.
 * Pressing Add to bag without a size asks for one instead of doing nothing.
 */
export function PurchasePanel({ product }: { product: Pick<Product, "slug" | "name" | "colour" | "swatch" | "soldOut"> }) {
  const [size, setSize] = useState<Size | null>(null);
  const [notice, setNotice] = useState<Notice>(null);
  const group = useId();

  const add = () => {
    if (!size) {
      setNotice({ kind: "choose" });
      return;
    }
    addToBag(product.slug, size);
    setNotice({ kind: "added", size });
  };

  return (
    <div>
      <div className="flex items-center justify-between border-t border-sand py-4">
        <Label>Colour</Label>
        <span className="flex items-center gap-3">
          <span
            aria-hidden
            className="block h-3.5 w-3.5 border border-espresso/25"
            style={{ backgroundColor: product.swatch }}
          />
          {product.colour}
        </span>
      </div>

      <fieldset className="border-t border-sand pt-4">
        <legend className="float-left">
          <Label>Size</Label>
        </legend>
        <div className="flex justify-end gap-px">
          {sizes.map((option) => {
            const soldOut = product.soldOut.includes(option);
            return (
              <label key={option} className={cn("relative", soldOut ? "cursor-not-allowed" : "cursor-pointer")}>
                <input
                  type="radio"
                  name={`${group}-size`}
                  value={option}
                  checked={size === option}
                  disabled={soldOut}
                  onChange={() => {
                    setSize(option);
                    setNotice(null);
                  }}
                  className="peer sr-only"
                />
                <span
                  className={cn(
                    "flex h-11 min-w-11 items-center justify-center border px-2 font-sans text-label font-medium uppercase tracking-label",
                    "transition-colors duration-500 ease-quiet",
                    "peer-checked:border-espresso peer-checked:bg-espresso peer-checked:text-cream",
                    "peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-espresso",
                    soldOut ? "border-sand text-taupe line-through" : "border-sand text-espresso hover:border-espresso",
                  )}
                >
                  <span className="sr-only">{soldOut ? "Sold out: " : "Size "}</span>
                  {option}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <Button variant="solid" className="mt-6 w-full" onClick={add}>
        Add to bag
      </Button>

      <p aria-live="polite" className="mt-3 min-h-6 text-taupe-ink">
        {notice?.kind === "choose" && "Choose a size first."}
        {notice?.kind === "added" && `${product.name}, size ${notice.size}, is in your bag.`}
      </p>
    </div>
  );
}
