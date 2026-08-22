import type { GalleryItem } from "./types";

function labelFor(category: string) {
  const known: Record<string, string> = {
    braids: "Braids",
    knotless: "Knotless",
    twists: "Twists",
    cornrows: "Cornrows",
    kids: "Kids",
    special: "Special Styles",
    styles: "Styles",
    gallery: "Gallery",
    home: "Home",
  };
  if (known[category]) return known[category];
  return category
    .split("-")
    .filter(Boolean)
    .map((part) => part[0]?.toUpperCase() + part.slice(1))
    .join(" ");
}

export function galleryFilters(items: GalleryItem[]) {
  const unique = [...new Set(items.map((item) => item.category).filter(Boolean))];
  return [
    { id: "all" as const, label: "All" },
    ...unique.map((id) => ({ id, label: labelFor(id) })),
  ];
}
