"use client";

import { useMemo, useState } from "react";
import type { GalleryItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Button, Container, SectionHeading } from "@/components/ui/button";
import { Reveal } from "@/components/ui/reveal";
import { GalleryModal } from "@/components/gallery/gallery-modal";
import { Media } from "@/components/ui/media";
import { cn } from "@/lib/format";
import { galleryFilters } from "@/lib/gallery";

export function FeaturedGallery({ items }: { items: GalleryItem[] }) {
  const filters = useMemo(() => galleryFilters(items), [items]);
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<GalleryItem | null>(null);

  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [filter, items],
  );

  return (
    <section className="bg-paper py-24 lg:py-32">
      <Container>
        <Reveal>
          <SectionHeading
            kicker="The Atelier"
            title="Featured styles, composed like portraits."
            copy="A living archive of looks from the Columbus chair — updated from the salon catalogue."
          />
        </Reveal>

        {filters.length > 1 ? (
          <div className="mt-10 flex gap-2 overflow-x-auto no-scrollbar">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={cn(
                  "shrink-0 border-b-2 px-3 py-2 text-[11px] tracking-[0.22em] uppercase transition-colors",
                  filter === f.id
                    ? "border-gold text-ink"
                    : "border-transparent text-muted hover:text-ink",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        ) : null}

        <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
          {visible.map((item, i) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setActive(item)}
              className="img-zoom group mb-4 w-full break-inside-avoid text-left"
            >
              <div
                className={cn(
                  "relative overflow-hidden bg-espresso",
                  i % 5 === 0 ? "aspect-[4/5]" : i % 3 === 0 ? "aspect-square" : "aspect-[3/4]",
                )}
              >
                <Media
                  src={item.image}
                  alt={item.title}
                  type={item.type}
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/80 via-transparent to-transparent p-4 opacity-100 transition-opacity duration-500 sm:p-5 sm:opacity-0 sm:group-hover:opacity-100">
                  <p className="font-display text-2xl text-ivory">{item.title}</p>
                  {item.priceFrom > 0 ? (
                    <p className="mt-1 text-xs tracking-[0.18em] uppercase text-gold">
                      from {formatPrice(item.priceFrom)}
                    </p>
                  ) : null}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-12">
          <Button href="/gallery" variant="ink">
            Open Full Gallery
          </Button>
        </div>
      </Container>

      {active ? (
        <GalleryModal item={active} onClose={() => setActive(null)} />
      ) : null}
    </section>
  );
}
