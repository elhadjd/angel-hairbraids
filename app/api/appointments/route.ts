import { NextRequest } from "next/server";
import { createId, createReference, readStore, updateStore } from "@/lib/store";
import { confirmationHtml, sendConfirmationEmail } from "@/lib/email";
import { assignStylist, getAvailableSlots, getHoursSlots } from "@/lib/availability";
import { getSiteCatalog } from "@/lib/catalog";
import {
  isSiteApiConfigured,
  siteApiMessage,
  siteDepositAmount,
  splitPersonName,
  submitSiteAppointment,
} from "@/lib/sisgesc";
import { site } from "@/lib/site";
import type { Appointment, BookingPayload } from "@/lib/types";

function requestOrigin(request: NextRequest) {
  const headerOrigin = request.headers.get("origin");
  if (headerOrigin) return headerOrigin.replace(/\/$/, "");
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host");
  if (host) {
    const proto = request.headers.get("x-forwarded-proto") || "https";
    return `${proto}://${host}`;
  }
  return site.url.replace(/\/$/, "");
}

export async function GET() {
  const store = await readStore();
  return Response.json({
    appointments: store.appointments,
  });
}

export async function POST(request: NextRequest) {
  const body = (await request.json()) as BookingPayload;
  const required = [
    "date",
    "time",
    "customerPhone",
    "customerEmail",
  ] as const;

  for (const key of required) {
    if (!body[key]) {
      return Response.json({ error: `Missing ${key}` }, { status: 400 });
    }
  }

  const split = splitPersonName(body.customerName ?? "");
  const firstName = (body.firstName ?? split.firstName).trim();
  const lastName = (body.lastName ?? split.lastName).trim();
  const customerName = `${firstName} ${lastName}`.trim();

  if (!firstName || !lastName) {
    return Response.json({ error: "First name and last name are required." }, { status: 400 });
  }

  const [store, catalog] = await Promise.all([readStore(), getSiteCatalog()]);
  const requestedService = (body.serviceId ?? "").trim();
  const service = requestedService
    ? catalog.services.find(
        (s) => s.id === requestedService || s.slug === requestedService,
      ) ??
      store.services.find(
        (s) => s.id === requestedService || s.slug === requestedService,
      ) ??
      null
    : null;
  const style = body.styleId
    ? catalog.styles.find((s) => s.id === body.styleId) ??
      store.styles.find((s) => s.id === body.styleId)
    : null;

  if (requestedService && !service) {
    return Response.json({ error: "Invalid service" }, { status: 400 });
  }

  const durationMin = style?.durationMin ?? service?.durationMin ?? 180;
  const price = style?.priceFrom ?? service?.priceFrom ?? 0;
  const hoursSlots = getHoursSlots({
    date: body.date,
    durationMin,
    appointments: store.appointments,
  });
  const stylist =
    (body.stylistId
      ? store.stylists.find((s) => s.id === body.stylistId)
      : null) ??
    assignStylist({
      stylists: store.stylists,
      date: body.date,
      time: body.time,
      durationMin,
      appointments: store.appointments,
      serviceId: service?.id,
    }) ??
    store.stylists[0] ??
    catalog.stylists[0];

  const stylistSlots = stylist
    ? getAvailableSlots({
        stylist,
        date: body.date,
        durationMin,
        appointments: store.appointments,
      })
    : [];
  const slots = hoursSlots.length ? hoursSlots : stylistSlots;

  if (!slots.includes(body.time)) {
    return Response.json(
      { error: "That time is no longer available." },
      { status: 409 },
    );
  }

  if (!stylist) {
    return Response.json({ error: "No chair is configured." }, { status: 409 });
  }

  const now = new Date().toISOString();
  const depositAmount = siteDepositAmount() || Math.min(50, Math.round(price * 0.15));
  const origin = requestOrigin(request);

  let provider: "sisgesc" | "local" = "local";
  let externalId: string | undefined;
  let payment: Record<string, unknown> | null = null;
  let remoteMessage = "";

  if (isSiteApiConfigured()) {
    const result = await submitSiteAppointment({
      firstName,
      lastName,
      email: body.customerEmail.trim().toLowerCase(),
      phone: body.customerPhone.trim().slice(0, 20),
      date: body.date,
      time: body.time.length === 5 ? body.time : body.time.slice(0, 5),
      service: service?.productId ?? service?.name,
      notes: (body.notes ?? "").trim() || undefined,
      metadata: {
        style: style?.name,
        stylist: stylist.name,
        duration_min: durationMin,
      },
      origin,
    });

    if (!result.ok) {
      const message = siteApiMessage(
        result.data,
        result.status === 503
          ? "The salon booking system is unavailable. Please try again or call us."
          : "Your appointment could not be reserved. Please try again.",
      );
      console.error("SISGESC appointment rejected", result.status, result.data);
      return Response.json(
        { error: message, details: result.data, success: false },
        { status: result.status === 422 || result.status === 403 ? result.status : 502 },
      );
    }

    provider = "sisgesc";
    const payload = (result.data.data ?? result.data) as Record<string, unknown>;
    const apt = (payload.appointment ?? result.data.appointment ?? {}) as Record<
      string,
      unknown
    >;
    if (apt.id != null) externalId = String(apt.id);
    payment =
      (payload.payment as Record<string, unknown>) ??
      (result.data.payment as Record<string, unknown>) ??
      null;
    remoteMessage = siteApiMessage(result.data, "Appointment created successfully.");
  }

  const appointment: Appointment = {
    id: createId("apt"),
    reference: createReference(),
    serviceId: service?.id ?? "",
    styleId: style?.id ?? null,
    stylistId: stylist.id,
    date: body.date,
    time: body.time,
    durationMin,
    price,
    status: "pending",
    customerName,
    customerPhone: body.customerPhone.trim().slice(0, 20),
    customerEmail: body.customerEmail.trim().toLowerCase(),
    notes: (body.notes ?? "").trim(),
    deposit: {
      required: Boolean(siteDepositAmount() || payment),
      amount: depositAmount,
      status: payment?.status === "pending" ? "unpaid" : "unpaid",
    },
    externalId,
    provider,
    createdAt: now,
    updatedAt: now,
  };

  await updateStore((current) => {
    const email = appointment.customerEmail;
    const existing = current.customers.find((c) => c.email === email);
    const customers = existing
      ? current.customers
      : [
          ...current.customers,
          {
            id: createId("cus"),
            name: appointment.customerName,
            email,
            phone: appointment.customerPhone,
            favoriteStyleIds: style ? [style.id] : [],
            createdAt: now,
          },
        ];

    const html = confirmationHtml({
      appointment,
      service,
      stylist,
      styleName: style?.name,
    });

    return {
      ...current,
      appointments: [...current.appointments, appointment],
      customers,
      emails: [
        ...current.emails,
        {
          id: createId("em"),
          to: email,
          subject: `Appointment reserved · ${appointment.reference}`,
          html,
          createdAt: now,
        },
      ],
    };
  });

  const html = confirmationHtml({
    appointment,
    service,
    stylist,
    styleName: style?.name,
  });
  await sendConfirmationEmail({
    to: appointment.customerEmail,
    subject: `Appointment reserved · ${appointment.reference} · Angel African Hair Braiding`,
    html,
  });

  return Response.json(
    {
      success: true,
      message: remoteMessage || "Appointment created successfully.",
      appointment: {
        ...appointment,
        id: externalId ?? appointment.id,
        localId: appointment.id,
        reference: appointment.reference,
      },
      payment,
    },
    { status: 201 },
  );
}
