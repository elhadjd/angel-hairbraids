"use client";

import { useEffect } from "react";
import type { GalleryItem } from "@/lib/types";
import { formatPrice } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Media } from "@/components/ui/media";

export function GalleryModal({
  item,
  onClose,
}: {
  item: GalleryItem;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const bookHref = item.serviceId
    ? `/book?service=${item.serviceId}${item.styleId ? `&style=${item.styleId}` : ""}`
    : item.buttonUrl || "/book";

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/70 p-0 backdrop-blur-sm sm:items-center sm:p-8">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0"
        onClick={onClose}
      />
      <article className="relative grid max-h-[92svh] w-full max-w-5xl overflow-y-auto overflow-x-hidden bg-ivory sm:grid-cols-2 sm:overflow-hidden">
        <div className="relative aspect-[4/5] max-h-[42svh] sm:max-h-none sm:aspect-auto sm:min-h-[640px]">
          <Media
            src={item.image}
            alt={item.title}
            type={item.type}
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-between p-5 sm:p-12">
          <div>
            <p className="kicker">{item.category}</p>
            <h3 className="mt-4 font-display text-4xl">{item.title}</h3>
            {item.description ? (
              <p className="mt-4 text-sm leading-relaxed text-muted">
                {item.description}
              </p>
            ) : null}
            {item.durationLabel || item.priceFrom > 0 ? (
              <dl className="mt-8 space-y-3 border-t border-gold/25 pt-6 text-sm">
                {item.durationLabel ? (
                  <div className="flex justify-between">
                    <dt className="text-muted">Duration</dt>
                    <dd>{item.durationLabel}</dd>
                  </div>
                ) : null}
                {item.priceFrom > 0 ? (
                  <div className="flex justify-between">
                    <dt className="text-muted">Starting at</dt>
                    <dd>{formatPrice(item.priceFrom)}</dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
          </div>
          <div className="mt-10 flex flex-col gap-3">
            <Button href={bookHref}>{item.buttonLabel || "Book This Style"}</Button>
            <button
              type="button"
              onClick={onClose}
              className="text-[11px] tracking-[0.22em] uppercase text-muted"
            >
              Close
            </button>
          </div>
        </div>
      </article>
    </div>
  );
}
