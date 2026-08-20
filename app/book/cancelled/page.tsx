import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Deposit Cancelled",
};

export default function BookingCancelledPage() {
  return (
    <SiteShell>
      <section className="flex min-h-[80vh] items-center bg-ivory">
        <Container className="py-32 text-center">
          <p className="kicker">Checkout</p>
          <h1 className="mt-6 font-display text-[2.2rem] leading-tight sm:text-6xl">
            Deposit payment was cancelled.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-muted">
            Your appointment request is still with the atelier. You can complete
            the deposit later, or book again if you would like a different time.
          </p>
          <div className="mt-10 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center sm:gap-4">
            <Button href="/book">Return to Booking</Button>
            <Button href="/contact" variant="ink">
              Write to Us
            </Button>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
