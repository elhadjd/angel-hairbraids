import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container, SectionHeading } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/format";
import { readStore } from "@/lib/store";
import { warmBlur } from "@/lib/blur";
import { FinalCta } from "@/components/home/final-cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Braiding Services",
  description:
    "Knotless braids, box braids, cornrows, Senegalese twists, Fulani, goddess braids, kids braids, wig installation, and natural hair care in Columbus, Ohio.",
};

export default async function ServicesPage() {
  const { services } = await readStore();

  return (
    <SiteShell>
      <section className="bg-ivory pt-32 pb-12">
        <Container>
          <SectionHeading
            kicker="The Menu"
            title="Services"
            copy="Starting prices vary with length, size, and hair type. Your stylist confirms the investment during booking."
          />
        </Container>
      </section>
      <section className="bg-ivory pb-24">
        <Container className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
          {services.map((s) => (
            <article key={s.id} className="group">
              <Link href={`/services/${s.slug}`} className="img-zoom relative block aspect-[4/5] overflow-hidden">
                <Image
                  src={s.image}
                  alt={s.name}
                  fill
                  placeholder="blur"
                  blurDataURL={warmBlur}
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover"
                />
              </Link>
              <p className="mt-5 kicker">{s.tagline}</p>
              <h2 className="mt-2 font-display text-3xl">
                <Link href={`/services/${s.slug}`}>{s.name}</Link>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
              <p className="mt-4 text-sm">
                from {formatPrice(s.priceFrom)} · {formatDuration(s.durationMin, s.durationMax)}
              </p>
              <div className="mt-5 flex gap-3">
                <Button href={`/book?service=${s.slug}`}>Book Now</Button>
                <Link
                  href={`/services/${s.slug}`}
                  className="self-center text-[11px] tracking-[0.22em] uppercase underline"
                >
                  Details
                </Link>
              </div>
            </article>
          ))}
        </Container>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
