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

async function siteApiPost(
  path: string,
  body: Record<string, unknown>,
): Promise<SiteApiResult> {
  const host = apiHost();
  const key = apiKey();
  if (!host || !key) {
    return {
      ok: false,
      status: 503,
      data: { message: "SITE_API_HOST and SITE_API_KEY are not configured." },
    };
  }

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
