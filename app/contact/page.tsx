import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container, SectionHeading } from "@/components/ui/button";
import { formattedAddress, site } from "@/lib/site";
import { FinalCta } from "@/components/home/final-cta";
import { ContactForm } from "@/components/contact/form";
import { getSiteCatalog } from "@/lib/catalog";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Visit the Salon",
  description: `Visit ${site.name} at ${formattedAddress}. Book African hair braiding in Columbus, Ohio.`,
};

export default async function ContactPage() {
  const { services } = await getSiteCatalog();

  return (
    <SiteShell>
      <section className="bg-ivory pt-32 pb-24">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              kicker="Write to us"
              title="Tell us the look you have in mind."
              copy="Share a little about your hair, your timing, and the style you want. We will reply from the atelier — or book online if you already know the chair you need."
            />
            <div className="mt-10">
              <ContactForm services={services} />
            </div>
          </div>
          <div className="lg:col-span-6">
            <p className="kicker">Visit</p>
            <h2 className="mt-3 font-display text-4xl">The atelier</h2>
            <dl className="mt-8 space-y-6">
              <div>
                <dt className="text-[11px] tracking-[0.22em] uppercase text-muted">
                  Address
                </dt>
                <dd className="mt-2 text-lg">{formattedAddress}</dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.22em] uppercase text-muted">
                  Telephone
                </dt>
                <dd className="mt-2">
                  <a href={site.phoneHref} className="text-lg">
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[11px] tracking-[0.22em] uppercase text-muted">
                  Email
                </dt>
                <dd className="mt-2">
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </dd>
              </div>
            </dl>
            <p className="mt-8 kicker">Hours</p>
            <ul className="mt-4 divide-y divide-gold/25 border-y border-gold/25">
              {site.hours.map((h) => (
                <li key={h.day} className="flex justify-between gap-3 py-4 text-sm">
                  <span>{h.day}</span>
                  <span className="shrink-0 text-right">
                    {h.open ? `${h.open} – ${h.close}` : "Closed"}
                  </span>
                </li>
              ))}
            </ul>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(formattedAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex min-h-56 items-end bg-espresso p-6 text-ivory"
            >
              <span>
                <span className="kicker">Map</span>
                <span className="mt-2 block font-display text-3xl">
                  Mock Rd, Columbus
                </span>
                <span className="mt-2 block text-sm text-ivory/60">
                  Open in Google Maps
                </span>
              </span>
            </a>
            <div className="mt-8">
              <Button href="/book" className="w-full sm:w-auto">Book Your Appointment</Button>
            </div>
          </div>
        </Container>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
