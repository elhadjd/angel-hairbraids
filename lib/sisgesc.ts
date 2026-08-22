import { site } from "./site";

export type SiteApiResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
};

export type ContactPayload = {
  name: string;
  email: string;
  phone: string;
  subject?: string;
  message?: string;
  service?: string | number;
  serviceType?: string;
  pageUrl?: string;
};

export type AppointmentPayload = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  service?: string | number;
  notes?: string;
  metadata?: Record<string, unknown>;
  origin: string;
};

function stripEnvQuotes(value: string) {
  return value.trim().replace(/^['"]+|['"]+$/g, "");
}

/** Origin only. `http://localhost:8080/api/site` is accepted and reduced to `http://localhost:8080`. */
export function resolveSiteApiHost(raw = process.env.SITE_API_HOST ?? "") {
  let host = stripEnvQuotes(raw);
  host = host.replace(/\/+$/, "");
  host = host.replace(/\/api\/site$/i, "");
  host = host.replace(/\/+$/, "");
  return host;
}

function apiHost() {
  return resolveSiteApiHost();
}

function apiKey() {
  return stripEnvQuotes(process.env.SITE_API_KEY ?? "");
}

export function isSiteApiConfigured() {
  return Boolean(apiHost() && apiKey());
}

function isLocalPublicAsset(path: string) {
  return /^\/(?:images\/|icon|pattern)/.test(path);
}

function isSisgescFilePath(path: string) {
  return /^\/(?:produtos\/|storage\/|uploads\/|sites\/|media\/)/i.test(path);
}

/** Files live on the ERP origin, never on the Next.js host. */
export function resolveMediaUrl(src: string, host = apiHost()) {
  let value = src.trim();
  if (!value || value === "null" || value === "undefined") return "";
  if (value.startsWith("//")) value = `http:${value}`;
  if (/^https?:\/[^/]/i.test(value)) {
    value = value.replace(/^http:\//i, "http://").replace(/^https:\//i, "https://");
  }
  if (isLocalPublicAsset(value)) return value;

  const origin = host.replace(/\/+$/, "");

  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      if (!origin) return url.toString();
      const api = new URL(origin);
      if (url.origin === api.origin) return `${api.origin}${url.pathname}${url.search}`;
      if (isSisgescFilePath(url.pathname)) {
        return `${api.origin}${url.pathname}${url.search}`;
      }
      return url.toString();
    } catch {
      return value;
    }
  }

  const path = value.startsWith("/") ? value : `/${value}`;
  if (!origin) return path;
  return `${origin}${path}`;
}

export function siteDepositAmount() {
  const n = Number(process.env.SITE_API_DEPOSIT_AMOUNT ?? 0);
  return Number.isFinite(n) && n >= 0.01 ? n : 0;
}

function missingConfig(): SiteApiResult {
  return {
    ok: false,
    status: 503,
    data: { message: "SITE_API_HOST and SITE_API_KEY are not configured." },
  };
}

function asData(parsed: unknown): Record<string, unknown> {
  if (Array.isArray(parsed)) return { data: parsed };
  if (parsed && typeof parsed === "object") return parsed as Record<string, unknown>;
  return {};
}

function siteApiPath(path: string) {
  const suffix = path.replace(/^\/+/, "").replace(/^api\/site\/?/i, "");
  return `/api/site/${suffix}`;
}

function siteUrl(path: string, query: Record<string, string | number | boolean | undefined> = {}) {
  const host = apiHost();
  const key = apiKey();
  const url = new URL(`${host}${siteApiPath(path)}`);
  url.searchParams.set("key", key);
  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    url.searchParams.set(name, String(value));
  }
  return url.toString();
}

export function siteApiMessage(data: Record<string, unknown>, fallback: string) {
  if (typeof data.message === "string" && data.message.trim()) return data.message;
  if (typeof data.error === "string" && data.error.trim()) return data.error;
  const errors = data.errors;
  if (errors && typeof errors === "object") {
    const first = Object.values(errors as Record<string, unknown>)[0];
    if (Array.isArray(first) && first[0]) return String(first[0]);
    if (typeof first === "string" && first.trim()) return first;
  }
  return fallback;
}

