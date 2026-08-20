"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { site } from "@/lib/site";
import { cn } from "@/lib/format";

const links = [
  { href: "/services", label: "Services" },
  { href: "/gallery", label: "Gallery" },
  { href: "/about", label: "The Salon" },
  { href: "/contact", label: "Visit" },
];

export function Header({ inverted = false }: { inverted?: boolean }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const solid = inverted || scrolled || open;
  const lightText = inverted && !scrolled && !open;

  return (
    <>
      <header
        className={cn(
          "fixed inset-x-0 top-0 z-50 transition-all duration-500",
          solid ? "bg-ivory/92 backdrop-blur-md shadow-[0_1px_0_rgba(196,165,116,0.25)]" : "bg-transparent",
        )}
      >
        <div className="mx-auto flex h-[4.25rem] max-w-[1440px] items-center justify-between gap-3 px-4 sm:h-[4.5rem] sm:px-8 lg:px-12">
          <Link href="/" className="group flex items-center gap-3">
            <span
              className={cn(
                "grid h-9 w-9 place-items-center border text-lg font-display transition-colors",
                lightText ? "border-gold text-gold" : "border-gold text-ink",
              )}
            >
              A
            </span>
            <span className="min-w-0 leading-none">
              <span
                className={cn(
                  "block font-display text-[1.25rem] tracking-wide sm:text-[1.35rem]",
                  lightText ? "text-ivory" : "text-ink",
                )}
              >
                Angel
              </span>
              <span
                className={cn(
                  "hidden text-[9px] tracking-[0.2em] uppercase sm:block",
                  lightText ? "text-gold-bright" : "text-gold",
                )}
              >
                African Hair Braiding
              </span>
            </span>
          </Link>

          <nav className="hidden items-center gap-9 lg:flex">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "text-[11px] tracking-[0.22em] uppercase transition-colors",
                  pathname.startsWith(l.href)
                    ? "text-gold"
                    : lightText
                      ? "text-ivory/80 hover:text-gold"
                      : "text-ink/70 hover:text-ink",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/account"
              className={cn(
                "hidden text-[11px] tracking-[0.22em] uppercase sm:inline",
                lightText ? "text-ivory/70 hover:text-gold" : "text-muted hover:text-ink",
              )}
            >
              My Visits
            </Link>
            <Link
              href="/book"
              className="hidden bg-gold px-5 py-2.5 text-[11px] tracking-[0.24em] uppercase text-ink transition-colors hover:bg-gold-bright md:inline-flex"
            >
              Book
            </Link>
            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              onClick={() => setOpen((v) => !v)}
              className="relative z-[60] grid h-10 w-10 place-items-center lg:hidden"
            >
              <span className="sr-only">Menu</span>
              <span className="flex h-4 w-6 flex-col justify-between">
                <span
                  className={cn(
                    "block h-px w-full origin-center transition-all duration-400",
                    lightText ? "bg-ivory" : "bg-ink",
                    open && "translate-y-[7.5px] rotate-45 bg-ink",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-full transition-all duration-400",
                    lightText ? "bg-ivory" : "bg-ink",
                    open && "opacity-0",
                  )}
                />
                <span
                  className={cn(
                    "block h-px w-full origin-center transition-all duration-400",
                    lightText ? "bg-ivory" : "bg-ink",
                    open && "-translate-y-[7.5px] -rotate-45 bg-ink",
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-ivory transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] lg:hidden",
          open ? "translate-y-0" : "-translate-y-full",
        )}
      >
        <div className="flex h-full flex-col justify-between overflow-y-auto px-6 pb-[max(2.5rem,env(safe-area-inset-bottom))] pt-24">
          <nav className="flex flex-col gap-1">
            {[
              { href: "/", label: "Home" },
              ...links,
              { href: "/book", label: "Book Appointment" },
              { href: "/account", label: "My Visits" },
            ].map((l, i) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${120 + i * 60}ms` : "0ms" }}
                className={cn(
                  "font-display text-[2.15rem] leading-tight text-ink transition-all duration-500 sm:text-4xl",
                  open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="mt-8 flex flex-col gap-3">
            <Link
              href="/book"
              onClick={() => setOpen(false)}
              className="flex h-12 items-center justify-center bg-gold text-[11px] tracking-[0.2em] uppercase text-ink"
            >
              Book Appointment
            </Link>
            <a
              href={site.phoneHref}
              className="flex h-12 items-center justify-center border border-gold/40 text-[11px] tracking-[0.2em] uppercase"
            >
              Call {site.phone}
            </a>
            <p className="kicker mt-4">Visit</p>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted">
              {site.address.street}
              <br />
              {site.address.city}, {site.address.state} {site.address.zip}
            </p>
            <a href={site.phoneHref} className="mt-4 inline-block text-lg text-ink">
              {site.phone}
            </a>
          </div>
        </div>
      </div>
    </>
  );
}
