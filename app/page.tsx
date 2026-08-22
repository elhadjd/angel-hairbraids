import { SiteShell } from "@/components/layout/site-shell";
import { Hero } from "@/components/home/hero";
import { Trust } from "@/components/home/trust";
import { ServicesShowcase } from "@/components/home/services";
import { FeaturedGallery } from "@/components/home/gallery";
import { AboutPreview } from "@/components/home/about";
import { WhyUs } from "@/components/home/why";
import { Testimonials } from "@/components/home/testimonials";
import { Instagram } from "@/components/home/instagram";
import { FinalCta } from "@/components/home/final-cta";
import { PriceTables } from "@/components/catalog/price-tables";
import { getSiteCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await getSiteCatalog();
  const hero =
    catalog.media.home.find((item) => item.featured) ??
    catalog.media.featured[0] ??
    catalog.media.home[0] ??
    null;
  const about = catalog.media.about[0] ?? null;
  const instagram = (
    catalog.media.instagram.length
      ? catalog.media.instagram
      : catalog.media.featured.length
        ? catalog.media.featured
        : catalog.gallery
  )
    .map((item) => ("mediaUrl" in item ? item.mediaUrl || item.thumbnailUrl : item.image))
    .filter(Boolean);

  return (
    <SiteShell invertedHeader>
      <Hero media={hero} />
      <Trust />
      {catalog.services.length ? (
        <ServicesShowcase services={catalog.services} currency={catalog.currency} />
      ) : null}
      {catalog.gallery.length ? <FeaturedGallery items={catalog.gallery} /> : null}
      <AboutPreview media={about} />
      <WhyUs />
      {catalog.priceTables.length ? (
        <PriceTables tables={catalog.priceTables} currency={catalog.currency} />
      ) : null}
      {catalog.testimonials.length ? (
        <Testimonials items={catalog.testimonials} />
      ) : null}
      <Instagram images={instagram} />
      <FinalCta />
    </SiteShell>
  );
}
