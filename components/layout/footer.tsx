import Link from "next/link";
import { formattedAddress, site } from "@/lib/site";
import { Container } from "@/components/ui/button";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-espresso text-ivory">
      <div className="pattern-veil pointer-events-none absolute inset-0" />
      <Container className="relative py-20">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="font-display text-4xl">Angel</p>
            <p className="mt-1 text-[11px] tracking-[0.32em] uppercase text-gold">
              African Hair Braiding
            </p>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-ivory/65">
              A private Columbus atelier for African braiding — where heritage
              technique meets contemporary luxury.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <p className="kicker">Explore</p>
              <ul className="mt-5 space-y-3 text-sm text-ivory/75">
                <li>
                  <Link href="/services">Services</Link>
                </li>
                <li>
                  <Link href="/gallery">Gallery</Link>
                </li>
                <li>
                  <Link href="/about">The Salon</Link>
                </li>
                <li>
                  <Link href="/book">Book</Link>
                </li>
                <li>
                  <Link href="/account">My Visits</Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="kicker">Visit</p>
              <p className="mt-5 text-sm leading-relaxed text-ivory/75">
                {formattedAddress}
              </p>
              <a href={site.phoneHref} className="mt-3 block text-sm text-gold">
                {site.phone}
              </a>
              <a href={`mailto:${site.email}`} className="mt-1 block text-sm text-ivory/75">
                {site.email}
              </a>
            </div>
            <div>
              <p className="kicker">Hours</p>
              <ul className="mt-5 space-y-1.5 text-sm text-ivory/75">
                {site.hours.map((h) => (
                  <li key={h.day} className="flex justify-between gap-4">
                    <span>{h.day.slice(0, 3)}</span>
                    <span>{h.open ? `${h.open}–${h.close}` : "Closed"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-16 flex flex-col gap-3 border-t border-gold/20 pt-8 text-xs tracking-[0.16em] uppercase text-ivory/40 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {site.name}</p>
          <div className="flex gap-6">
            <a href={site.instagram} target="_blank" rel="noreferrer">
              Instagram
            </a>
            <Link href="/admin">Atelier</Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
