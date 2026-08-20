"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import type { GalleryCategory, GalleryItem } from "@/lib/types";
import { GalleryModal } from "./gallery-modal";
import { cn } from "@/lib/format";
import { warmBlur } from "@/lib/blur";

const filters: { id: GalleryCategory | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "braids", label: "Braids" },
  { id: "knotless", label: "Knotless" },
  { id: "twists", label: "Twists" },
  { id: "cornrows", label: "Cornrows" },
  { id: "kids", label: "Kids" },
  { id: "special", label: "Special Styles" },
];

export function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const [filter, setFilter] = useState<(typeof filters)[number]["id"]>("all");
  const [active, setActive] = useState<GalleryItem | null>(null);
  const visible = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.category === filter)),
    [filter, items],
  );

  return (
    <>
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
      <div className="mt-10 columns-1 gap-4 sm:columns-2 lg:columns-3">
        {visible.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setActive(item)}
            className="img-zoom mb-4 block w-full break-inside-avoid"
          >
            <span className="relative block aspect-[3/4] overflow-hidden">
              <Image
                src={item.image}
                alt={item.title}
                fill
                placeholder="blur"
                blurDataURL={warmBlur}
                sizes="(max-width: 1024px) 50vw, 33vw"
                className="object-cover"
              />
            </span>
          </button>
        ))}
      </div>
      {active ? <GalleryModal item={active} onClose={() => setActive(null)} /> : null}
    </>
  );
}
