import type { MetadataRoute } from "next";
import { site } from "@/lib/site";
import { seedStore } from "@/lib/seed";

export default function sitemap(): MetadataRoute.Sitemap {
  const services = seedStore().services;
  const now = new Date();
  const staticRoutes = [
    "",
    "/about",
    "/services",
    "/gallery",
    "/book",
    "/contact",
    "/account",
  ].map((path) => ({
    url: `${site.url}${path}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  return [
    ...staticRoutes,
    ...services.map((s) => ({
      url: `${site.url}/services/${s.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
