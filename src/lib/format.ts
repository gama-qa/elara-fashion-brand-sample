const euros = new Intl.NumberFormat("en-IE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});

/** Whole euros to display text: 480 becomes "€480". */
export function formatPrice(price: number): string {
  return euros.format(price);
}
