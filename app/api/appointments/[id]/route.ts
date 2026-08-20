import { NextRequest } from "next/server";
import { updateStore } from "@/lib/store";
import { getAvailableSlots } from "@/lib/availability";
import type { AppointmentStatus } from "@/lib/types";

export async function PATCH(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const body = (await request.json()) as {
    status?: AppointmentStatus;
    date?: string;
    time?: string;
    email?: string;
    favoriteStyleId?: string;
    notes?: string;
  };

  const store = await updateStore((current) => {
    const apt = current.appointments.find((a) => a.id === id);
    if (!apt) return current;

    if (body.email && body.email.toLowerCase() !== apt.customerEmail) {
      return current;
    }

    if (body.date && body.time) {
      const stylist = current.stylists.find((s) => s.id === apt.stylistId);
      if (stylist) {
        const slots = getAvailableSlots({
          stylist,
          date: body.date,
          durationMin: apt.durationMin,
          appointments: current.appointments.filter((a) => a.id !== apt.id),
        });
        if (!slots.includes(body.time)) return current;
        apt.date = body.date;
        apt.time = body.time;
        if (apt.status === "cancelled") apt.status = "pending";
      }
    }

    if (body.status) apt.status = body.status;
    if (typeof body.notes === "string") apt.notes = body.notes;
    apt.updatedAt = new Date().toISOString();

    if (body.favoriteStyleId) {
      const customer = current.customers.find(
        (c) => c.email === apt.customerEmail,
      );
      if (customer && !customer.favoriteStyleIds.includes(body.favoriteStyleId)) {
        customer.favoriteStyleIds.push(body.favoriteStyleId);
      }
    }

    return {
      ...current,
      appointments: current.appointments.map((a) => (a.id === id ? apt : a)),
    };
  });

  const appointment = store.appointments.find((a) => a.id === id);
  if (!appointment) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return Response.json({ appointment });
}
