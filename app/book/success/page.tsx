import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Appointment Reserved",
};

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string | string[] }>;
}) {
  const { ref } = await searchParams;

  return (
    <SiteShell>
      <section className="flex min-h-[80vh] items-center bg-espresso text-ivory">
        <Container className="py-32 text-center">
          <p className="kicker">Confirmed</p>
          <h1 className="mt-6 font-display text-5xl sm:text-7xl">
            You are on the book.
          </h1>
          <p className="mx-auto mt-6 max-w-lg text-ivory/70">
            A confirmation has been sent to your email. Please arrive ten minutes
            early. We cannot wait to create your next look.
          </p>
          {ref ? (
            <p className="mt-8 text-sm tracking-[0.28em] uppercase text-gold">
              Reference {Array.isArray(ref) ? ref[0] : ref}
            </p>
          ) : null}
          <div className="mt-10 flex justify-center gap-4">
            <Button href="/account" variant="gold">
              View My Visits
            </Button>
            <Button href="/" variant="ghost">
              Home
            </Button>
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
