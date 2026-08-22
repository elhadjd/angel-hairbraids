import { seedStore } from "./seed";
import {
  fetchCatalogPriceLists,
  fetchErpPriceLists,
  fetchSiteMedia,
  fetchSiteProducts,
  isSiteApiConfigured,
  quoteProductPrice,
  resolveMediaUrl,
  resolveSiteApiHost,
  unwrapList,
} from "./sisgesc";
import { readStore } from "./store";
import type {
  CatalogPriceGroup,
  CatalogPriceItem,
  GalleryItem,
  Service,
  SiteApiProbe,
  SiteCatalog,
  SiteMediaAsset,
  StyleLook,
} from "./types";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
}

function asString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function asNumber(...values: unknown[]) {
  for (const value of values) {
    const n = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function asBool(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true";
}

function slugify(value: string) {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 80) || "service"
  );
}

function pickImage(raw: Record<string, unknown>) {
  const nested = asRecord(raw.image);
  const firstImage = Array.isArray(raw.images) ? asRecord(raw.images[0]) : null;
  const firstMedia = Array.isArray(raw.media) ? asRecord(raw.media[0]) : null;
  return resolveMediaUrl(
    asString(
      raw.media_url,
      raw.thumbnail_url,
      raw.featured_image,
      raw.image_url,
      raw.cover,
      raw.photo,
      raw.thumbnail,
      typeof raw.image === "string" ? raw.image : "",
      nested?.url,
      nested?.media_url,
      nested?.src,
      firstImage?.url,
      firstImage?.media_url,
      firstImage?.src,
      firstMedia?.url,
      firstMedia?.media_url,
      firstMedia?.src,
    ),
  );
}

function inferCategory(value: string): string {
  const hay = value.toLowerCase();
  if (hay.includes("knotless")) return "knotless";
  if (hay.includes("twist")) return "twists";
  if (hay.includes("cornrow")) return "cornrows";
  if (hay.includes("kid") || hay.includes("child")) return "kids";
  if (hay.includes("fulani") || hay.includes("goddess") || hay.includes("bridal") || hay.includes("special")) {
    return "special";
  }
  if (hay.includes("braid") || hay.includes("box")) return "braids";
  return hay.replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "styles";
}

function flattenMedia(payload: unknown): SiteMediaAsset[] {
  const rows = unwrapList(payload);
  const assets: SiteMediaAsset[] = [];

  for (const row of rows) {
    const nestedAssets = unwrapList(
      row.media_assets ?? row.assets ?? row.media,
    );
    const group = asRecord(row.group);
    if (nestedAssets.length) {
      for (const asset of nestedAssets) {
        assets.push(mapMediaAsset(asset, row));
      }
      continue;
    }
    assets.push(mapMediaAsset(row, group ?? undefined));
  }

  return assets
    .filter((asset) => asset.mediaUrl || asset.thumbnailUrl)
    .sort((a, b) => a.sortOrder - b.sortOrder);
}

function mapMediaAsset(
  raw: Record<string, unknown>,
  group?: Record<string, unknown>,
): SiteMediaAsset {
  const attachedGroup = asRecord(raw.group) ?? group;
  return {
    id: asString(raw.id) || `media-${asString(raw.title, raw.sort_order) || "item"}`,
    type: asString(raw.type) || "image",
    title: asString(raw.title, raw.name),
    description: asString(raw.description),
    mediaUrl: resolveMediaUrl(asString(raw.media_url, raw.url, raw.src, pickImage(raw))),
    thumbnailUrl: resolveMediaUrl(asString(raw.thumbnail_url, raw.thumb_url)),
    placement: asString(
      raw.placement,
      attachedGroup?.placement,
      attachedGroup?.name,
    ).toLowerCase(),
    groupName: asString(attachedGroup?.name, raw.group_name),
    buttonLabel: asString(raw.button_label, raw.cta_label),
    buttonUrl: asString(raw.button_url, raw.cta_url),
    featured: asBool(raw.is_featured ?? raw.featured),
    sortOrder: asNumber(raw.sort_order, raw.order) ?? 0,
  };
}

function byPlacement(assets: SiteMediaAsset[], ...needles: string[]) {
  return assets.filter((asset) =>
    needles.some(
      (needle) =>
        asset.placement.includes(needle) ||
        asset.groupName.toLowerCase().includes(needle),
    ),
  );
}

