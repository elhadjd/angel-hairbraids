import { NextRequest } from "next/server";
import { readStore } from "@/lib/store";
import { getAvailableSlots } from "@/lib/availability";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const stylistId = searchParams.get("stylistId");
  const date = searchParams.get("date");
  const duration = Number(searchParams.get("duration") ?? 180);

  if (!stylistId || !date) {
    return Response.json({ error: "Missing stylist or date" }, { status: 400 });
  }

  const store = await readStore();
  const stylist = store.stylists.find((s) => s.id === stylistId);
  if (!stylist) {
    return Response.json({ error: "Stylist not found" }, { status: 404 });
  }

  const slots = getAvailableSlots({
    stylist,
    date,
    durationMin: duration,
    appointments: store.appointments,
  });

  return Response.json({ slots });
}
