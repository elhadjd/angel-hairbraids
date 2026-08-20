import type { Metadata } from "next";
import { SiteShell } from "@/components/layout/site-shell";
import { Button, Container, SectionHeading } from "@/components/ui/button";
import { formattedAddress, site } from "@/lib/site";
import { FinalCta } from "@/components/home/final-cta";

export const metadata: Metadata = {
  title: "Visit the Salon",
  description: `Visit ${site.name} at ${formattedAddress}. Book African hair braiding in Columbus, Ohio.`,
};

export default function ContactPage() {
  return (
    <SiteShell>
      <section className="bg-ivory pt-32 pb-24">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <SectionHeading
              kicker="Visit"
              title="The atelier is appointment only."
              copy="We keep the room quiet and the calendar considered. Book online, or call if you need a consultation for a wedding party or photoshoot."
            />
            <dl className="mt-12 space-y-8">
              <div>
                <dt className="kicker">Address</dt>
                <dd className="mt-3 text-lg">{formattedAddress}</dd>
              </div>
              <div>
                <dt className="kicker">Telephone</dt>
                <dd className="mt-3">
                  <a href={site.phoneHref} className="text-lg">
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="kicker">Email</dt>
                <dd className="mt-3">
                  <a href={`mailto:${site.email}`}>{site.email}</a>
                </dd>
              </div>
            </dl>
            <div className="mt-10">
              <Button href="/book">Book Your Appointment</Button>
            </div>
          </div>
          <div className="lg:col-span-6">
            <p className="kicker">Hours</p>
            <ul className="mt-6 divide-y divide-gold/25 border-y border-gold/25">
              {site.hours.map((h) => (
                <li key={h.day} className="flex justify-between py-4 text-sm">
                  <span>{h.day}</span>
                  <span>{h.open ? `${h.open} – ${h.close}` : "Closed"}</span>
                </li>
              ))}
            </ul>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(formattedAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="mt-8 flex min-h-64 items-end bg-espresso p-6 text-ivory"
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
          </div>
        </Container>
      </section>
      <FinalCta />
    </SiteShell>
  );
}
