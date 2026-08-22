import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Container, SectionHeading } from "@/components/ui/button";
import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { getSiteCatalog } from "@/lib/catalog";
import { FinalCta } from "@/components/home/final-cta";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Style Gallery",
  description:
    "Browse knotless braids, box braids, cornrows, twists, kids braids, and special African styles from Angel African Hair Braiding in Columbus, Ohio.",
};

export default async function GalleryPage() {
  const { gallery } = await getSiteCatalog();
  return (
    <SiteShell>
      <section className="bg-ivory pt-32 pb-20">
        <Container>
          <SectionHeading
            kicker="Archive"
            title="Gallery"
            copy="Click any portrait for duration, starting price, and a path to book that exact look."
          />
          <div className="mt-12">
            <GalleryGrid items={gallery} />
          </div>
        </Container>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
