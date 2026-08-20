"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function MobileBookBar() {
  const pathname = usePathname();
  if (pathname.startsWith("/book") || pathname.startsWith("/admin")) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-gold/30 bg-ivory/95 p-3 backdrop-blur md:hidden">
      <Link
        href="/book"
        className="flex h-12 items-center justify-center bg-gold text-[11px] tracking-[0.28em] uppercase text-ink"
      >
        Book Your Appointment
      </Link>
    </div>
  );
}
