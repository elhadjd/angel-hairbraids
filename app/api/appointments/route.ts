import { NextRequest } from "next/server";
import { createId, createReference, readStore, updateStore } from "@/lib/store";
import { confirmationHtml, sendConfirmationEmail } from "@/lib/email";
import { assignStylist, getAvailableSlots } from "@/lib/availability";
import {
  isSiteApiConfigured,
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
    "serviceId",
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

  const store = await readStore();
  const service = store.services.find((s) => s.id === body.serviceId);
  const style = body.styleId
    ? store.styles.find((s) => s.id === body.styleId)
    : null;

  if (!service) {
    return Response.json({ error: "Invalid service" }, { status: 400 });
  }

  const durationMin = style?.durationMin ?? service.durationMin;
  const price = style?.priceFrom ?? service.priceFrom;
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
      serviceId: service.id,
    });

  if (!stylist) {
    return Response.json(
      { error: "That time is no longer available." },
      { status: 409 },
    );
  }

  const slots = getAvailableSlots({
    stylist,
    date: body.date,
    durationMin,
    appointments: store.appointments,
  });

  if (!slots.includes(body.time)) {
    return Response.json(
      { error: "That time is no longer available." },
      { status: 409 },
    );
  }

  const now = new Date().toISOString();
  const depositAmount = siteDepositAmount() || Math.min(50, Math.round(price * 0.15));
  const origin = requestOrigin(request);

  let provider: "sisgesc" | "local" = "local";
  let externalId: string | undefined;
  let payment: Record<string, unknown> | null = null;
  let remoteMessage = "";

  if (isSiteApiConfigured()) {
    try {
      const result = await submitSiteAppointment({
        firstName,
        lastName,
        email: body.customerEmail.trim().toLowerCase(),
        phone: body.customerPhone.trim().slice(0, 20),
        date: body.date,
        time: body.time.length === 5 ? body.time : body.time.slice(0, 5),
        service: service.name,
        notes: (body.notes ?? "").trim() || undefined,
        metadata: {
          style: style?.name,
          stylist: stylist.name,
          duration_min: durationMin,
        },
        origin,
      });

      if (result.status === 422) {
        const message =
          (result.data.message as string) ||
          "Please check your booking details.";
        return Response.json({ error: message, details: result.data }, { status: 422 });
      }

      if (result.status === 403) {
        return Response.json({ error: "Unauthorized" }, { status: 403 });
      }

      if (result.status === 201 || result.ok) {
        provider = "sisgesc";
        const apt = (result.data.appointment ?? {}) as Record<string, unknown>;
        if (apt.id != null) externalId = String(apt.id);
        payment = (result.data.payment as Record<string, unknown>) ?? null;
        remoteMessage = String(result.data.message ?? "");
      } else {
        console.error("SISGESC appointment error", result.status, result.data);
      }
    } catch (error) {
      console.error("SISGESC appointment request failed", error);
    }
  }

  const appointment: Appointment = {
    id: createId("apt"),
    reference: createReference(),
    serviceId: service.id,
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
