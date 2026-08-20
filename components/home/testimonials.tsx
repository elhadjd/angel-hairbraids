"use client";

import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type { Testimonial } from "@/lib/types";
import { Container } from "@/components/ui/button";
import { warmBlur } from "@/lib/blur";

export function Testimonials({ items }: { items: Testimonial[] }) {
  const [i, setI] = useState(0);
  const t = items[i];

  return (
    <section className="bg-ivory py-24 lg:py-32">
      <Container>
        <p className="kicker">Client Notes</p>
        <div className="mt-10 grid items-center gap-12 lg:grid-cols-12">
          <div className="relative mx-auto aspect-square w-48 overflow-hidden sm:w-64 lg:col-span-4 lg:w-full lg:max-w-sm">
            <AnimatePresence mode="wait">
              <motion.div
                key={t.id}
                initial={{ opacity: 0, scale: 1.04 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  placeholder="blur"
                  blurDataURL={warmBlur}
                  sizes="320px"
                  className="object-cover"
                />
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-display text-[1.65rem] leading-snug sm:text-4xl lg:text-5xl">
                  “{t.quote}”
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-sm tracking-[0.16em] uppercase">{t.name}</p>
                    <p className="mt-1 text-xs text-gold">{t.service}</p>
                  </div>
                  <span className="text-gold" aria-label={`${t.rating} stars`}>
                    {"★".repeat(t.rating)}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-10 flex items-center gap-4">
              <button
                type="button"
                onClick={() => setI((n) => (n - 1 + items.length) % items.length)}
                className="border border-gold/40 px-4 py-2 text-[11px] tracking-[0.22em] uppercase"
              >
                Prev
              </button>
              <span className="text-xs text-muted">
                {String(i + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
              </span>
              <button
                type="button"
                onClick={() => setI((n) => (n + 1) % items.length)}
                className="border border-gold/40 px-4 py-2 text-[11px] tracking-[0.22em] uppercase"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
