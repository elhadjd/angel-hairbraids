export const site = {
  name: "Angel African Hair Braiding",
  shortName: "Angel",
  tagline: "Where African Beauty Meets Modern Style.",
  description:
    "Columbus, Ohio’s luxury African hair braiding salon specializing in knotless braids, box braids, cornrows, twists, and premium natural hair care.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://angelafricanhairbraiding.com",
  phone: "(614) 369-6788",
  phoneHref: "tel:+16143696788",
  email: "angelddie@yahoo.com",
  instagram: "https://instagram.com/angelafricanhairbraiding",
  instagramHandle: "@angelafricanhairbraiding",
  address: {
    street: "2236 Mock Rd",
    city: "Columbus",
    state: "OH",
    zip: "43219",
    country: "US",
  },
  hours: [
    { day: "Monday", open: "8:00 AM", close: "7:00 PM" },
    { day: "Tuesday", open: "8:00 AM", close: "7:00 PM" },
    { day: "Wednesday", open: "8:00 AM", close: "7:00 PM" },
    { day: "Thursday", open: "8:00 AM", close: "7:00 PM" },
    { day: "Friday", open: "8:00 AM", close: "8:00 PM" },
    { day: "Saturday", open: "8:00 AM", close: "8:00 PM" },
    { day: "Sunday", open: "8:00 AM", close: "7:00 PM" },
  ],
  closedWeekday: 1,
  geo: { lat: 40.01206, lng: -82.9488 },
  founded: 2014,
} as const;

export const formattedAddress = `${site.address.street}, ${site.address.city}, ${site.address.state} ${site.address.zip}`;

export const locationLabel = `${site.address.city}, ${site.address.state}`;

export const keywords = [
  "African Hair Braiding",
  "Hair Braiding Salon",
  "Knotless Braids",
  "African Braids",
  "Braiding Salon Near Me",
  "Box Braids Columbus Ohio",
  "Cornrows Columbus",
  "Senegalese Twists",
  "Fulani Braids",
  "Goddess Braids",
  "Kids Braids Columbus OH",
  "African Hair Braiding Columbus",
];
