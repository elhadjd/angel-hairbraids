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
import { readStore } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function Home() {
  const store = await readStore();

  return (
    <SiteShell invertedHeader>
      <Hero />
      <Trust />
      <ServicesShowcase services={store.services} />
      <FeaturedGallery items={store.gallery} />
      <AboutPreview />
      <WhyUs />
      <Testimonials items={store.testimonials} />
      <Instagram />
      <FinalCta />
    </SiteShell>
  );
}
