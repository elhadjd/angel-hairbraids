import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { formatDuration, formatListedPrice, formatPrice } from "@/lib/format";
import { getQuotedPrice, getSiteCatalog } from "@/lib/catalog";
import { site } from "@/lib/site";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { services, currency } = await getSiteCatalog();
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "Service" };
  return {
    title: service.name,
    description: `${service.description} Book ${service.name} at ${site.name} in Columbus, Ohio. Starting at ${formatListedPrice(service.priceFrom, service.currency || currency, service.priceLabel)}.`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const catalog = await getSiteCatalog();
  const service = catalog.services.find((s) => s.slug === slug);
  if (!service) notFound();

  const looks = catalog.styles.filter((s) => s.serviceId === service.id);
  const livePrice = await getQuotedPrice(service.productId);
  const displayPrice = livePrice ?? service.priceFrom;
  const currency = service.currency || catalog.currency;

  return (
    <SiteShell>
      <section className="bg-ivory pt-28 pb-20">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="relative aspect-[3/4] overflow-hidden lg:col-span-6">
            <Media
              src={service.image}
              alt={service.name}
              preload
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="kicker">Service</p>
            <h1 className="mt-4 font-display text-[2.4rem] leading-tight sm:text-6xl">
              {service.name}
            </h1>
            <p className="mt-2 text-gold">{service.tagline}</p>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-muted">
              {service.longDescription}
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-gold/25 pt-6">
              <div>
                <dt className="text-[11px] tracking-[0.22em] uppercase text-muted">
                  Starting at
                </dt>
                <dd className="mt-1 font-display text-3xl">
                  {formatListedPrice(displayPrice, currency, service.priceLabel)}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.22em] uppercase text-muted">
                  Duration
                </dt>
                <dd className="mt-1 font-display text-3xl">
                  {formatDuration(service.durationMin, service.durationMax)}
                </dd>
              </div>
            </dl>
            <div className="mt-8">
              <Button href={`/book?service=${service.slug}`} className="w-full sm:w-auto">
                Book Now
              </Button>
            </div>
          </div>
        </Container>
      </section>

      {looks.length > 0 ? (
        <section className="bg-paper py-20">
          <Container>
            <p className="kicker">Looks</p>
            <h2 className="mt-3 font-display text-4xl">Styles within this service</h2>
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {looks.map((look) => (
                <article key={look.id} className="bg-ivory">
                  <div className="relative aspect-[3/4]">
                    <Media src={look.image} alt={look.name} sizes="(max-width: 1024px) 50vw, 33vw" />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-2xl">{look.name}</h3>
                    <p className="mt-2 text-sm text-muted">{look.description}</p>
                    {look.priceFrom > 0 ? (
                      <p className="mt-3 text-sm">from {formatPrice(look.priceFrom, currency)}</p>
                    ) : null}
                    <Button
                      href={`/book?service=${service.slug}&style=${look.slug}`}
                      className="mt-4 w-full sm:w-auto"
                    >
                      Book This Style
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          </Container>
        </section>
      ) : null}
    </SiteShell>
  );
}