async function readBody(res: Response) {
  return asData(await res.json().catch(() => ({})));
}

export async function siteApiGet(
  path: string,
  query: Record<string, string | number | boolean | undefined> = {},
): Promise<SiteApiResult> {
  const host = apiHost();
  const key = apiKey();
  if (!host || !key) return missingConfig();

  try {
    const res = await fetch(siteUrl(path, query), {
      headers: { Accept: "application/json", key },
      cache: "no-store",
    });
    const data = await readBody(res);
    return { ok: res.ok, status: res.status, data };
  } catch (error) {
    console.error("SISGESC GET failed", path, error);
    return {
      ok: false,
      status: 503,
      data: {
        message: `Could not reach SISGESC at ${host}. Check SITE_API_HOST and that the ERP is running.`,
      },
    };
  }
}

async function siteApiPost(
  path: string,
  body: Record<string, unknown>,
): Promise<SiteApiResult> {
  const host = apiHost();
  const key = apiKey();
  if (!host || !key) return missingConfig();

  try {
    const res = await fetch(siteUrl(path), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        key,
      },
      cache: "no-store",
      body: JSON.stringify(body),
    });

    const data = await readBody(res);
    return { ok: res.status === 201 || res.ok, status: res.status, data };
  } catch (error) {
    console.error("SISGESC POST failed", path, error);
    return {
      ok: false,
      status: 503,
      data: {
        message: `Could not reach SISGESC at ${host}. Check SITE_API_HOST and that the ERP is running.`,
      },
    };
  }
}

export function unwrapList(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item) => item && typeof item === "object") as Record<
      string,
      unknown
    >[];
  }
  if (!payload || typeof payload !== "object") return [];
  const record = payload as Record<string, unknown>;
  const candidates = [record.data, record.items, record.products, record.media];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate.filter((item) => item && typeof item === "object") as Record<
        string,
        unknown
      >[];
    }
    if (candidate && typeof candidate === "object") {
      const nested = unwrapList(candidate);
      if (nested.length) return nested;
    }
  }
  return [];
}

export async function fetchSiteMedia(query: Record<string, string | number | boolean | undefined> = {}) {
  return siteApiGet("media", query);
}

export async function fetchSiteProducts() {
  const primary = await siteApiGet("products");
  if (primary.ok || primary.status !== 404) return primary;
  return siteApiGet("catalog/products");
}

export async function fetchCatalogPriceLists() {
  return siteApiGet("catalog-price-lists");
}

export async function fetchErpPriceLists() {
  return siteApiGet("price-lists");
}

export async function quoteProductPrice(productId: number, quantity = 1) {
  return siteApiPost("price-lists/quote", {
    product_id: productId,
    quantity,
  });
}

export async function submitSiteContact(payload: ContactPayload) {
  return siteApiPost("contacts/submit", {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    subject: payload.subject || undefined,
    message: payload.message || undefined,
    service: payload.service || undefined,
    serviceType: payload.serviceType || undefined,
    metadata: {
      source: "website",
      salon: site.name,
    },
    page_url: payload.pageUrl,
  });
}

export async function submitSiteAppointment(payload: AppointmentPayload) {
  const amount = siteDepositAmount();
  const body: Record<string, unknown> = {
    first_name: payload.firstName,
    last_name: payload.lastName,
    email: payload.email,
    phone: payload.phone,
    date: payload.date,
    time: payload.time,
    service: payload.service || undefined,
    notes: payload.notes || undefined,
    metadata: {
      source: "website",
      salon: site.name,
      ...payload.metadata,
    },
  };

  if (amount > 0) {
    body.amount = amount;
    body.success_url = `${payload.origin}/book/success`;
    body.cancel_url = `${payload.origin}/book/cancelled`;
  }

  return siteApiPost("appointments/submit", body);
}

export async function confirmSiteAppointmentPayment(input: {
  appointmentId: number;
  sessionId: string;
}) {
  return siteApiPost("appointments/confirm-payment", {
    appointment_id: input.appointmentId,
    session_id: input.sessionId,
  });
}

export function splitPersonName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { firstName: "", lastName: "" };
  if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(" "),
  };
}
