import { NextRequest } from "next/server";
import { createId, createReference, readStore, updateStore } from "@/lib/store";
import { confirmationHtml, sendConfirmationEmail } from "@/lib/email";
import { getAvailableSlots } from "@/lib/availability";
import type { Appointment, BookingPayload } from "@/lib/types";

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
    "stylistId",
    "date",
    "time",
    "customerName",
    "customerPhone",
    "customerEmail",
  ] as const;

  for (const key of required) {
    if (!body[key]) {
      return Response.json({ error: `Missing ${key}` }, { status: 400 });
    }
  }

  const store = await readStore();
  const service = store.services.find((s) => s.id === body.serviceId);
  const stylist = store.stylists.find((s) => s.id === body.stylistId);
  const style = body.styleId
    ? store.styles.find((s) => s.id === body.styleId)
    : null;

  if (!service || !stylist) {
    return Response.json({ error: "Invalid service or stylist" }, { status: 400 });
  }

  const durationMin = style?.durationMin ?? service.durationMin;
  const price = style?.priceFrom ?? service.priceFrom;
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
    customerName: body.customerName.trim(),
    customerPhone: body.customerPhone.trim(),
    customerEmail: body.customerEmail.trim().toLowerCase(),
    notes: (body.notes ?? "").trim(),
    deposit: {
      required: true,
      amount: Math.min(50, Math.round(price * 0.15)),
      status: "unpaid",
    },
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

  return Response.json({ appointment });
}
