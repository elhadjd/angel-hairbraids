"use client";

import { useMemo, useState } from "react";
import type { GalleryItem } from "@/lib/types";
import { GalleryModal } from "./gallery-modal";
import { Media } from "@/components/ui/media";
import { cn } from "@/lib/format";
import { galleryFilters } from "@/lib/gallery";

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const filters = useMemo(() => galleryFilters(items), [items]);
  const [filter, setFilter] = useState<string>("all");
  const [active, setActive] = useState<GalleryItem | null>(null);
  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [filter, items],
  );

  return (
    <>
      {filters.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {filters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={cn(
                "shrink-0 border-b-2 px-3 py-2 text-[11px] tracking-[0.22em] uppercase",
                filter === f.id ? "border-gold text-ink" : "border-transparent text-muted",
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      ) : null}
      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="img-zoom mb-4 block w-full break-inside-avoid"
          >
            <span className="relative block aspect-[3/4] overflow-hidden">
              <Media
                src={item.image}
                alt={item.title}
                type={item.type}
                sizes="(max-width: 1024px) 50vw, 33vw"
              />
            </span>
          </button>
        ))}
      </div>
      {active ? <GalleryModal item={active} onClose={() => setActive(null)} /> : null}
    </>
  );
}
