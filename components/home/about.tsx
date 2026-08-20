import Image from "next/image";
import { Button, Container } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { warmBlur } from "@/lib/blur";

export function AboutPreview() {
  return (
    <section className="bg-ivory py-24 lg:py-32">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <Reveal className="relative lg:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Image
                src="/images/about-craft.jpg"
                alt="Stylist braiding a client in the Angel atelier"
                fill
                placeholder="blur"
                blurDataURL={warmBlur}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover"
              />
            </div>
            <p className="absolute -bottom-6 right-6 hidden max-w-[180px] bg-espresso px-5 py-4 font-display text-xl italic text-gold lg:block">
              Craft, not haste.
            </p>
          </Reveal>
          <Reveal delay={120} className="lg:col-span-5 lg:pl-8">
            <p className="kicker">Our Story</p>
            <h2 className="mt-4 font-display text-4xl leading-[1.1] sm:text-5xl">
              We are not merely a salon.
            </h2>
            <p className="mt-6 text-base leading-relaxed text-muted">
              We are specialists in beauty, culture, and African style — a house
              of braiding founded on West African technique and a contemporary
              Atlanta sensibility. Every part is a decision. Every hour is
              unhurried.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted">
              Angel Mensah opened the atelier so women could sit for a
              protective style and leave feeling seen, adorned, and at ease.
            </p>
            <div className="mt-8">
              <Button href="/about">Discover Our Story</Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </section>
  );
}
