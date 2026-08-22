import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { FinalCta } from "@/components/home/final-cta";
import { Media } from "@/components/ui/media";
import { getSiteCatalog } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "The Salon",
  description:
    "The story of Angel African Hair Braiding — a Columbus, Ohio atelier devoted to African braiding, culture, and modern luxury.",
};

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const catalog = await getSiteCatalog();
  const hero =
    catalog.media.about[0] ??
    catalog.media.home[0] ??
    catalog.media.featured[0];
  return (
    <SiteShell>
      <section className="relative mt-0 min-h-[70vh] bg-espresso text-ivory">
        <Media
          src={hero?.mediaUrl || "/images/salon-interior.jpg"}
          alt={hero?.title || "The Angel African Hair Braiding salon interior"}
          type={hero?.type}
          preload
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-espresso via-espresso/40 to-espresso/20" />
        <Container className="relative flex min-h-[70vh] flex-col justify-end pb-16 pt-32">
          <p className="kicker">Est. 2014 · Columbus</p>
          <h1 className="mt-5 max-w-4xl font-display text-[2.4rem] leading-[1.05] sm:text-7xl">
            A house of braiding, culture, and quiet luxury.
          </h1>
        </Container>
      </section>

      <section className="bg-ivory py-24">
        <Container className="grid gap-12 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="kicker">The Founder</p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl">
              Angel Mensah
            </h2>
          </Reveal>
          <Reveal delay={100} className="space-y-5 text-base leading-relaxed text-muted lg:col-span-7">
            <p>
              Angel learned to braid in her grandmother’s courtyard in Accra —
              first on dolls, then on cousins, then on women who sat from dawn
              until the light changed. When she opened the Columbus atelier, she
              refused the fluorescent, rushed model of braiding shops. She wanted
              a room that felt like a fitting at a fashion house.
            </p>
            <p>
              We are not merely a salon. We are specialists in beauty, culture,
              and African styles. Knotless, box braids, Fulani, goddess, cornrows,
              twists — each is treated as couture, mapped to your hair, your
              calendar, and the way you actually live.
            </p>
            <p>
              Today a small team of specialist stylists continues that standard:
              unhurried time, premium hair, and a finish that still looks
              intentional in week six.
            </p>
            <Button href="/book" className="mt-4">
              Book with Angel
            </Button>
          </Reveal>
        </Container>
      </section>

      <section className="bg-paper py-24">
        <Container className="grid gap-8 md:grid-cols-3">
          {[
            {
              title: "Culture, held with care",
              copy: "African braiding traditions are not a trend here. They are the craft we were raised in — presented with contemporary elegance.",
            },
            {
              title: "The hair comes first",
              copy: "If a style will stress your edges, we will say so. Protective should mean protective.",
            },
            {
              title: "An atelier, not a factory",
              copy: "Limited chairs. Appointments only. A room designed for long, beautiful hours.",
            },
          ].map((b) => (
            <article key={b.title} className="border-t border-gold/40 pt-8">
              <h3 className="font-display text-2xl">{b.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-muted">{b.copy}</p>
            </article>
          ))}
        </Container>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