function mapProduct(raw: Record<string, unknown>, index: number): Service {
  const categoryRaw = asRecord(raw.category);
  const metadata = asRecord(raw.metadata) ?? {};
  const name = asString(raw.name, raw.title, raw.designation) || `Service ${index + 1}`;
  const slug = asString(raw.slug, raw.sku) || slugify(name);
  const description = asString(
    raw.description,
    raw.short_description,
    raw.excerpt,
    raw.details,
  );
  const longDescription = asString(
    raw.long_description,
    raw.body,
    raw.content,
    description,
  );
  const price =
    asNumber(
      raw.sale_price,
      raw.final_price,
      raw.price,
      raw.unit_price,
      raw.amount,
      raw.price_from,
      metadata.price,
    ) ?? 0;
  const duration =
    asNumber(
      raw.duration_min,
      raw.duration,
      metadata.duration_min,
      metadata.duration,
    ) ?? 180;
  const durationMax =
    asNumber(raw.duration_max, metadata.duration_max) ?? duration;
  const category = inferCategory(
    asString(categoryRaw?.name, raw.category, raw.type, name),
  );
  const productId = asNumber(raw.id, raw.product_id);

  return {
    id: productId != null ? `prd-${productId}` : `prd-${slug}`,
    slug,
    name,
    tagline: asString(raw.tagline, raw.subtitle, categoryRaw?.name) || category,
    description: description || longDescription,
    longDescription: longDescription || description,
    priceFrom: price,
    durationMin: duration,
    durationMax,
    image: pickImage(raw) || "/images/style-knotless.jpg",
    featured: asBool(raw.is_featured ?? raw.featured ?? raw.is_highlighted),
    category,
    productId: productId ?? undefined,
    currency: asString(raw.currency, metadata.currency) || undefined,
    priceLabel: asString(raw.price_label, metadata.price_label) || undefined,
  };
}

function mapProductStyles(raw: Record<string, unknown>, service: Service): StyleLook[] {
  const variants = unwrapList(raw.variants ?? raw.styles ?? raw.items);
  return variants.map((variant, index) => {
    const name = asString(variant.name, variant.title) || `${service.name} ${index + 1}`;
    return {
      id: asString(variant.id) ? `stl-${variant.id}` : `stl-${service.id}-${index}`,
      slug: asString(variant.slug) || slugify(name),
      name,
      description: asString(variant.description),
      category: service.category,
      serviceId: service.id,
      image: pickImage(variant) || service.image,
      durationMin: asNumber(variant.duration_min, variant.duration) ?? service.durationMin,
      durationMax: asNumber(variant.duration_max) ?? service.durationMax,
      priceFrom: asNumber(variant.price, variant.sale_price, variant.amount) ?? service.priceFrom,
      featured: asBool(variant.is_featured ?? variant.featured),
    };
  });
}

function mapPriceTables(payload: unknown): CatalogPriceGroup[] {
  return unwrapList(payload)
    .filter((group) => asBool(group.is_active ?? true))
    .map((group) => ({
      id: asString(group.id) || slugify(asString(group.title, group.name)),
      title: asString(group.title, group.name) || "Price list",
      description: asString(group.description),
      items: unwrapList(group.items)
        .filter((item) => asBool(item.is_active ?? true))
        .map((item) => ({
          id: asString(item.id) || slugify(asString(item.title, item.name)),
          title: asString(item.title, item.name) || "Item",
          description: asString(item.description),
          price: asNumber(item.price),
          priceLabel: asString(item.price_label),
          badge: asString(item.badge),
          highlighted: asBool(item.is_highlighted ?? item.highlighted),
        } satisfies CatalogPriceItem)),
    }))
    .filter((group) => group.items.length > 0);
}

function galleryFromMedia(assets: SiteMediaAsset[]): GalleryItem[] {
  return assets.map((asset) => ({
    id: `media-${asset.id}`,
    title: asset.title || asset.groupName || "Style",
    description: asset.description,
    image: asset.thumbnailUrl || asset.mediaUrl,
    category: inferCategory(asset.placement || asset.groupName || asset.title),
    styleId: "",
    serviceId: "",
    durationLabel: "",
    priceFrom: 0,
    type: asset.type.includes("video") ? "video" : "image",
    buttonLabel: asset.buttonLabel || null,
    buttonUrl: asset.buttonUrl || null,
  }));
}

function galleryFromServices(services: Service[]): GalleryItem[] {
  return services
    .filter((service) => service.image)
    .map((service) => ({
      id: `svc-gal-${service.id}`,
      title: service.name,
      description: service.description,
      image: service.image,
      category: service.category,
      styleId: "",
      serviceId: service.id,
      durationLabel: "",
      priceFrom: service.priceFrom,
    }));
}

function probe(ok: boolean, status: number, count: number): SiteApiProbe {
  return { ok, status, count };
}

