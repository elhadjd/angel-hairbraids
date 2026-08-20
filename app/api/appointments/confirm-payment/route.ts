import { NextRequest } from "next/server";
import { confirmSiteAppointmentPayment, isSiteApiConfigured } from "@/lib/sisgesc";
import { updateStore } from "@/lib/store";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as {
    appointment_id?: number | string;
    session_id?: string;
  };

  const appointmentId = Number(body.appointment_id);
  const sessionId = String(body.session_id ?? "").trim();

  if (!appointmentId || !sessionId) {
    return Response.json(
      {
        message: "appointment_id and session_id are required.",
        errors: {
          appointment_id: !appointmentId ? ["The appointment id field is required."] : undefined,
          session_id: !sessionId ? ["The session id field is required."] : undefined,
        },
      },
      { status: 422 },
    );
  }

  if (!isSiteApiConfigured()) {
    await markLocalPaid(String(appointmentId));
    return Response.json({
      success: true,
      message: "Appointment deposit payment confirmed.",
      payment: { status: "paid" },
    });
  }

  const result = await confirmSiteAppointmentPayment({
    appointmentId,
    sessionId,
  });

  if (result.status === 422) {
    return Response.json(result.data, { status: 422 });
  }
  if (!result.ok) {
    return Response.json(
      result.data.message
        ? result.data
        : { success: false, message: "Could not confirm deposit payment." },
      { status: result.status || 500 },
    );
  }

  await markLocalPaid(String(appointmentId));
  return Response.json(result.data, { status: 200 });
}

async function markLocalPaid(externalId: string) {
  await updateStore((current) => ({
    ...current,
    appointments: current.appointments.map((a) =>
      a.externalId === externalId
        ? {
            ...a,
            status: "confirmed",
            deposit: { ...a.deposit, status: "paid" },
            updatedAt: new Date().toISOString(),
          }
        : a,
    ),
  }));
}
