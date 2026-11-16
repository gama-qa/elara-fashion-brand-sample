import { NewsletterForm } from "@/components/layout/NewsletterForm";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Container } from "@/components/ui/Container";
import { Label } from "@/components/ui/Label";
import { site } from "@/lib/site";

/** Opaque, so it covers the canvas at the end of every page. */
export function Footer() {
  return (
    <footer className="relative z-10 border-t border-sand bg-cream">
      <Container className="grid gap-12 py-16 md:grid-cols-12 md:py-24">
        <div className="md:col-span-4">
          <p className="font-serif text-section font-light leading-none tracking-wordmark">
            {site.name}
          </p>
          <p className="mt-6 max-w-[26rem] text-taupe-ink">{site.description}</p>
        </div>
        <div className="md:col-span-4 md:col-start-6">
          <NewsletterForm />
        </div>
        <nav aria-label="Footer" className="md:col-span-2 md:col-start-11">
          <ul className="flex flex-col gap-1">
            {site.nav.map((item) => (
              <li key={item.href}>
                <AnimatedLink href={item.href}>{item.label}</AnimatedLink>
              </li>
            ))}
          </ul>
        </nav>
      </Container>
      <div className="border-t border-sand">
        <Container className="flex flex-col gap-2 py-6 md:flex-row md:justify-between">
          <Label as="p">{site.name} is a fictional brand, made as a portfolio sample.</Label>
          <Label as="p">© {site.year}</Label>
        </Container>
      </div>
    </footer>
  );
}
