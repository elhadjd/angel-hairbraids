"use client";

import Link from "next/link";
import { useState } from "react";
import type { Service } from "@/lib/types";
import { formatDuration, formatListedPrice } from "@/lib/format";
import { Button, Container, SectionHeading } from "@/components/ui/button";
import { Media } from "@/components/ui/media";
import { Reveal } from "@/components/ui/reveal";

export function ServicesShowcase({
  services,
  currency = "USD",
}: {
  services: Service[];
  currency?: string;
}) {
  const [active, setActive] = useState(services[0]?.id);
  const current = services.find((s) => s.id === active) ?? services[0];
  if (!current) return null;

  return (
    <section className="bg-ivory py-24 lg:py-32">
      <Container>
        <Reveal>
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading
              kicker="The Menu"
              title="Services composed with intention."
              copy="Every appointment is a collaboration — length, size, color, and comfort, designed around your hair and your life."
            />
            <Button href="/services" variant="ink" className="self-start">
              View All Services
            </Button>
          </div>
        </Reveal>

        <div className="mt-16 grid gap-10 lg:grid-cols-12 lg:gap-16">
          <ol className="lg:col-span-6">
            {services.map((s, i) => {
              const on = s.id === current.id;
              return (
                <li key={s.id} className="border-t border-gold/25 last:border-b">
                  <button
                    type="button"
                    onMouseEnter={() => setActive(s.id)}
                    onFocus={() => setActive(s.id)}
                    onClick={() => setActive(s.id)}
                    className="flex w-full items-baseline gap-5 py-5 text-left"
                  >
                    <span className="font-display text-sm text-gold">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="flex-1">
                      <span
                        className={`block font-display text-2xl sm:text-3xl ${on ? "text-ink" : "text-ink/45"}`}
                      >
                        {s.name}
                      </span>
                      <span className="mt-1 hidden text-sm text-muted sm:block">
                        from {formatListedPrice(s.priceFrom, s.currency || currency, s.priceLabel)} · {formatDuration(s.durationMin, s.durationMax)}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className="lg:col-span-6">
            <div className="img-zoom relative aspect-[4/5] overflow-hidden bg-paper">
              <Media
                key={current.id}
                src={current.image}
                alt={current.name}
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
            <div className="mt-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="kicker">{current.tagline}</p>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-muted">
                  {current.description}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button href={`/book?service=${current.slug}`} className="w-full sm:w-auto">
                  Book Now
                </Button>
                <Link
                  href={`/services/${current.slug}`}
                  className="text-[11px] tracking-[0.22em] uppercase text-ink underline"
                >
                  Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
