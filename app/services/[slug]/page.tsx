import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container } from "@/components/ui/button";
import { formatDuration, formatPrice } from "@/lib/format";
import { seedStore } from "@/lib/seed";
import { readStore } from "@/lib/store";
import { site } from "@/lib/site";
import { warmBlur } from "@/lib/blur";

export const dynamic = "force-dynamic";

export async function generateStaticParams() {
  return seedStore().services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const { services } = await readStore();
  const service = services.find((s) => s.slug === slug);
  if (!service) return { title: "Service" };
  return {
    title: service.name,
    description: `${service.description} Book ${service.name} at ${site.name} in Columbus, Ohio. Starting at ${formatPrice(service.priceFrom)}.`,
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const store = await readStore();
  const service = store.services.find((s) => s.slug === slug);
  if (!service) notFound();

  const looks = store.styles.filter((s) => s.serviceId === service.id);
  const stylists = store.stylists.filter((s) =>
    s.specialties.includes(service.id),
  );

  return (
    <SiteShell>
      <section className="bg-ivory pt-28 pb-20">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="relative aspect-[3/4] overflow-hidden lg:col-span-6">
            <Image
              src={service.image}
              alt={service.name}
              fill
              preload
              placeholder="blur"
              blurDataURL={warmBlur}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col justify-center lg:col-span-6">
            <p className="kicker">Service</p>
            <h1 className="mt-4 font-display text-[2.4rem] leading-tight sm:text-6xl">{service.name}</h1>
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
                  {formatPrice(service.priceFrom)}
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
                    <Image
                      src={look.image}
                      alt={look.name}
                      fill
                      sizes="(max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-2xl">{look.name}</h3>
                    <p className="mt-2 text-sm text-muted">{look.description}</p>
                    <p className="mt-3 text-sm">
                      from {formatPrice(look.priceFrom)}
                    </p>
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

      <section className="bg-ivory py-20">
        <Container>
          <p className="kicker">Hands</p>
          <h2 className="mt-3 font-display text-4xl">Stylists for this service</h2>
          <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {stylists.map((st) => (
              <article key={st.id}>
                <div className="relative aspect-[3/4] overflow-hidden">
                  <Image src={st.image} alt={st.name} fill className="object-cover" sizes="25vw" />
                </div>
                <h3 className="mt-4 font-display text-2xl">{st.name}</h3>
                <p className="text-xs tracking-[0.18em] uppercase text-gold">{st.role}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </SiteShell>
  );
}
