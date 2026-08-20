export const site = {
  name: "Angel African Hair Braiding",
  shortName: "Angel",
  tagline: "Where African Beauty Meets Modern Style.",
  description:
    "Atlanta’s luxury African hair braiding salon specializing in knotless braids, box braids, cornrows, twists, and premium natural hair care.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://angelafricanhairbraiding.com",
  phone: "(404) 555-2847",
  phoneHref: "tel:+14045552847",
  email: "hello@angelafricanhairbraiding.com",
  instagram: "https://instagram.com/angelafricanhairbraiding",
  instagramHandle: "@angelafricanhairbraiding",
  address: {
    street: "1847 Peachtree Road NE, Suite 200",
    city: "Atlanta",
    state: "GA",
    zip: "30309",
    country: "US",
  },
  hours: [
    { day: "Monday", open: null, close: null },
    { day: "Tuesday", open: "9:00 AM", close: "7:00 PM" },
    { day: "Wednesday", open: "9:00 AM", close: "7:00 PM" },
    { day: "Thursday", open: "9:00 AM", close: "7:00 PM" },
    { day: "Friday", open: "8:00 AM", close: "8:00 PM" },
    { day: "Saturday", open: "8:00 AM", close: "8:00 PM" },
    { day: "Sunday", open: "11:00 AM", close: "5:00 PM" },
  ],
  closedWeekday: 1,
  geo: { lat: 33.8053, lng: -84.3902 },
  founded: 2014,
} as const;

export const formattedAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;

export const keywords = [
  "African Hair Braiding",
  "Hair Braiding Salon",
  "Knotless Braids",
  "African Braids",
  "Braiding Salon Near Me",
  "Box Braids Atlanta",
  "Cornrows Atlanta",
  "Senegalese Twists",
  "Fulani Braids",
  "Goddess Braids",
  "Kids Braids Atlanta",
];
