import { formattedAddress, site } from "@/lib/site";

export function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "HairSalon",
    name: site.name,
    image: `${site.url}/images/salon-interior.jpg`,
    url: site.url,
    telephone: site.phone,
    email: site.email,
    priceRange: "$$",
    description: site.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: site.address.street,
      addressLocality: site.address.city,
      addressRegion: site.address.state,
      postalCode: site.address.zip,
      addressCountry: site.address.country,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: site.geo.lat,
      longitude: site.geo.lng,
    },
    sameAs: [site.instagram],
    openingHoursSpecification: site.hours
      .filter((h) => h.open && h.close)
      .map((h) => ({
        "@type": "OpeningHoursSpecification",
        dayOfWeek: h.day,
        opens: to24(h.open as string),
        closes: to24(h.close as string),
      })),
    areaServed: "Columbus, Ohio",
    slogan: site.tagline,
    hasMap: `https://maps.google.com/?q=${encodeURIComponent(formattedAddress)}`,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function to24(label: string) {
  const [time, mer] = label.split(" ");
  const [h, m] = time.split(":");
  let hour = Number(h);
  if (mer === "PM" && hour !== 12) hour += 12;
  if (mer === "AM" && hour === 12) hour = 0;
  return `${String(hour).padStart(2, "0")}:${m}:00`;
}
