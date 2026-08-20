import { NextRequest } from "next/server";
import { readStore } from "@/lib/store";
import { getAvailableSlots, getSalonSlots } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const stylistId = searchParams.get("stylistId");
  const serviceId = searchParams.get("serviceId");
  const date = searchParams.get("date");
  const duration = Number(searchParams.get("duration") ?? 180);

  if (!date) {
    return Response.json({ error: "Missing date" }, { status: 400 });
  }

  const store = await readStore();

  if (stylistId) {
    const stylist = store.stylists.find((s) => s.id === stylistId);
    if (!stylist) {
      return Response.json({ error: "Stylist not found" }, { status: 404 });
    }
    return Response.json({
      slots: getAvailableSlots({
        stylist,
        date,
        durationMin: duration,
        appointments: store.appointments,
      }),
    });
  }

  return Response.json({
    slots: getSalonSlots({
      stylists: store.stylists,
      date,
      durationMin: duration,
      appointments: store.appointments,
      serviceId,
    }),
  });
}