function localCatalog(diagnostics?: SiteCatalog["diagnostics"]): SiteCatalog {
  const seed = seedStore();
  return {
    source: "local",
    services: seed.services,
    styles: seed.styles,
    stylists: seed.stylists,
    gallery: seed.gallery,
    testimonials: seed.testimonials,
    priceTables: [],
    media: {
      home: [],
      gallery: [],
      about: [],
      product: [],
      instagram: [],
      featured: [],
      all: [],
    },
    currency: "USD",
    diagnostics,
  };
}

export async function getSiteCatalog(): Promise<SiteCatalog> {
  if (!isSiteApiConfigured()) {
    return localCatalog({
      configured: false,
      host: "",
      media: probe(false, 0, 0),
      products: probe(false, 0, 0),
      catalogPrices: probe(false, 0, 0),
      priceLists: probe(false, 0, 0),
    });
  }

  try {
    const [groupedMedia, productsRes, catalogPricesRes, erpPricesRes] =
      await Promise.all([
        fetchSiteMedia({ grouped: 1 }),
        fetchSiteProducts(),
        fetchCatalogPriceLists(),
        fetchErpPriceLists(),
      ]);

    let media = flattenMedia(groupedMedia.ok ? groupedMedia.data : []);
    let mediaRes = groupedMedia;
    if (!media.length) {
      const flatMedia = await fetchSiteMedia();
      mediaRes = flatMedia;
      media = flattenMedia(flatMedia.ok ? flatMedia.data : []);
    }

    const products = unwrapList(productsRes.ok ? productsRes.data : []);
    const services = products.map(mapProduct);
    const styles = products.flatMap((product, index) =>
      mapProductStyles(product, services[index]),
    );
    const priceTables = mapPriceTables(
      catalogPricesRes.ok ? catalogPricesRes.data : [],
    );
    const erpLists = unwrapList(erpPricesRes.ok ? erpPricesRes.data : []);
    const currency =
      asString(erpLists[0]?.currency, services.find((s) => s.currency)?.currency) ||
      "USD";

    const diagnostics = {
      configured: true,
      host: resolveSiteApiHost(),
      media: probe(mediaRes.ok, mediaRes.status, media.length),
      products: probe(productsRes.ok, productsRes.status, products.length),
      catalogPrices: probe(
        catalogPricesRes.ok,
        catalogPricesRes.status,
        priceTables.length,
      ),
      priceLists: probe(erpPricesRes.ok, erpPricesRes.status, erpLists.length),
    };

    const reachedApi =
      mediaRes.ok || productsRes.ok || catalogPricesRes.ok || erpPricesRes.ok;

    if (!reachedApi) {
      console.error("SISGESC catalog unreachable", diagnostics);
      return localCatalog(diagnostics);
    }

    const galleryMedia = byPlacement(media, "gallery", "portfolio", "look");
    const gallery = [
      ...galleryFromMedia(galleryMedia.length ? galleryMedia : media),
      ...galleryFromServices(services),
    ].filter(
      (item, index, list) =>
        item.image && list.findIndex((other) => other.image === item.image) === index,
    );

    const seed = seedStore();
    return {
      source: "sisgesc",
      services,
      styles,
      stylists: seed.stylists,
      gallery,
      testimonials: seed.testimonials,
      priceTables,
      media: {
        home: byPlacement(media, "home", "hero", "banner"),
        gallery: galleryMedia,
        about: byPlacement(media, "about", "salon", "story"),
        product: byPlacement(media, "product", "service"),
        instagram: byPlacement(media, "instagram", "social"),
        featured: media.filter((asset) => asset.featured),
        all: media,
      },
      currency,
      diagnostics,
    };
  } catch (error) {
    console.error("SISGESC catalog load failed", error);
    return localCatalog({
      configured: true,
      host: resolveSiteApiHost(),
      media: probe(false, 503, 0),
      products: probe(false, 503, 0),
      catalogPrices: probe(false, 503, 0),
      priceLists: probe(false, 503, 0),
    });
  }
}

export async function getQuotedPrice(productId?: number) {
  if (!productId || !isSiteApiConfigured()) return null;
  const result = await quoteProductPrice(productId, 1);
  if (!result.ok) return null;
  const data = asRecord(result.data)?.data ?? result.data;
  const record = asRecord(data);
  if (!record) return null;
  return asNumber(record.sale_price, record.final_price, record.base_price);
}

export async function getPublicCatalog() {
  const catalog = await getSiteCatalog();
  const store = await readStore();
  return {
    ...catalog,
    appointments: store.appointments,
    customers: store.customers,
  };
}
