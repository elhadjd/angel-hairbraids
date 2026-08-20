import { site } from "./site";

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

export type SiteContactResult = {
  ok: boolean;
  status: number;
  data: Record<string, unknown>;
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

export async function submitSiteContact(
  payload: ContactPayload,
): Promise<SiteContactResult> {
  const host = apiHost();
  const key = apiKey();
  if (!host || !key) {
    return {
      ok: false,
      status: 503,
      data: { message: "SITE_API_HOST and SITE_API_KEY are not configured." },
    };
  }

  const url = `${host}/api/site/contacts/submit`;
  const body = {
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
  };

  const res = await fetch(url, {
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
