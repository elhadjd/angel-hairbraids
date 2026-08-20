import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="relative overflow-hidden bg-ink px-4 py-20 text-center text-ivory sm:px-8 sm:py-28">
      <div className="pattern-veil pointer-events-none absolute inset-0" />
      <p className="relative kicker">The Chair Awaits</p>
      <h2 className="relative mx-auto mt-5 max-w-4xl font-display text-[2.35rem] leading-[1.05] sm:mt-6 sm:text-6xl lg:text-8xl">
        Ready for Your Next Look?
      </h2>
      <p className="relative mx-auto mt-5 max-w-lg text-sm text-ivory/70 sm:mt-6 sm:text-base">
        Book your appointment today and let us create a style you’ll love —
        one that honors your hair, your time, and your story.
      </p>
      <div className="relative mt-8 sm:mt-10">
        <Button href="/book" className="w-full max-w-xs px-8 py-4 text-xs sm:w-auto">
          Book Your Appointment
        </Button>
      </div>
    </section>
  );
}
