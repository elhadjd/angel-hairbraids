"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { site } from "@/lib/site";

export function MobileBookBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/book")) return null;

  return (
    <div
      data-mobile-book-bar
      className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-ivory/95 px-3 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur md:hidden"
    >
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Link
          href="/book"
          className="brand-fill flex h-12 items-center justify-center px-3 text-center text-[11px] tracking-[0.18em] uppercase"
        >
          Book Now
        </Link>
        <a
          href={site.phoneHref}
          className="flex h-12 items-center justify-center border border-gold/50 px-4 text-[11px] tracking-[0.18em] uppercase"
        >
          Call
        </a>
      </div>
    </div>
  );
}
