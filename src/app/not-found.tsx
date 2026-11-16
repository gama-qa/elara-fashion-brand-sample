import { PageSetup } from "@/components/scene/PageSetup";
import { AnimatedLink } from "@/components/ui/AnimatedLink";
import { Container } from "@/components/ui/Container";
import { Heading } from "@/components/ui/Heading";
import { Label } from "@/components/ui/Label";

export default function NotFound() {
  return (
    <>
      <PageSetup header="solid" />
      <Container className="flex min-h-[70svh] flex-col justify-end pb-section pt-[calc(var(--spacing-header)+4rem)]">
        <Label>404</Label>
        <Heading level={1} size="title" className="mt-6">
          This page does not exist.
        </Heading>
        <div className="mt-10">
          <AnimatedLink href="/">Return to the home page</AnimatedLink>
        </div>
      </Container>
    </>
  );
}
