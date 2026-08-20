import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink px-5 py-28 text-center text-ivory sm:px-8">
      <div className="pattern-veil pointer-events-none absolute inset-0" />
      <p className="relative kicker">The Chair Awaits</p>
      <h2 className="relative mx-auto mt-6 max-w-4xl font-display text-5xl leading-[0.95] sm:text-6xl lg:text-8xl">
        Ready for Your Next Look?
      </h2>
      <p className="relative mx-auto mt-6 max-w-lg text-base text-ivory/70">
        Book your appointment today and let us create a style you’ll love —
        one that honors your hair, your time, and your story.
      </p>
      <div className="relative mt-10">
        <Button href="/book" className="px-10 py-4 text-xs">
          Book Your Appointment
        </Button>
      </div>
    </section>
  );
}
