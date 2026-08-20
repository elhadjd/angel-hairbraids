import { SiteShell } from "@/components/layout/site-shell";
import { Container } from "@/components/ui/button";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <SiteShell>
      <section className="bg-ivory pt-40 pb-24">
        <Container>
          <p className="kicker">404</p>
          <h1 className="mt-4 font-display text-[2.2rem] leading-tight sm:text-5xl">
            This page has left the chair.
          </h1>
          <p className="mt-4 max-w-md text-muted">
            The look you are searching for is not here. Return home, or book a
            visit and we will create it.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Button href="/">Home</Button>
            <Button href="/book" variant="ink">
              Book
            </Button>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
