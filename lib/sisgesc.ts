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

function apiHost() {
  return (process.env.SITE_API_HOST ?? "").replace(/\/$/, "");
}

function apiKey() {
  return process.env.SITE_API_KEY ?? "";
}

export function isSiteApiConfigured() {
  return Boolean(apiHost() && apiKey());
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

export async function siteApiGet(
  path: string,
  query: Record<string, string | number | boolean | undefined> = {},
): Promise<SiteApiResult> {
  const host = apiHost();
  const key = apiKey();
  if (!host || !key) return missingConfig();

  const params = new URLSearchParams();
  for (const [name, value] of Object.entries(query)) {
    if (value === undefined || value === "") continue;
    params.set(name, String(value));
  }
  const qs = params.toString();
  const res = await fetch(`${host}${path}${qs ? `?${qs}` : ""}`, {
    headers: { Accept: "application/json", key },
    next: { revalidate: 60 },
  });
  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.ok, status: res.status, data };
}

async function siteApiPost(
  path: string,
  body: Record<string, unknown>,
): Promise<SiteApiResult> {
  const host = apiHost();
  const key = apiKey();
  if (!host || !key) return missingConfig();

  const res = await fetch(`${host}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      key,
    },
    body: JSON.stringify(body),
  });

  const data = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  return { ok: res.status === 201 || res.ok, status: res.status, data };
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
  return siteApiGet("/api/site/media", query);
}

export async function fetchSiteProducts() {
  const primary = await siteApiGet("/api/site/products");
  if (primary.ok || primary.status !== 404) return primary;
  return siteApiGet("/api/site/catalog/products");
}

export async function fetchCatalogPriceLists() {
  return siteApiGet("/api/site/catalog-price-lists");
}

export async function fetchErpPriceLists() {
  return siteApiGet("/api/site/price-lists");
}

export async function quoteProductPrice(productId: number, quantity = 1) {
  return siteApiPost("/api/site/price-lists/quote", {
    product_id: productId,
    quantity,
  });
}

export async function submitSiteContact(payload: ContactPayload) {
  return siteApiPost("/api/site/contacts/submit", {
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

  return siteApiPost("/api/site/appointments/submit", body);
}

export async function confirmSiteAppointmentPayment(input: {
  appointmentId: number;
  sessionId: string;
}) {
  return siteApiPost("/api/site/appointments/confirm-payment", {
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
