import type { Metadata } from "next";
import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container, SectionHeading } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { formatDuration, formatListedPrice } from "@/lib/format";
import { getSiteCatalog } from "@/lib/catalog";
import { FinalCta } from "@/components/home/final-cta";
import { PriceTables } from "@/components/catalog/price-tables";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Braiding Services",
  description:
    "Knotless braids, box braids, cornrows, Senegalese twists, Fulani, goddess braids, kids braids, wig installation, and natural hair care in Columbus, Ohio.",
};

export default async function ServicesPage() {
  const catalog = await getSiteCatalog();

  return (
    <SiteShell>
      <section className="bg-ivory pt-32 pb-12">
        <Container>
          <SectionHeading
            kicker="The Menu"
            title="Services"
            copy="Prices and looks come from the salon catalogue. Length, size, and hair type can change the final quote."
          />
        </Container>
      </section>
      <section className="bg-ivory pb-24">
        {catalog.services.length ? (
          <Container className="grid gap-x-8 gap-y-16 sm:grid-cols-2">
            {catalog.services.map((s) => (
              <article key={s.id} className="group">
                <Link href={`/services/${s.slug}`} className="img-zoom relative block aspect-[4/5] overflow-hidden">
                  <Media
                    src={s.image}
                    alt={s.name}
                    sizes="(max-width: 640px) 100vw, 50vw"
                  />
                </Link>
                <p className="mt-5 kicker">{s.tagline}</p>
                <h2 className="mt-2 font-display text-3xl">
                  <Link href={`/services/${s.slug}`}>{s.name}</Link>
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-muted">{s.description}</p>
                <p className="mt-4 text-sm">
                  from {formatListedPrice(s.priceFrom, s.currency || catalog.currency, s.priceLabel)}
                  {s.durationMin ? ` · ${formatDuration(s.durationMin, s.durationMax)}` : ""}
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <Button href={`/book?service=${s.slug}`} className="w-full sm:w-auto">
                    Book Now
                  </Button>
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
        ) : (
          <Container>
            <p className="text-sm text-muted">
              Services will appear here once they are published in SISGESC.
            </p>
          </Container>
        )}
      </section>
      <PriceTables tables={catalog.priceTables} currency={catalog.currency} />
      <FinalCta />
    </SiteShell>
  );
}
